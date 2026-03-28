import { useState, useRef, useEffect, useCallback } from "react";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { getTrackThumbnail } from "@/lib/utils";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, List, Monitor, Menu } from "lucide-react";

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrackId, currentFileUrl, isPlaying, isPlayingIntro,
    pause, resume, getAudioElement, seek,
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
    let lastAudio: HTMLAudioElement | null = null;

    const onTimeUpdate = () => {
      if (lastAudio) {
        const t = lastAudio.currentTime;
        const d = lastAudio.duration;
        if (isFinite(t)) setProgress(t);
        if (d && isFinite(d) && d > 0) setDuration(d);
      }
    };

    const onMetadata = () => {
      if (lastAudio) {
        const d = lastAudio.duration;
        if (d && isFinite(d) && d > 0) setDuration(d);
      }
    };

    const tick = () => {
      const audio = getAudioElement();
      if (audio !== lastAudio) {
        if (lastAudio) {
          lastAudio.removeEventListener("timeupdate", onTimeUpdate);
          lastAudio.removeEventListener("loadedmetadata", onMetadata);
          lastAudio.removeEventListener("durationchange", onMetadata);
        }
        lastAudio = audio;
        if (audio) {
          audio.addEventListener("timeupdate", onTimeUpdate);
          audio.addEventListener("loadedmetadata", onMetadata);
          audio.addEventListener("durationchange", onMetadata);
        }
      }
      if (audio) {
        const t = audio.currentTime;
        const d = audio.duration;
        if (isFinite(t)) setProgress(t);
        if (d && isFinite(d) && d > 0) setDuration(d);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animRef.current);
      if (lastAudio) {
        lastAudio.removeEventListener("timeupdate", onTimeUpdate);
        lastAudio.removeEventListener("loadedmetadata", onMetadata);
        lastAudio.removeEventListener("durationchange", onMetadata);
      }
    };
  }, [getAudioElement]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pct * duration);
    setProgress(pct * duration);
  }, [duration, seek]);

  const toggleMute = useCallback(() => {
    if (muted) {
      setAudioVolume(prevVolumeRef.current);
      setVolume(prevVolumeRef.current);
      setMuted(false);
    } else {
      prevVolumeRef.current = getVolume();
      setAudioVolume(0);
      setVolume(0);
      setMuted(true);
    }
  }, [muted, setAudioVolume, getVolume]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) pause();
    else resume();
  }, [isPlaying, pause, resume]);

  if (!currentTrackId || !trackMeta) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const displayTitle = isPlayingIntro ? "DJ William Allen" : trackMeta.title;
  const displayArtist = isPlayingIntro ? `Introducing: ${trackMeta.title}` : trackMeta.artist;

  return (
    <div className="player-bar" data-testid="player-bar">
      <div className="player-bar-inner">
        <div className="player-bar-left-section">
          <div className="player-bar-art" data-testid="player-bar-track-info">
            {(() => {
              const thumb = getTrackThumbnail({ coverUrl: trackMeta.coverUrl, fileUrl: currentFileUrl });
              if (thumb) {
                return <img src={thumb} alt={trackMeta.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
              }
              return <div className="player-bar-art-placeholder" />;
            })()}
          </div>
          <div className="player-bar-info">
            <div className="player-bar-title" data-testid="player-bar-title">
              {displayTitle} <span className="player-bar-dash">-</span> <span className="player-bar-artist-name">{displayArtist}</span>
            </div>
            <div className="player-bar-time-text" data-testid="player-bar-time-current">
              {formatTime(progress)} / {formatTime(duration)}
            </div>
          </div>
          <div className="player-bar-progress-wide" ref={progressRef} onClick={handleProgressClick} data-testid="player-bar-progress">
            <div className="player-bar-progress-fill" style={{ width: `${pct}%` }} />
            <div className="player-bar-progress-thumb" style={{ left: `${pct}%` }} />
          </div>
        </div>

        <div className="player-bar-transport">
          <button onClick={toggleMute} className="player-bar-btn player-bar-ctrl-btn" data-testid="button-player-mute">
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button className="player-bar-btn player-bar-ctrl-btn" data-testid="button-player-prev">
            <SkipBack size={22} />
          </button>
          <button
            onClick={handlePlayPause}
            className="player-bar-btn player-bar-play"
            data-testid="button-player-play"
          >
            {isPlaying ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
          </button>
          <button className="player-bar-btn player-bar-ctrl-btn" data-testid="button-player-next">
            <SkipForward size={22} />
          </button>
          <button className="player-bar-btn player-bar-ctrl-btn" data-testid="button-player-list">
            <List size={20} />
          </button>
        </div>

        <div className="player-bar-right-section">
          <Heart size={20} className="player-bar-heart-icon" fill="#ff4fd8" color="#ff4fd8" />
          <Monitor size={18} className="player-bar-ctrl-icon" />
          <button onClick={toggleMute} className="player-bar-btn player-bar-ctrl-btn" data-testid="button-player-mute-right">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <Menu size={20} className="player-bar-ctrl-icon" />
        </div>
      </div>
    </div>
  );
}
