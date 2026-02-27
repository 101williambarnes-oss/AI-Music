import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

type AudioPlayerState = {
  currentTrackId: number | null;
  isPlaying: boolean;
  play: (trackId: number, fileUrl: string) => void;
  pause: () => void;
  stop: () => void;
  toggle: (trackId: number, fileUrl: string) => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
};

const AudioPlayerContext = createContext<AudioPlayerState>({
  currentTrackId: null,
  isPlaying: false,
  play: () => {},
  pause: () => {},
  stop: () => {},
  toggle: () => {},
  seek: () => {},
  getCurrentTime: () => 0,
  getDuration: () => 0,
});

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIdRef = useRef<number | null>(null);
  const countedPlaysRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const audio = new Audio();
    audio.setAttribute("playsinline", "true");
    audio.preload = "auto";
    audioRef.current = audio;
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });
    return () => {
      audio.pause();
    };
  }, []);

  const play = useCallback((trackId: number, fileUrl: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    const isNewTrack = currentTrackIdRef.current !== trackId;
    currentTrackIdRef.current = trackId;
    setCurrentTrackId(trackId);
    setIsPlaying(true);

    if (isNewTrack) {
      audio.pause();
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

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }, []);

  const isPlayingRef = useRef(false);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const toggle = useCallback((trackId: number, fileUrl: string) => {
    if (currentTrackIdRef.current === trackId && isPlayingRef.current) {
      pause();
    } else {
      play(trackId, fileUrl);
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
    <AudioPlayerContext.Provider value={{ currentTrackId, isPlaying, play, pause, stop, toggle, seek, getCurrentTime, getDuration }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
