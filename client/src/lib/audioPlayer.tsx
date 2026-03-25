import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

type TrackMeta = {
  title?: string;
  artist?: string;
  coverUrl?: string | null;
  djIntroUrl?: string | null;
};

type OnEndedCallback = (trackId: number) => void;

type AudioPlayerState = {
  currentTrackId: number | null;
  isPlaying: boolean;
  isPlayingIntro: boolean;
  play: (trackId: number, fileUrl: string, meta?: TrackMeta) => void;
  pause: () => void;
  stop: () => void;
  toggle: (trackId: number, fileUrl: string, meta?: TrackMeta) => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setOnEnded: (cb: OnEndedCallback | null) => void;
};

const AudioPlayerContext = createContext<AudioPlayerState>({
  currentTrackId: null,
  isPlaying: false,
  isPlayingIntro: false,
  play: () => {},
  pause: () => {},
  stop: () => {},
  toggle: () => {},
  seek: () => {},
  getCurrentTime: () => 0,
  getDuration: () => 0,
  setOnEnded: () => {},
});

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIdRef = useRef<number | null>(null);
  const countedPlaysRef = useRef<Set<number>>(new Set());
  const playedIntrosRef = useRef<Set<number>>(new Set());
  const generatedIntrosRef = useRef<Map<number, string>>(new Map());
  const onEndedRef = useRef<OnEndedCallback | null>(null);
  const pendingSongUrlRef = useRef<string | null>(null);

  const setOnEnded = useCallback((cb: OnEndedCallback | null) => {
    onEndedRef.current = cb;
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.setAttribute("playsinline", "true");
    audio.preload = "auto";
    audioRef.current = audio;
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      const tid = currentTrackIdRef.current;
      if (tid !== null && onEndedRef.current) {
        onEndedRef.current(tid);
      }
    });

    const introAudio = new Audio();
    introAudio.setAttribute("playsinline", "true");
    introAudio.preload = "auto";
    introAudioRef.current = introAudio;

    introAudio.addEventListener("ended", () => {
      setIsPlayingIntro(false);
      const songUrl = pendingSongUrlRef.current;
      if (songUrl && audioRef.current) {
        const mainAudio = audioRef.current;
        mainAudio.src = songUrl;
        mainAudio.load();
        const tryPlay = () => {
          mainAudio.play().catch(() => setIsPlaying(false));
        };
        if (mainAudio.readyState >= 2) {
          tryPlay();
        } else {
          mainAudio.addEventListener("canplay", tryPlay, { once: true });
        }
        pendingSongUrlRef.current = null;
      }
    });

    return () => {
      audio.pause();
      introAudio.pause();
    };
  }, []);

  const play = useCallback((trackId: number, fileUrl: string, meta?: TrackMeta) => {
    const audio = audioRef.current;
    const introAudio = introAudioRef.current;
    if (!audio) return;

    const isNewTrack = currentTrackIdRef.current !== trackId;
    currentTrackIdRef.current = trackId;
    setCurrentTrackId(trackId);
    setIsPlaying(true);

    if (isNewTrack && "mediaSession" in navigator) {
      const artwork: MediaImage[] = [];
      if (meta?.coverUrl) {
        artwork.push({ src: meta.coverUrl, sizes: "512x512", type: "image/jpeg" });
      }
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta?.title || "Unknown Track",
        artist: meta?.artist || "Unknown Artist",
        album: "Hit Wave Media",
        artwork,
      });
    }

    if (isNewTrack) {
      audio.pause();
      if (introAudio) introAudio.pause();
      setIsPlayingIntro(false);
      pendingSongUrlRef.current = null;

      let djIntroUrl = meta?.djIntroUrl;
      const alreadyPlayedIntro = playedIntrosRef.current.has(trackId);

      if (!djIntroUrl && !alreadyPlayedIntro) {
        const cached = generatedIntrosRef.current.get(trackId);
        if (cached) {
          djIntroUrl = cached;
        } else {
          audio.src = fileUrl;
          audio.load();
          const tryPlay = () => { audio.play().catch(() => setIsPlaying(false)); };
          if (audio.readyState >= 2) tryPlay();
          else audio.addEventListener("canplay", tryPlay, { once: true });

          fetch(`/api/tracks/${trackId}/dj-intro`, { method: "POST" })
            .then(r => r.json())
            .then(data => {
              if (data?.djIntroUrl) {
                generatedIntrosRef.current.set(trackId, data.djIntroUrl);
              }
            })
            .catch(() => {});
          return;
        }
      }

      if (djIntroUrl && !alreadyPlayedIntro && introAudio) {
        playedIntrosRef.current.add(trackId);
        pendingSongUrlRef.current = fileUrl;
        setIsPlayingIntro(true);
        introAudio.src = djIntroUrl;
        introAudio.load();
        const tryIntro = () => {
          introAudio.play().catch(() => {
            setIsPlayingIntro(false);
            audio.src = fileUrl;
            audio.load();
            const tryMain = () => { audio.play().catch(() => setIsPlaying(false)); };
            if (audio.readyState >= 2) tryMain();
            else audio.addEventListener("canplay", tryMain, { once: true });
          });
        };
        if (introAudio.readyState >= 2) {
          tryIntro();
        } else {
          introAudio.addEventListener("canplay", tryIntro, { once: true });
        }
      } else {
        audio.src = fileUrl;
        audio.load();
        const tryPlay = () => {
          audio.play().catch(() => {
            setIsPlaying(false);
          });
        };
        if (audio.readyState >= 2) {
          tryPlay();
        } else {
          audio.addEventListener("canplay", tryPlay, { once: true });
        }
      }
    } else {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }

    if (isNewTrack && !countedPlaysRef.current.has(trackId)) {
      countedPlaysRef.current.add(trackId);
      fetch(`/api/tracks/${trackId}/play`, { method: "POST" }).then(() => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey as string[];
            return key[0] === "/api/tracks" && (key[1] === "trending" || key[1] === "new" || key[1] === "top25" || key[1] === "all");
          },
        });
      }).catch(() => {});
    }
  }, []);

  const isPlayingIntroRef = useRef(false);
  useEffect(() => { isPlayingIntroRef.current = isPlayingIntro; }, [isPlayingIntro]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    const introAudio = introAudioRef.current;
    if (isPlayingIntroRef.current && introAudio) {
      introAudio.pause();
    } else if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    const introAudio = introAudioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    if (introAudio) { introAudio.pause(); introAudio.currentTime = 0; }
    setIsPlaying(false);
    setIsPlayingIntro(false);
    pendingSongUrlRef.current = null;
  }, []);

  const isPlayingRef = useRef(false);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const toggle = useCallback((trackId: number, fileUrl: string, meta?: TrackMeta) => {
    if (currentTrackIdRef.current === trackId && isPlayingRef.current) {
      pause();
    } else if (currentTrackIdRef.current === trackId && !isPlayingRef.current) {
      setIsPlaying(true);
      if (isPlayingIntroRef.current && introAudioRef.current) {
        introAudioRef.current.play().catch(() => setIsPlaying(false));
      } else if (audioRef.current) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    } else {
      play(trackId, fileUrl, meta);
    }
  }, [play, pause]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
  }, []);

  const getCurrentTime = useCallback(() => {
    return audioRef.current?.currentTime ?? 0;
  }, []);

  const getDuration = useCallback(() => {
    return audioRef.current?.duration ?? 0;
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ currentTrackId, isPlaying, isPlayingIntro, play, pause, stop, toggle, seek, getCurrentTime, getDuration, setOnEnded }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
