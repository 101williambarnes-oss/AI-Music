import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import defaultArtwork from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";

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
  currentFileUrl: string | null;
  isPlaying: boolean;
  isPlayingIntro: boolean;
  play: (trackId: number, fileUrl: string, meta?: TrackMeta, options?: PlayOptions) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggle: (trackId?: number, fileUrl?: string, meta?: TrackMeta, options?: PlayOptions) => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setOnEnded: (cb: OnEndedCallback | null) => void;
  setVolume: (v: number) => void;
  getVolume: () => number;
};

const AudioPlayerContext = createContext<AudioPlayerState>({
  currentTrackId: null,
  currentFileUrl: null,
  isPlaying: false,
  isPlayingIntro: false,
  play: () => {},
  pause: () => {},
  resume: () => {},
  stop: () => {},
  toggle: () => {},
  seek: () => {},
  getCurrentTime: () => 0,
  getDuration: () => 0,
  setOnEnded: () => {},
  setVolume: () => {},
  getVolume: () => 1,
});

const SILENCE_DATA_URI = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const audioRef = useRef<HTMLVideoElement | null>(null);
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
  const primedRef = useRef(false);

  const setOnEnded = useCallback((cb: OnEndedCallback | null) => {
    onEndedRef.current = cb;
  }, []);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const primeAudio = useCallback((audio: HTMLVideoElement) => {
    if (primedRef.current) return;
    primedRef.current = true;
    audio.src = SILENCE_DATA_URI;
    audio.load();
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {});
  }, []);

  const loadAndPlay = useCallback((audio: HTMLVideoElement, url: string) => {
    audio.oncanplay = null;
    audio.onerror = null;
    loadingRef.current = true;

    if (!url || url === "undefined") {
      loadingRef.current = false;
      setIsPlaying(false);
      return;
    }

    audio.src = url;
    audio.load();

    let settled = false;

    const doPlay = () => {
      if (settled) return;
      settled = true;
      audio.oncanplay = null;
      audio.onerror = null;
      loadingRef.current = false;
      audio.play().catch(() => {
        setIsPlaying(false);
        loadingRef.current = false;
      });
    };

    const onError = () => {
      if (settled) return;
      settled = true;
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

    setTimeout(() => {
      if (!settled) {
        onError();
      }
    }, 15000);

    audio.oncanplay = doPlay;
    audio.onerror = onError;
  }, []);

  useEffect(() => {
    const audio = document.createElement("video");
    audio.setAttribute("playsinline", "true");
    audio.preload = "auto";
    audio.style.display = "none";
    document.body.appendChild(audio);
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

    return () => { audio.pause(); audio.remove(); };
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

    primeAudio(audio);
    cancelPendingFetch();

    const isNewTrack = currentTrackIdRef.current !== trackId;
    currentTrackIdRef.current = trackId;
    setCurrentTrackId(trackId);
    setCurrentFileUrl(fileUrl);
    setIsPlaying(true);

    if (isNewTrack && "mediaSession" in navigator) {
      const artworkSrc = meta?.coverUrl || defaultArtwork;
      const artwork: MediaImage[] = [
        { src: artworkSrc, sizes: "512x512", type: "image/png" },
      ];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta?.title || "Unknown Track",
        artist: meta?.artist || "Unknown Artist",
        album: "Hit Wave Media",
        artwork,
      });
    }

    if (!isNewTrack) {
      if (audio.src && !audio.src.startsWith("data:") && audio.readyState >= 2) {
        audio.play().catch(() => setIsPlaying(false));
      } else if (audio.src && !audio.src.startsWith("data:")) {
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
      pendingSongUrlRef.current = fileUrl;

      if (meta?.djIntroUrl === undefined || meta?.djIntroUrl === null) {
        playingIntroRef.current = true;
        setIsPlayingIntro(true);

        loadAndPlay(audio, fileUrl);

        const abortController = new AbortController();
        fetchAbortRef.current = abortController;

        fetch(`/api/tracks/${trackId}/dj-intro`, {
          method: "POST",
          signal: abortController.signal,
        })
          .then(r => r.json())
          .then(data => {
            if (data?.djIntroUrl && currentTrackIdRef.current === trackId) {
              generatedIntrosRef.current.set(trackId, data.djIntroUrl);
              playedIntrosRef.current.add(trackId);
            }
          })
          .catch(() => {});

        playingIntroRef.current = false;
        setIsPlayingIntro(false);
        pendingSongUrlRef.current = null;
        return;
      }

      playingIntroRef.current = true;
      setIsPlayingIntro(true);

      const abortController = new AbortController();
      fetchAbortRef.current = abortController;

      fetch(`/api/tracks/${trackId}/dj-intro`, {
        method: "POST",
        signal: abortController.signal,
      })
        .then(r => r.json())
        .then(data => {
          if (data?.djIntroUrl && currentTrackIdRef.current === trackId) {
            generatedIntrosRef.current.set(trackId, data.djIntroUrl);
            playedIntrosRef.current.add(trackId);
            loadAndPlay(audio, data.djIntroUrl);
          } else if (currentTrackIdRef.current === trackId) {
            playingIntroRef.current = false;
            setIsPlayingIntro(false);
            pendingSongUrlRef.current = null;
            loadAndPlay(audio, fileUrl);
          }
        })
        .catch(() => {
          if (currentTrackIdRef.current === trackId) {
            playingIntroRef.current = false;
            setIsPlayingIntro(false);
            pendingSongUrlRef.current = null;
            loadAndPlay(audio, fileUrl);
          }
        });
      return;
    }

    if (djIntroUrl && !alreadyPlayedIntro) {
      playedIntrosRef.current.add(trackId);
      playingIntroRef.current = true;
      pendingSongUrlRef.current = fileUrl;
      setIsPlayingIntro(true);
      loadAndPlay(audio, djIntroUrl);
      return;
    }

    loadAndPlay(audio, fileUrl);
  }, [loadAndPlay, countPlay, cancelPendingFetch, primeAudio]);

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

  const toggle = useCallback((trackId?: number, fileUrl?: string, meta?: TrackMeta, options?: PlayOptions) => {
    const audio = audioRef.current;

    if (trackId === undefined || fileUrl === undefined) {
      if (isPlayingRef.current) {
        if (loadingRef.current) {
          stop();
        } else {
          pause();
        }
      } else if (audio && audio.src && !audio.src.startsWith("data:")) {
        setIsPlaying(true);
        audio.play().catch(() => setIsPlaying(false));
      }
      return;
    }

    if (currentTrackIdRef.current === trackId && isPlayingRef.current) {
      if (loadingRef.current) {
        stop();
        return;
      }
      pause();
    } else if (currentTrackIdRef.current === trackId && !isPlayingRef.current) {
      if (!audio?.src || audio.src === "" || audio.src.startsWith("data:") || audio.readyState < 1) {
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

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.src && !audio.src.startsWith("data:")) {
      setIsPlaying(true);
      audio.play().catch(() => setIsPlaying(false));
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = Math.max(0, Math.min(1, v));
  }, []);

  const getVolume = useCallback(() => {
    return audioRef.current?.volume ?? 1;
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ currentTrackId, currentFileUrl, isPlaying, isPlayingIntro, play, pause, resume, stop, toggle, seek, getCurrentTime, getDuration, setOnEnded, setVolume, getVolume }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
