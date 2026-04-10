import { useRef, useEffect, useState, useCallback } from "react";
import { type Track } from "@shared/schema";
import { Trash2, Download, Library, Share2, Plus, Check, Film } from "lucide-react";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { TrackActions } from "@/components/track-actions";
import { getTrackThumbnail } from "@/lib/utils";

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
  const isVideo = !!track.fileUrl && /\.(mp4|m4v|webm|mov)$/i.test(track.fileUrl);
  const isMedia = !!track.fileUrl;
  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    if (isCurrentlyPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isCurrentlyPlaying, isVideo]);

  const handleRowClick = useCallback(() => {
    if (!hasAudio) return;
    if (currentTrackId === track.id) {
      toggle();
    } else {
      play(track.id, track.fileUrl!, { title: track.title, artist: track.artist, coverUrl: track.coverUrl, djIntroUrl: (track as any).djIntroUrl });
    }
  }, [hasAudio, track.id, track.fileUrl, track.title, track.artist, track.coverUrl, play, toggle, currentTrackId]);

  const [generatingReel, setGeneratingReel] = useState(false);

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

  function handleReelDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (generatingReel) return;
    setGeneratingReel(true);
    fetch(`/api/tracks/${track.id}/reel`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to generate reel");
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${track.title} - Hit Wave Media.mp4`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => alert(err.message || "Failed to generate reel"))
      .finally(() => setGeneratingReel(false));
  }

  const isActive = currentTrackId === track.id;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const showExpanded = isActive && !isMobile;
  const thumbSrc = getTrackThumbnail(track) || creatorData?.creator?.avatarUrl || null;

  return (
    <div data-testid={`track-row-${track.id}`} style={{ transition: "all 0.3s ease" }}>
      {showExpanded && (
        <div
          onClick={handleRowClick}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 12px 12px",
            borderRadius: 16,
            background: "linear-gradient(180deg, rgba(160,107,255,.1) 0%, rgba(15,20,40,.5) 100%)",
            border: "1px solid rgba(160,107,255,.25)",
            boxShadow: "0 4px 24px rgba(160,107,255,.12), 0 0 40px rgba(108,240,255,.06)",
            marginBottom: 10,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          data-testid={`expanded-player-${track.id}`}
        >
          <div style={{
            width: "100%",
            maxWidth: 220,
            aspectRatio: "1",
            borderRadius: 14,
            overflow: "hidden",
            background: "radial-gradient(circle at 30% 30%, rgba(108,240,255,.8), rgba(160,107,255,.35) 55%, rgba(255,79,216,.25))",
            border: "1px solid rgba(108,240,255,.15)",
            boxShadow: isCurrentlyPlaying
              ? "0 0 30px rgba(160,107,255,.25), 0 0 60px rgba(108,240,255,.1)"
              : "0 0 12px rgba(0,0,0,.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            margin: "0 auto 12px",
            transition: "box-shadow 0.3s ease",
          }}>
            {thumbSrc ? (
              <img src={thumbSrc} alt={track.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {isCurrentlyPlaying ? (
                  <span style={{ fontSize: "2rem", color: "#fff", letterSpacing: 4 }}>{"\u275A\u275A"}</span>
                ) : (
                  <span style={{ fontSize: "2.5rem", color: "#fff", marginLeft: 4 }}>{"\u25B6"}</span>
                )}
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", width: "100%" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#eaf0ff", marginBottom: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} data-testid={`text-track-title-${track.id}`}>
              {track.title}
              {track.explicit && (
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, background: "rgba(255,79,216,.15)", border: "1px solid rgba(255,79,216,.3)", color: "#ff4fd8", fontSize: 9, fontWeight: 800, flexShrink: 0, lineHeight: 1 }} data-testid={`badge-explicit-${track.id}`}>E</span>
              )}
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(170,182,232,.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} data-testid={`text-track-artist-${track.id}`}>
              {track.artist}
              {track.creatorId && !hideLibrary && (
                <a
                  href={`/creator/${track.creatorId}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    fontSize: "0.65rem", color: "#6cf0ff", textDecoration: "none",
                    padding: "1px 6px", borderRadius: 4,
                    background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.15)",
                  }}
                  data-testid={`link-library-${track.id}`}
                >
                  <Library size={10} /> Library
                </a>
              )}
            </div>
            {track.aiTool && (
              <div style={{ fontSize: "0.65rem", color: "rgba(160,107,255,.7)", marginTop: 2 }} data-testid={`text-track-aitool-${track.id}`}>
                Created with {track.aiTool}
              </div>
            )}
          </div>
        </div>
      )}
      <div style={{
        display: showExpanded ? "none" : "flex",
        alignItems: "stretch",
        gap: 0,
        borderRadius: 8,
        border: isActive && isMobile ? "1px solid rgba(108,240,255,.25)" : "1px solid transparent",
        background: isActive && isMobile ? "rgba(108,240,255,.06)" : "transparent",
        transition: "border 0.2s, background 0.2s",
      }}>
        <div className="row" onClick={handleRowClick} style={{ cursor: hasAudio ? "pointer" : "default", flex: 1, minWidth: 0, marginBottom: 0 }} data-testid={`button-play-${track.id}`}>
          <div className="thumb" style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
            {(() => {
              const thumb = getTrackThumbnail(track);
              if (thumb && !showRank) {
                return (
                  <img
                    src={thumb}
                    alt={track.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                    data-testid={`img-thumb-${track.id}`}
                  />
                );
              }
              if (!showRank && creatorData?.creator?.avatarUrl) {
                return (
                  <img
                    src={creatorData.creator.avatarUrl}
                    alt={track.artist}
                    style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                    data-testid={`img-avatar-thumb-${track.id}`}
                  />
                );
              }
              return null;
            })()}
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
                <span className="rankBadge" data-testid={`text-rank-${track.rank}`}>#{track.rank}</span>
              </div>
            ) : (
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
            )}
          </div>
          <div className="meta" style={{ minWidth: 0, overflow: "hidden" }}>
            <div className="title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }} data-testid={`text-track-title-${track.id}`}>
              {track.title}
              {track.explicit && (
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, background: "rgba(255,79,216,.15)", border: "1px solid rgba(255,79,216,.3)", color: "#ff4fd8", fontSize: 9, fontWeight: 800, flexShrink: 0, lineHeight: 1 }} data-testid={`badge-explicit-${track.id}`}>E</span>
              )}
            </div>
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
                  window.location.href = `/api/tracks/${track.id}/download`;
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
              onClick={handleReelDownload}
              disabled={generatingReel}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 8,
                background: generatingReel ? "rgba(255,79,216,.2)" : "rgba(255,79,216,.1)",
                border: "1px solid rgba(255,79,216,.2)",
                color: "#ff4fd8",
                cursor: generatingReel ? "wait" : "pointer",
                opacity: generatingReel ? 0.6 : 1,
              }}
              title={generatingReel ? "Generating Reel..." : "Download Reel"}
              data-testid={`button-reel-${track.id}`}
            >
              <Film size={16} />
            </button>
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
    </div>
  );
}
