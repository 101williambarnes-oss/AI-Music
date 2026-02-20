import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { type Track } from "@shared/schema";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { TrackActions } from "@/components/track-actions";

export function VideoModal({
  track,
  onClose,
}: {
  track: Track;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentTrackId, isPlaying, toggle, pause } = useAudioPlayer();
  const isThisTrack = currentTrackId === track.id;
  const isCurrentlyPlaying = isThisTrack && isPlaying;

  useEffect(() => {
    if (!videoRef.current) return;
    if (isCurrentlyPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isCurrentlyPlaying]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { pause(); onClose(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleClose() {
    pause();
    onClose();
  }

  function handleToggle() {
    if (track.fileUrl) {
      toggle(track.id, track.fileUrl);
    }
  }

  return (
    <div className="video-modal-overlay" onClick={handleClose} data-testid="video-modal-overlay">
      <div className="video-modal" onClick={(e) => e.stopPropagation()} data-testid="video-modal">
        <button className="video-modal-close" onClick={handleClose} data-testid="button-close-video">
          <X style={{ width: 22, height: 22 }} />
        </button>

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
              <span style={{ fontSize: 48, color: "rgba(234,240,255,.9)" }}>&#9654;</span>
            </div>
          )}
        </div>

        <div className="video-modal-info" data-testid="video-modal-info">
          <div className="video-modal-title" data-testid={`text-modal-title-${track.id}`}>{track.title}</div>
          <div className="video-modal-artist" data-testid={`text-modal-artist-${track.id}`}>{track.artist}</div>
        </div>

        <TrackActions track={track} />
      </div>
    </div>
  );
}
