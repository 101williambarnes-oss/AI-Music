import { useEffect, useRef, useState } from "react";
import { X, Play, Pause, RotateCcw, RotateCw } from "lucide-react";
import { type Track } from "@shared/schema";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { TrackActions } from "@/components/track-actions";

function formatTime(seconds: number) {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoModal({
  track,
  onClose,
}: {
  track: Track;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { currentTrackId, isPlaying, toggle, pause, seek, getCurrentTime, getDuration } = useAudioPlayer();
  const isThisTrack = currentTrackId === track.id;
  const isCurrentlyPlaying = isThisTrack && isPlaying;
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isCurrentlyPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isCurrentlyPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isThisTrack) {
        const t = getCurrentTime();
        const d = getDuration();
        setCurrentTime(t);
        if (d > 0) setDuration(d);
        if (videoRef.current && Math.abs(videoRef.current.currentTime - t) > 0.5) {
          videoRef.current.currentTime = t;
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [isThisTrack, getCurrentTime, getDuration]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "Escape") { pause(); onClose(); }
      if (isInput) return;
      if (e.key === "ArrowLeft") handleSkip(-10);
      if (e.key === "ArrowRight") handleSkip(10);
      if (e.key === " ") { e.preventDefault(); handleToggle(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pause]);

  function handleClose() {
    pause();
    onClose();
  }

  function handleToggle() {
    if (track.fileUrl) {
      toggle(track.id, track.fileUrl);
    }
  }

  function handleSkip(seconds: number) {
    const t = getCurrentTime();
    const d = getDuration();
    if (d <= 0) return;
    const newTime = Math.max(0, Math.min(d, t + seconds));
    seek(newTime);
    setCurrentTime(newTime);
    if (videoRef.current) videoRef.current.currentTime = newTime;
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const d = getDuration();
    if (d <= 0) return;
    const newTime = ratio * d;
    seek(newTime);
    setCurrentTime(newTime);
    if (videoRef.current) videoRef.current.currentTime = newTime;
  }

  function handleDragStart(e: React.MouseEvent<HTMLDivElement>) {
    setIsDragging(true);
    handleProgressClick(e);

    function onMove(ev: MouseEvent) {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const d = getDuration();
      if (d <= 0) return;
      const newTime = ratio * d;
      seek(newTime);
      setCurrentTime(newTime);
      if (videoRef.current) videoRef.current.currentTime = newTime;
    }

    function onUp() {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="video-modal-overlay" onClick={handleClose} data-testid="video-modal-overlay">
      <div className="video-modal" onClick={(e) => e.stopPropagation()} data-testid="video-modal">
        <button className="video-modal-close" onClick={handleClose} data-testid="button-close-video">
          <X style={{ width: 22, height: 22 }} />
        </button>

        <div className="video-modal-scroll" data-testid="video-modal-scroll">
          <div className="video-modal-player" data-testid="video-modal-player">
            <video
              ref={videoRef}
              src={track.fileUrl!}
              muted
              loop
              playsInline
              onClick={handleToggle}
              style={{ width: "100%", height: "100%", objectFit: "contain", cursor: "pointer", background: "#000" }}
              data-testid={`video-modal-video-${track.id}`}
            />
            {!isCurrentlyPlaying && (
              <div className="video-modal-play-overlay" onClick={handleToggle} data-testid="button-video-play-overlay">
                <Play style={{ width: 48, height: 48, color: "rgba(234,240,255,.9)", fill: "rgba(234,240,255,.9)" }} />
              </div>
            )}
          </div>

          <div className="video-controls" data-testid="video-controls">
            <div
              className="video-progress-bar"
              ref={progressRef}
              onClick={handleProgressClick}
              onMouseDown={handleDragStart}
              data-testid="video-progress-bar"
            >
              <div className="video-progress-track">
                <div className="video-progress-fill" style={{ width: `${progress}%` }} />
                <div className="video-progress-handle" style={{ left: `${progress}%` }} data-testid="video-progress-handle" />
              </div>
            </div>
            <div className="video-controls-row">
              <span className="video-time" data-testid="text-video-current-time">{formatTime(currentTime)}</span>
              <div className="video-controls-buttons">
                <button className="video-ctrl-btn" onClick={() => handleSkip(-10)} title="Rewind 10s" data-testid="button-rewind">
                  <RotateCcw style={{ width: 18, height: 18 }} />
                  <span className="video-ctrl-label">10</span>
                </button>
                <button className="video-ctrl-btn video-ctrl-play" onClick={handleToggle} title={isCurrentlyPlaying ? "Pause" : "Play"} data-testid="button-pause-play">
                  {isCurrentlyPlaying ? (
                    <Pause style={{ width: 22, height: 22, fill: "currentColor" }} />
                  ) : (
                    <Play style={{ width: 22, height: 22, fill: "currentColor" }} />
                  )}
                </button>
                <button className="video-ctrl-btn" onClick={() => handleSkip(10)} title="Forward 10s" data-testid="button-forward">
                  <RotateCw style={{ width: 18, height: 18 }} />
                  <span className="video-ctrl-label">10</span>
                </button>
              </div>
              <span className="video-time" data-testid="text-video-duration">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="video-modal-info" data-testid="video-modal-info">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="video-modal-title" data-testid={`text-modal-title-${track.id}`}>{track.title}</div>
              <div className="video-modal-artist" data-testid={`text-modal-artist-${track.id}`}>{track.artist}</div>
            </div>
            {track.creatorId && (
              <a
                href={`/creator/${track.creatorId}`}
                className="video-modal-library-btn"
                data-testid={`link-full-library-${track.id}`}
              >
                See Full Library
              </a>
            )}
          </div>

          <div className="video-modal-bottom">
            <TrackActions track={track} />
          </div>
        </div>
      </div>
    </div>
  );
}
