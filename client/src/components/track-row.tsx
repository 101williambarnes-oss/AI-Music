import { useRef, useEffect, useState, useCallback } from "react";
import { type Track } from "@shared/schema";
import { Trash2, Download, Library } from "lucide-react";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { TrackActions } from "@/components/track-actions";
import { VideoModal } from "@/components/video-modal";
import { useQuery } from "@tanstack/react-query";

export function TrackRow({ track, showRank, hideComments, onDelete, showDownload }: { track: Track; showRank?: boolean; hideComments?: boolean; onDelete?: (trackId: number) => void; showDownload?: boolean }) {
  const { data: creatorData } = useQuery<{ creator: { avatarUrl: string | null } }>({
    queryKey: ["/api/creators", track.creatorId],
    enabled: !!track.creatorId,
  });
  const { currentTrackId, isPlaying, toggle, play } = useAudioPlayer();
  const isCurrentlyPlaying = currentTrackId === track.id && isPlaying;
  const hasAudio = !!track.fileUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = !!track.fileUrl && /\.(mp4|webm|mov)$/i.test(track.fileUrl);
  const isMedia = !!track.fileUrl;
  const [showVideoModal, setShowVideoModal] = useState(false);
  const wantModalRef = useRef(false);

  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    if (isCurrentlyPlaying && !showVideoModal) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isCurrentlyPlaying, isVideo, showVideoModal]);

  useEffect(() => {
    if (wantModalRef.current && isPlaying && currentTrackId === track.id) {
      wantModalRef.current = false;
      setShowVideoModal(true);
    }
  }, [isPlaying, currentTrackId, track.id]);

  const handleRowClick = useCallback(() => {
    if (!hasAudio) return;
    if (isMedia) {
      wantModalRef.current = true;
      if (currentTrackId !== track.id) {
        play(track.id, track.fileUrl!);
      } else if (!isPlaying) {
        play(track.id, track.fileUrl!);
      }
      setShowVideoModal(true);
    } else {
      toggle(track.id, track.fileUrl!);
    }
  }, [hasAudio, isMedia, track.id, track.fileUrl, play, toggle, currentTrackId, isPlaying]);

  function handleModalClose() {
    wantModalRef.current = false;
    setShowVideoModal(false);
  }

  return (
    <div data-testid={`track-row-${track.id}`}>
      <div className="row" onClick={handleRowClick} style={{ cursor: hasAudio ? "pointer" : "default" }} data-testid={`button-play-${track.id}`}>
        <div className="thumb" style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
          {track.coverUrl && !showRank ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
              data-testid={`img-cover-thumb-${track.id}`}
            />
          ) : isVideo && !showRank ? (
            <video
              ref={videoRef}
              src={track.fileUrl!}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
              muted
              loop
              playsInline
              data-testid={`video-thumb-${track.id}`}
            />
          ) : track.fileUrl && !showRank && /\.(jpg|jpeg|png|gif|webp)$/i.test(track.fileUrl) ? (
            <img
              src={track.fileUrl}
              alt={track.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
              data-testid={`img-thumb-${track.id}`}
            />
          ) : !showRank && creatorData?.creator?.avatarUrl ? (
            <img
              src={creatorData.creator.avatarUrl}
              alt={track.artist}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
              data-testid={`img-avatar-thumb-${track.id}`}
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
        <div className="meta" style={{ minWidth: 0, overflow: "hidden" }}>
          <div className="title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-testid={`text-track-title-${track.id}`}>{track.title}</div>
          <div className="by" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }} data-testid={`text-track-artist-${track.id}`}>
            {track.artist}
            {track.creatorId && (
              <a
                href={`/creator/${track.creatorId}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.65rem",
                  color: "#6cf0ff",
                  textDecoration: "none",
                  opacity: 0.8,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: "rgba(108,240,255,.08)",
                  border: "1px solid rgba(108,240,255,.15)",
                  whiteSpace: "nowrap",
                }}
                title="View creator's library"
                data-testid={`link-library-${track.id}`}
              >
                <Library size={10} /> Library
              </a>
            )}
          </div>
        </div>
        {showDownload && track.fileUrl && (
          <a
            href={`/api/tracks/${track.id}/download`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "rgba(108,240,255,.1)",
              border: "1px solid rgba(108,240,255,.2)",
              color: "#6cf0ff",
              cursor: "pointer",
              flexShrink: 0,
            }}
            title="Download"
            data-testid={`button-download-track-${track.id}`}
          >
            <Download size={14} />
          </a>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this track?")) {
                onDelete(track.id);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "rgba(255,79,216,.1)",
              border: "1px solid rgba(255,79,216,.2)",
              color: "#ff4fd8",
              cursor: "pointer",
              flexShrink: 0,
            }}
            data-testid={`button-delete-track-${track.id}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <TrackActions track={track} hideComments={hideComments} />
      {showVideoModal && isMedia && (
        <VideoModal track={track} onClose={handleModalClose} creatorAvatarUrl={creatorData?.creator?.avatarUrl} />
      )}
    </div>
  );
}
