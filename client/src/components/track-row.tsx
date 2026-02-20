import { useRef, useEffect, useState } from "react";
import { type Track } from "@shared/schema";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { TrackActions } from "@/components/track-actions";
import { VideoModal } from "@/components/video-modal";

function formatPlays(plays: number) {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
}

export function TrackRow({ track, showRank }: { track: Track; showRank?: boolean }) {
  const { currentTrackId, isPlaying, toggle, play } = useAudioPlayer();
  const isCurrentlyPlaying = currentTrackId === track.id && isPlaying;
  const hasAudio = !!track.fileUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = !!track.fileUrl && /\.(mp4|webm|mov)$/i.test(track.fileUrl);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    if (isCurrentlyPlaying && !showVideoModal) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isCurrentlyPlaying, isVideo, showVideoModal]);

  function handleRowClick() {
    if (!hasAudio) return;
    if (isVideo) {
      play(track.id, track.fileUrl!);
      setShowVideoModal(true);
    } else {
      toggle(track.id, track.fileUrl!);
    }
  }

  function handleModalClose() {
    setShowVideoModal(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }

  return (
    <div data-testid={`track-row-${track.id}`}>
      <div className="row" onClick={handleRowClick} style={{ cursor: hasAudio ? "pointer" : "default" }} data-testid={`button-play-${track.id}`}>
        <div className="thumb" style={{ position: "relative", overflow: "hidden", flexShrink: 0, width: 54, height: 54 }}>
          {isVideo && !showRank ? (
            <video
              ref={videoRef}
              src={track.fileUrl!}
              style={{ width: 54, height: 54, objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
              muted
              loop
              playsInline
              data-testid={`video-thumb-${track.id}`}
            />
          ) : track.fileUrl && !showRank && /\.(jpg|jpeg|png|gif|webp)$/i.test(track.fileUrl) ? (
            <img
              src={track.fileUrl}
              alt={track.title}
              style={{ width: 54, height: 54, objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
              data-testid={`img-thumb-${track.id}`}
            />
          ) : null}
          {showRank && track.rank ? (
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {isCurrentlyPlaying ? (
                <span style={{ color: "#ff4fd8", fontSize: "1.2rem" }}>{"\u275A\u275A"}</span>
              ) : (
                <span className="rankBadge" data-testid={`text-rank-${track.rank}`}>#{track.rank}</span>
              )}
            </div>
          ) : (
            <div
              className="play-btn"
              style={{
                opacity: hasAudio ? 1 : 0.4,
                color: isCurrentlyPlaying ? "#ff4fd8" : undefined,
                position: "relative",
                zIndex: 1,
              }}
            >
              {isCurrentlyPlaying ? "\u275A\u275A" : "\u25B6"}
            </div>
          )}
        </div>
        <div className="meta">
          <div className="title" data-testid={`text-track-title-${track.id}`}>{track.title}</div>
          <div className="by" data-testid={`text-track-artist-${track.id}`}>{track.artist}</div>
        </div>
        <div className="stat" data-testid={`text-track-plays-${track.id}`}>{formatPlays(track.plays)}</div>
      </div>
      <TrackActions track={track} />
      {showVideoModal && isVideo && (
        <VideoModal track={track} onClose={handleModalClose} />
      )}
    </div>
  );
}
