import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

type AudioPlayerState = {
  currentTrackId: number | null;
  isPlaying: boolean;
  play: (trackId: number, fileUrl: string) => void;
  pause: () => void;
  toggle: (trackId: number, fileUrl: string) => void;
};

const AudioPlayerContext = createContext<AudioPlayerState>({
  currentTrackId: null,
  isPlaying: false,
  play: () => {},
  pause: () => {},
  toggle: () => {},
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

    if (currentTrackId !== trackId) {
      audio.src = fileUrl;
      audio.load();
    }
    audio.play().then(() => {
      setCurrentTrackId(trackId);
      setIsPlaying(true);
    }).catch(() => {});
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

  return (
    <AudioPlayerContext.Provider value={{ currentTrackId, isPlaying, play, pause, toggle }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
