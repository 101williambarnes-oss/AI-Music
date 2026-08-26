import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
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
  currentTime: number;
  audioDuration: number;
  play: (trackId: number, fileUrl: string, meta?: TrackMeta, options?: PlayOptions) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  toggle: (trackId?: number, fileUrl?: string, meta?: TrackMeta, options?: PlayOptions) => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getAudioElement: () => HTMLAudioElement | null;
  setOnEnded: (cb: OnEndedCallback | null) => void;
  setVolume: (v: number) => void;
  getVolume: () => number;
};

const AudioPlayerContext = createContext<AudioPlayerState>({
  currentTrackId: null,
  currentFileUrl: null,
  isPlaying: false,
  isPlayingIntro: false,
  currentTime: 0,
  audioDuration: 0,
  play: () => {},
  pause: () => {},
  resume: () => {},
  stop: () => {},
  toggle: () => {},
  seek: () => {},
  getCurrentTime: () => 0,
  getDuration: () => 0,
  getAudioElement: () => null,
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIdRef = useRef<number | null>(null);
  const countedPlaysRef = useRef<Set<number>>(new Set());
  const playedIntrosRef = useRef<Set<number>>(new Set());
  const generatedIntrosRef = useRef<Map<number, string>>(new Map());
  const onEndedRef = useRef<OnEndedCallback | null>(null);
  const onEndedStackRef = useRef<OnEndedCallback[]>([]);
  const pendingSongUrlRef = useRef<string | null>(null);
  const playingIntroRef = useRef(false);
  const isPlayingRef = useRef(false);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const primedRef = useRef(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const progressRafRef = useRef<number>(0);

  // Callers register a "track ended" handler for as long as they need it
  // (e.g. the global playlist auto-advance, or an album page's track-order
  // handler) and unregister with setOnEnded(null) on cleanup. Multiple
  // callers can be registered at once (e.g. visiting an album page while a
  // playlist handler is already registered); this stack ensures that
  // unregistering one handler restores whichever handler was active before
  // it, instead of clearing all handlers.
  const setOnEnded = useCallback((cb: OnEndedCallback | null) => {
    if (cb === null) {
      onEndedStackRef.current.pop();
    } else {
      onEndedStackRef.current.push(cb);
    }
    onEndedRef.current = onEndedStackRef.current[onEndedStackRef.current.length - 1] ?? null;
  }, []);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    let prevTime = -1;
    let prevDur = -1;
    const updateProgress = () => {
      const audio = audioRef.current;
      if (audio) {
        const t = audio.currentTime;
        const d = audio.duration;
        if (isFinite(t) && t !== prevTime) {
          prevTime = t;
          setCurrentTime(t);
        }
        if (isFinite(d) && d > 0 && d !== prevDur) {
          prevDur = d;
          setAudioDuration(d);
        }
      }
      progressRafRef.current = requestAnimationFrame(updateProgress);
    };
    progressRafRef.current = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(progressRafRef.current);
  }, []);

  const primeAudio = useCallback((audio: HTMLAudioElement) => {
    if (primedRef.current) return;
    primedRef.current = true;
    audio.src = SILENCE_DATA_URI;
    audio.load();
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {});
  }, []);

  const notifyPlaybackFailed = useCallback(() => {
    if (playingIntroRef.current) return;
    toast({
      title: "Couldn't play this track",
      description: "The audio failed to load. Skipping to the next song if you're playing a playlist.",
      variant: "destructive",
    });
    const tid = currentTrackIdRef.current;
    if (tid !== null && onEndedRef.current) {
      onEndedRef.current(tid);
    }
  }, []);

  const loadAndPlay = useCallback((audio: HTMLAudioElement, url: string) => {
    audio.pause();
    audio.oncanplay = null;
    audio.onerror = null;
    audio.onloadeddata = null;
    loadingRef.current = true;

    if (!url || url === "undefined" || url === "null") {
      console.warn("[HWM Player] No valid URL to play:", url);
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
      audio.onloadeddata = null;
      loadingRef.current = false;
      audio.play().catch((err) => {
        console.warn("[HWM Player] play() rejected:", err?.message);
        setIsPlaying(false);
        loadingRef.current = false;
        notifyPlaybackFailed();
      });
    };

    const onError = () => {
      if (settled) return;
      settled = true;
      audio.oncanplay = null;
      audio.onerror = null;
      audio.onloadeddata = null;
      loadingRef.current = false;
      console.warn("[HWM Player] Error loading:", url);
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
      notifyPlaybackFailed();
    };

    setTimeout(() => {
      if (!settled) {
        console.warn("[HWM Player] Timeout loading, attempting play anyway:", url);
        settled = true;
        audio.oncanplay = null;
        audio.onerror = null;
        audio.onloadeddata = null;
        loadingRef.current = false;
        audio.play().catch(() => {
          setIsPlaying(false);
          notifyPlaybackFailed();
        });
      }
    }, 30000);

    audio.oncanplay = doPlay;
    audio.onloadeddata = doPlay;
    audio.onerror = onError;
  }, [notifyPlaybackFailed]);

  useEffect(() => {
    const audio = document.createElement("audio");
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

    const stopOnLeave = () => {
      audio.pause();
    };
    window.addEventListener("pagehide", stopOnLeave);
    window.addEventListener("beforeunload", stopOnLeave);

    return () => {
      audio.pause();
      window.removeEventListener("pagehide", stopOnLeave);
      window.removeEventListener("beforeunload", stopOnLeave);
    };
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

  const stopAllPageAudio = useCallback(() => {
    document.querySelectorAll("audio, video").forEach((el) => {
      const media = el as HTMLMediaElement;
      if (media !== audioRef.current) {
        media.pause();
        media.src = "";
        media.load();
      }
    });
    window.dispatchEvent(new CustomEvent("hwm-stop-all-audio"));
  }, []);

  const play = useCallback((trackId: number, fileUrl: string, meta?: TrackMeta, options?: PlayOptions) => {
    const audio = audioRef.current;
    if (!audio) return;

    primeAudio(audio);
    cancelPendingFetch();

    const isNewTrack = currentTrackIdRef.current !== trackId;

    audio.pause();
    audio.oncanplay = null;
    audio.onerror = null;
    audio.onloadeddata = null;

    if (isNewTrack) {
      stopAllPageAudio();
    }

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
        audio.play().catch(() => { setIsPlaying(false); notifyPlaybackFailed(); });
      } else if (audio.src && !audio.src.startsWith("data:")) {
        audio.oncanplay = () => {
          audio.oncanplay = null;
          audio.onerror = null;
          audio.play().catch(() => { setIsPlaying(false); notifyPlaybackFailed(); });
        };
        audio.onerror = () => {
          audio.oncanplay = null;
          audio.onerror = null;
          loadingRef.current = false;
          setIsPlaying(false);
          notifyPlaybackFailed();
        };
      } else {
        loadAndPlay(audio, fileUrl);
      }
      return;
    }

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
  }, [loadAndPlay, countPlay, cancelPendingFetch, primeAudio, stopAllPageAudio, notifyPlaybackFailed]);

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
    stopAllPageAudio();
    cancelPendingFetch();
    playingIntroRef.current = false;
    setIsPlaying(false);
    setIsPlayingIntro(false);
    pendingSongUrlRef.current = null;
    loadingRef.current = false;
  }, [cancelPendingFetch, stopAllPageAudio]);

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
    const t = audioRef.current?.currentTime;
    return (t && isFinite(t)) ? t : 0;
  }, []);

  const getDuration = useCallback(() => {
    const d = audioRef.current?.duration;
    return (d && isFinite(d)) ? d : 0;
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

  const getAudioElement = useCallback(() => {
    return audioRef.current;
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ currentTrackId, currentFileUrl, isPlaying, isPlayingIntro, currentTime, audioDuration, play, pause, resume, stop, toggle, seek, getCurrentTime, getDuration, getAudioElement, setOnEnded, setVolume, getVolume }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
