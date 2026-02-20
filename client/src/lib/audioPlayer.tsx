import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

type AudioPlayerState = {
  currentTrackId: number | null;
  isPlaying: boolean;
  play: (trackId: number, fileUrl: string) => void;
  pause: () => void;
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
  toggle: () => {},
  seek: () => {},
  getCurrentTime: () => 0,
  getDuration: () => 0,
});

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });
    return () => {
      audio.pause();
      audio.removeEventListener("ended", () => {});
    };
  }, []);

  const play = useCallback((trackId: number, fileUrl: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    const isNewTrack = currentTrackId !== trackId;
    if (isNewTrack) {
      audio.src = fileUrl;
      audio.load();
    }
    setCurrentTrackId(trackId);
    setIsPlaying(true);
    audio.play().catch(() => {});
    if (isNewTrack) {
      fetch(`/api/tracks/${trackId}/play`, { method: "POST" }).then(() => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey as string[];
            return key[0] === "/api/tracks" && (key[1] === "trending" || key[1] === "new" || key[1] === "top25" || key.length === 1);
          },
        });
      }).catch(() => {});
    }
  }, [currentTrackId]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback((trackId: number, fileUrl: string) => {
    if (currentTrackId === trackId && isPlaying) {
      pause();
    } else {
      play(trackId, fileUrl);
    }
  }, [currentTrackId, isPlaying, play, pause]);

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
    <AudioPlayerContext.Provider value={{ currentTrackId, isPlaying, play, pause, toggle, seek, getCurrentTime, getDuration }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
