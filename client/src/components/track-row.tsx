import { useRef, useEffect, useState, useCallback } from "react";
import { type Track } from "@shared/schema";
import { Trash2, Download, Library, Share2, Plus, Check } from "lucide-react";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { TrackActions } from "@/components/track-actions";
import { VideoModal } from "@/components/video-modal";
import { useQuery } from "@tanstack/react-query";
import { usePlaylist } from "@/lib/playlistContext";

export function TrackRow({ track, showRank, hideComments, onDelete, showDownload, hideLibrary, hidePlaylistBtn }: { track: Track; showRank?: boolean; hideComments?: boolean; onDelete?: (trackId: number) => void; showDownload?: boolean; hideLibrary?: boolean; hidePlaylistBtn?: boolean }) {
  const { addTrack, removeTrack: removeFromPlaylist, isInPlaylist } = usePlaylist();
  const inPlaylist = isInPlaylist(track.id);
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
        play(track.id, track.fileUrl!, { title: track.title, artist: track.artist, coverUrl: track.coverUrl });
      } else if (!isPlaying) {
        play(track.id, track.fileUrl!, { title: track.title, artist: track.artist, coverUrl: track.coverUrl });
      }
      setShowVideoModal(true);
    } else {
      toggle(track.id, track.fileUrl!, { title: track.title, artist: track.artist, coverUrl: track.coverUrl });
    }
  }, [hasAudio, isMedia, track.id, track.fileUrl, track.title, track.artist, track.coverUrl, play, toggle, currentTrackId, isPlaying]);

  function handleModalClose() {
    wantModalRef.current = false;
    setShowVideoModal(false);
  }

  function handleShareClick() {
    const shareUrl = `${window.location.origin}/track/${track.id}`;
    const shareText = `Check out "${track.title}" by ${track.artist} on Hit Wave Media!`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: `${track.title} — Hit Wave Media`, text: shareText, url: shareUrl }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link copied!");
      }).catch(() => {
        prompt("Copy this link:", shareUrl);
      });
    } else {
      prompt("Copy this link:", shareUrl);
    }
  }

  return (
    <div data-testid={`track-row-${track.id}`}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        <div className="row" onClick={handleRowClick} style={{ cursor: hasAudio ? "pointer" : "default", flex: 1, minWidth: 0, marginBottom: 0 }} data-testid={`button-play-${track.id}`}>
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
            ) : !isCurrentlyPlaying ? (
                <div
                  className="play-btn"
                  style={{
                    opacity: hasAudio ? 1 : 0.4,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {"\u25B6"}
                </div>
            ) : null}
          </div>
          <div className="meta" style={{ minWidth: 0, overflow: "hidden" }}>
            <div className="title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-testid={`text-track-title-${track.id}`}>{track.title}</div>
            <div className="by" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }} data-testid={`text-track-artist-${track.id}`}>
              {track.artist}
              {track.creatorId && !hideLibrary && (
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
            {track.aiTool && (
              <div style={{ fontSize: "0.65rem", color: "rgba(160,107,255,.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-testid={`text-track-aitool-${track.id}`}>
                Created with {track.aiTool}
              </div>
            )}
          </div>
        </div>
        {!hidePlaylistBtn && (
          <div style={{ display: "flex", alignItems: "center", padding: "0 2px", flexShrink: 0 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (inPlaylist) {
                  removeFromPlaylist(track.id);
                } else {
                  addTrack(track);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                background: inPlaylist ? "rgba(255,79,216,.15)" : "rgba(255,79,216,.08)",
                border: inPlaylist ? "1px solid rgba(255,79,216,.4)" : "1px solid rgba(255,79,216,.15)",
                color: inPlaylist ? "#ff4fd8" : "rgba(255,79,216,.6)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              title={inPlaylist ? "Remove from playlist" : "Add to playlist"}
              data-testid={`button-playlist-toggle-${track.id}`}
            >
              {inPlaylist ? <Check size={14} /> : <Plus size={14} />}
            </button>
          </div>
        )}
        {showDownload && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center", padding: "0 6px", flexShrink: 0 }}>
            {track.fileUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement("a");
                  link.href = `/api/tracks/${track.id}/download`;
                  link.download = track.title || "track";
                  link.style.display = "none";
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => document.body.removeChild(link), 1000);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "rgba(108,240,255,.1)",
                  border: "1px solid rgba(108,240,255,.2)",
                  color: "#6cf0ff",
                  cursor: "pointer",
                }}
                title="Download"
                data-testid={`button-download-track-${track.id}`}
              >
                <Download size={16} />
              </button>
            )}
            <button
              onClick={handleShareClick}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 8,
                background: "rgba(160,107,255,.1)",
                border: "1px solid rgba(160,107,255,.2)",
                color: "#a06bff",
                cursor: "pointer",
              }}
              title="Share"
              data-testid={`button-share-row-${track.id}`}
            >
              <Share2 size={16} />
            </button>
          </div>
        )}
        {onDelete && (
          <div style={{ display: "flex", alignItems: "center", padding: "0 6px", flexShrink: 0 }}>
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
                width: 38,
                height: 38,
                borderRadius: 8,
                background: "rgba(255,79,216,.1)",
                border: "1px solid rgba(255,79,216,.2)",
                color: "#ff4fd8",
                cursor: "pointer",
              }}
              data-testid={`button-delete-track-${track.id}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      <TrackActions track={track} hideComments={hideComments} />
      {showVideoModal && isMedia && (
        <VideoModal track={track} onClose={handleModalClose} creatorAvatarUrl={creatorData?.creator?.avatarUrl} />
      )}
    </div>
  );
}
