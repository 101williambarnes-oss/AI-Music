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
  const { currentTrackId, isPlaying, toggle } = useAudioPlayer();
  const isCurrentlyPlaying = currentTrackId === track.id && isPlaying;
  const hasAudio = !!track.fileUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = !!track.fileUrl && /\.(mp4|webm|mov)$/i.test(track.fileUrl);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    if (isCurrentlyPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isCurrentlyPlaying, isVideo]);

  function handlePlay() {
    if (!hasAudio) return;
    if (isVideo) {
      toggle(track.id, track.fileUrl!);
      if (!isCurrentlyPlaying) {
        setShowVideoModal(true);
      }
    } else {
      toggle(track.id, track.fileUrl!);
    }
  }

  return (
    <div data-testid={`track-row-${track.id}`}>
      <div className="row">
        <div className="thumb" style={{ position: "relative", overflow: "hidden" }}>
          {isVideo && !showRank ? (
            <video
              ref={videoRef}
              src={track.fileUrl!}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
              muted
              loop
              playsInline
              data-testid={`video-thumb-${track.id}`}
            />
          ) : track.fileUrl && !showRank && /\.(jpg|jpeg|png|gif|webp)$/i.test(track.fileUrl) ? (
            <img
              src={track.fileUrl}
              alt={track.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
              data-testid={`img-thumb-${track.id}`}
            />
          ) : null}
          {showRank && track.rank ? (
            <div
              onClick={handlePlay}
              style={{
                cursor: hasAudio ? "pointer" : "default",
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
              data-testid={`button-play-${track.id}`}
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
              onClick={handlePlay}
              style={{
                cursor: hasAudio ? "pointer" : "default",
                opacity: hasAudio ? 1 : 0.4,
                color: isCurrentlyPlaying ? "#ff4fd8" : undefined,
                position: "relative",
                zIndex: 1,
              }}
              data-testid={`button-play-${track.id}`}
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
        <VideoModal track={track} onClose={() => setShowVideoModal(false)} />
      )}
    </div>
  );
}
