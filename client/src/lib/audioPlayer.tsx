import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

type TrackMeta = {
  title?: string;
  artist?: string;
  coverUrl?: string | null;
  djIntroUrl?: string | null;
};

type OnEndedCallback = (trackId: number) => void;

type PlayOptions = {
  skipIntro?: boolean;
};

type AudioPlayerState = {
  currentTrackId: number | null;
  isPlaying: boolean;
  isPlayingIntro: boolean;
  play: (trackId: number, fileUrl: string, meta?: TrackMeta, options?: PlayOptions) => void;
  pause: () => void;
  stop: () => void;
  toggle: (trackId: number, fileUrl: string, meta?: TrackMeta, options?: PlayOptions) => void;
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
  const currentTrackIdRef = useRef<number | null>(null);
  const countedPlaysRef = useRef<Set<number>>(new Set());
  const playedIntrosRef = useRef<Set<number>>(new Set());
  const generatedIntrosRef = useRef<Map<number, string>>(new Map());
  const onEndedRef = useRef<OnEndedCallback | null>(null);
  const pendingSongUrlRef = useRef<string | null>(null);
  const playingIntroRef = useRef(false);
  const isPlayingRef = useRef(false);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);

  const setOnEnded = useCallback((cb: OnEndedCallback | null) => {
    onEndedRef.current = cb;
  }, []);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const loadAndPlay = useCallback((audio: HTMLAudioElement, url: string) => {
    audio.oncanplay = null;
    audio.onerror = null;
    loadingRef.current = true;

    audio.src = url;
    audio.load();

    const doPlay = () => {
      audio.oncanplay = null;
      audio.onerror = null;
      loadingRef.current = false;
      audio.play().catch(() => {
        setIsPlaying(false);
        loadingRef.current = false;
      });
    };

    const onError = () => {
      audio.oncanplay = null;
      audio.onerror = null;
      loadingRef.current = false;
      if (playingIntroRef.current) {
        playingIntroRef.current = false;
        setIsPlayingIntro(false);
        const songUrl = pendingSongUrlRef.current;
        pendingSongUrlRef.current = null;
        if (songUrl) {
          setIsPlaying(true);
          loadAndPlay(audio, songUrl);
          return;
        }
      }
      setIsPlaying(false);
    };

    if (audio.readyState >= 2) {
      doPlay();
    } else {
      audio.oncanplay = doPlay;
      audio.onerror = onError;
    }
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.setAttribute("playsinline", "true");
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("ended", () => {
      if (playingIntroRef.current) {
        playingIntroRef.current = false;
        setIsPlayingIntro(false);
        const songUrl = pendingSongUrlRef.current;
        pendingSongUrlRef.current = null;
        if (songUrl) {
          loadAndPlay(audio, songUrl);
        } else {
          setIsPlaying(false);
        }
        return;
      }
      setIsPlaying(false);
      const tid = currentTrackIdRef.current;
      if (tid !== null && onEndedRef.current) {
        onEndedRef.current(tid);
      }
    });

    audio.addEventListener("pause", () => {
      if (!playingIntroRef.current && !loadingRef.current) {
        setIsPlaying(false);
      }
    });

    audio.addEventListener("play", () => {
      setIsPlaying(true);
    });

    return () => { audio.pause(); };
  }, [loadAndPlay]);

  const countPlay = useCallback((trackId: number) => {
    if (countedPlaysRef.current.has(trackId)) return;
    countedPlaysRef.current.add(trackId);
    fetch(`/api/tracks/${trackId}/play`, { method: "POST" }).then(() => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as string[];
          return key[0] === "/api/tracks" && (key[1] === "trending" || key[1] === "new" || key[1] === "top25" || key[1] === "all");
        },
      });
    }).catch(() => {});
  }, []);

  const cancelPendingFetch = useCallback(() => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
      fetchAbortRef.current = null;
    }
  }, []);

  const play = useCallback((trackId: number, fileUrl: string, meta?: TrackMeta, options?: PlayOptions) => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelPendingFetch();

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

    if (!isNewTrack) {
      if (audio.src && audio.readyState >= 2) {
        audio.play().catch(() => setIsPlaying(false));
      } else if (audio.src) {
        audio.oncanplay = () => {
          audio.oncanplay = null;
          audio.onerror = null;
          audio.play().catch(() => setIsPlaying(false));
        };
        audio.onerror = () => {
          audio.oncanplay = null;
          audio.onerror = null;
          loadingRef.current = false;
          setIsPlaying(false);
        };
      } else {
        loadAndPlay(audio, fileUrl);
      }
      return;
    }

    audio.pause();
    audio.oncanplay = null;
    audio.onerror = null;
    playingIntroRef.current = false;
    setIsPlayingIntro(false);
    pendingSongUrlRef.current = null;
    loadingRef.current = false;

    countPlay(trackId);

    if (options?.skipIntro) {
      loadAndPlay(audio, fileUrl);
      return;
    }

    let djIntroUrl = meta?.djIntroUrl;
    const alreadyPlayedIntro = playedIntrosRef.current.has(trackId);

    if (!djIntroUrl && !alreadyPlayedIntro) {
      const cached = generatedIntrosRef.current.get(trackId);
      if (cached) {
        djIntroUrl = cached;
      }
    }

    if (!djIntroUrl && !alreadyPlayedIntro) {
      loadAndPlay(audio, fileUrl);
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

    if (djIntroUrl && !alreadyPlayedIntro) {
      if (Math.random() < 0.2) {
        loadAndPlay(audio, fileUrl);

        const abortController = new AbortController();
        fetchAbortRef.current = abortController;

        fetch(`/api/tracks/${trackId}/dj-short-intro`, {
          method: "POST",
          signal: abortController.signal,
        })
          .then(r => r.json())
          .then(data => {
            if (data?.djIntroUrl) {
              generatedIntrosRef.current.set(trackId, data.djIntroUrl);
            }
          })
          .catch(() => {});
        return;
      }

      playedIntrosRef.current.add(trackId);
      playingIntroRef.current = true;
      pendingSongUrlRef.current = fileUrl;
      setIsPlayingIntro(true);
      loadAndPlay(audio, djIntroUrl);
      return;
    }

    loadAndPlay(audio, fileUrl);
  }, [loadAndPlay, countPlay, cancelPendingFetch]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.oncanplay = null;
      audio.onerror = null;
    }
    cancelPendingFetch();
    playingIntroRef.current = false;
    setIsPlaying(false);
    setIsPlayingIntro(false);
    pendingSongUrlRef.current = null;
    loadingRef.current = false;
  }, [cancelPendingFetch]);

  const toggle = useCallback((trackId: number, fileUrl: string, meta?: TrackMeta, options?: PlayOptions) => {
    const audio = audioRef.current;

    if (currentTrackIdRef.current === trackId && isPlayingRef.current) {
      if (loadingRef.current) {
        stop();
        return;
      }
      pause();
    } else if (currentTrackIdRef.current === trackId && !isPlayingRef.current) {
      if (!audio?.src || audio.src === "" || audio.readyState < 1) {
        play(trackId, fileUrl, meta, options);
      } else {
        setIsPlaying(true);
        audio.play().catch(() => {
          play(trackId, fileUrl, meta, options);
        });
      }
    } else {
      play(trackId, fileUrl, meta, options);
    }
  }, [play, pause, stop]);

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
