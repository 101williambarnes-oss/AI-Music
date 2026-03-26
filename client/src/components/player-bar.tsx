import { useState, useRef, useEffect, useCallback } from "react";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrackId, isPlaying, isPlayingIntro,
    pause, resume, getCurrentTime, getDuration, seek,
    setVolume: setAudioVolume, getVolume,
  } = useAudioPlayer();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [trackMeta, setTrackMeta] = useState<{ title: string; artist: string; coverUrl: string | null } | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const lastTrackIdRef = useRef<number | null>(null);
  const prevVolumeRef = useRef(1);

  useEffect(() => {
    if (currentTrackId && currentTrackId !== lastTrackIdRef.current) {
      lastTrackIdRef.current = currentTrackId;
      fetch(`/api/track/${currentTrackId}`)
        .then(r => r.json())
        .then(data => {
          if (data?.track) {
            setTrackMeta({
              title: data.track.title,
              artist: data.track.artist,
              coverUrl: data.track.coverUrl,
            });
          }
        })
        .catch(() => {});
    }
  }, [currentTrackId]);

  useEffect(() => {
    const tick = () => {
      setProgress(getCurrentTime());
      setDuration(getDuration());
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [getCurrentTime, getDuration]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pct * duration);
    setProgress(pct * duration);
  }, [duration, seek]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setMuted(v === 0);
    setAudioVolume(v);
    if (v > 0) prevVolumeRef.current = v;
  }, [setAudioVolume]);

  const toggleMute = useCallback(() => {
    if (muted) {
      const restored = prevVolumeRef.current || 1;
      setMuted(false);
      setVolume(restored);
      setAudioVolume(restored);
    } else {
      prevVolumeRef.current = volume;
      setMuted(true);
      setVolume(0);
      setAudioVolume(0);
    }
  }, [muted, volume, setAudioVolume]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);

  if (!currentTrackId || !trackMeta) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="player-bar" data-testid="player-bar">
      <div className="player-bar-inner">
        <div className="player-bar-track" data-testid="player-bar-track-info">
          <div className="player-bar-art">
            {trackMeta.coverUrl ? (
              <img src={trackMeta.coverUrl} alt={trackMeta.title} />
            ) : (
              <div className="player-bar-art-placeholder" />
            )}
          </div>
          <div className="player-bar-info">
            <div className="player-bar-title" data-testid="player-bar-title">
              {isPlayingIntro ? "DJ William Allen" : trackMeta.title}
            </div>
            <div className="player-bar-artist" data-testid="player-bar-artist">
              {isPlayingIntro ? `Introducing: ${trackMeta.title}` : trackMeta.artist}
            </div>
          </div>
        </div>

        <div className="player-bar-center">
          <div className="player-bar-controls">
            <button className="player-bar-btn player-bar-skip-btn" data-testid="button-player-prev">
              <SkipBack size={18} />
            </button>
            <button
              onClick={handlePlayPause}
              className="player-bar-btn player-bar-play"
              data-testid="button-player-play"
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 2 }} />}
            </button>
            <button className="player-bar-btn player-bar-skip-btn" data-testid="button-player-next">
              <SkipForward size={18} />
            </button>
          </div>
          <div className="player-bar-progress-row">
            <span className="player-bar-time" data-testid="player-bar-time-current">{formatTime(progress)}</span>
            <div className="player-bar-progress" ref={progressRef} onClick={handleProgressClick} data-testid="player-bar-progress">
              <div className="player-bar-progress-fill" style={{ width: `${pct}%` }} />
              <div className="player-bar-progress-thumb" style={{ left: `${pct}%` }} />
            </div>
            <span className="player-bar-time" data-testid="player-bar-time-total">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-bar-right">
          <div className="player-bar-volume">
            <button onClick={toggleMute} className="player-bar-btn" data-testid="button-player-mute">
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="player-bar-volume-slider"
              data-testid="input-player-volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
