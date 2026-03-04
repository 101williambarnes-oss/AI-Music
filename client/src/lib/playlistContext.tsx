import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { type Track } from "@shared/schema";
import { useAudioPlayer } from "@/lib/audioPlayer";

type PlaylistState = {
  tracks: Track[];
  addTrack: (track: Track) => void;
  removeTrack: (trackId: number) => void;
  clearPlaylist: () => void;
  isInPlaylist: (trackId: number) => boolean;
  moveTrack: (fromIndex: number, toIndex: number) => void;
  getNextTrack: (currentTrackId: number) => Track | null;
};

const STORAGE_KEY = "hwm_playlist";

function loadPlaylist(): Track[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function savePlaylist(tracks: Track[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch {}
}

const PlaylistContext = createContext<PlaylistState>({
  tracks: [],
  addTrack: () => {},
  removeTrack: () => {},
  clearPlaylist: () => {},
  isInPlaylist: () => false,
  moveTrack: () => {},
  getNextTrack: () => null,
});

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>(loadPlaylist);
  const { play, setOnEnded } = useAudioPlayer();
  const tracksRef = useRef<Track[]>(tracks);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    savePlaylist(tracks);
  }, [tracks]);

  useEffect(() => {
    const cb = (trackId: number) => {
      const current = tracksRef.current;
      const idx = current.findIndex((t) => t.id === trackId);
      if (idx !== -1 && idx < current.length - 1) {
        const next = current[idx + 1];
        if (next.fileUrl) {
          play(next.id, next.fileUrl, { title: next.title, artist: next.artist, coverUrl: next.coverUrl });
        }
      }
    };
    setOnEnded(cb);
    return () => setOnEnded(null);
  }, [play, setOnEnded]);

  const addTrack = useCallback((track: Track) => {
    setTracks((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeTrack = useCallback((trackId: number) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const clearPlaylist = useCallback(() => {
    setTracks([]);
  }, []);

  const isInPlaylist = useCallback((trackId: number) => {
    return tracks.some((t) => t.id === trackId);
  }, [tracks]);

  const moveTrack = useCallback((fromIndex: number, toIndex: number) => {
    setTracks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const getNextTrack = useCallback((currentTrackId: number) => {
    const idx = tracks.findIndex((t) => t.id === currentTrackId);
    if (idx === -1 || idx >= tracks.length - 1) return null;
    return tracks[idx + 1];
  }, [tracks]);

  return (
    <PlaylistContext.Provider value={{ tracks, addTrack, removeTrack, clearPlaylist, isInPlaylist, moveTrack, getNextTrack }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  return useContext(PlaylistContext);
}
