import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { type Track, type Creator } from "@shared/schema";
import { TrackRow } from "@/components/track-row";
import { Music, Share2, Download } from "lucide-react";
import { PageNav } from "@/components/page-nav";
import { getTrackThumbnail } from "@/lib/utils";
import { useAudioPlayer } from "@/lib/audioPlayer";

export default function TrackPage() {
  const { id } = useParams<{ id: string }>();
  const { play, toggle, currentTrackId, isPlaying } = useAudioPlayer();
  const autoPlayedRef = useRef(false);

  const { data, isLoading, error } = useQuery<{ track: Track; creator: Creator | null }>({
    queryKey: ["/api/track", id],
  });

  const track = data?.track;
  const creator = data?.creator;

  useEffect(() => {
    if (track && track.fileUrl && !autoPlayedRef.current && currentTrackId !== track.id) {
      autoPlayedRef.current = true;
      play(track.id, track.fileUrl, {
        title: track.title,
        artist: track.artist,
        coverUrl: track.coverUrl,
        djIntroUrl: (track as any).djIntroUrl,
      });
    }
  }, [track, play, currentTrackId]);

  function handleShare() {
    const shareUrl = `${window.location.origin}/track/${id}`;
    const shareText = track ? `Listen to "${track.title}" by ${track.artist} on Hit Wave Media!` : "Check out this song on Hit Wave Media!";
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      navigator.share({ title: track ? `${track.title} — Hit Wave Media` : "Hit Wave Media", text: shareText, url: shareUrl }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => alert("Song link copied to clipboard!")).catch(() => prompt("Copy this link:", shareUrl));
    } else {
      prompt("Copy this link:", shareUrl);
    }
  }

  if (isLoading) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 16, maxWidth: 900, margin: "0 auto" }}>
          <PageNav />
          <section className="panel" style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ opacity: 0.5, animation: "pulse 1.5s ease-in-out infinite" }} data-testid="track-loading">
              Loading track...
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 16, maxWidth: 900, margin: "0 auto" }}>
          <PageNav />
          <section className="panel" style={{ padding: "40px 24px", textAlign: "center" }}>
            <Music style={{ width: 48, height: 48, color: "rgba(170,182,232,.3)", margin: "0 auto 16px" }} />
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#eaf0ff", marginBottom: 8 }} data-testid="track-not-found">
              Track not found
            </div>
            <div style={{ color: "rgba(170,182,232,.5)", fontSize: "0.9rem", marginBottom: 20 }}>
              This track may have been removed or doesn't exist.
            </div>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 8,
                background: "rgba(108,240,255,.1)",
                border: "1px solid rgba(108,240,255,.2)",
                color: "#6cf0ff",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
              data-testid="link-back-home"
            >
              Back to Home
            </a>
          </section>
        </div>
      </div>
    );
  }

  const coverSrc = track.coverUrl || getTrackThumbnail(track);
  const isThisTrackPlaying = currentTrackId === track.id && isPlaying;

  function handleCoverTap() {
    if (!track.fileUrl) return;
    if (currentTrackId === track.id) {
      toggle();
    } else {
      play(track.id, track.fileUrl, {
        title: track.title,
        artist: track.artist,
        coverUrl: track.coverUrl,
        djIntroUrl: (track as any).djIntroUrl,
      });
    }
  }

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 16, maxWidth: 900, margin: "0 auto" }}>
        <PageNav />
        <section className="panel" style={{ padding: "24px 24px 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              onClick={handleCoverTap}
              style={{
              width: "100%",
              maxWidth: 480,
              aspectRatio: "1",
              borderRadius: 16,
              overflow: "hidden",
              background: "rgba(160,107,255,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: isThisTrackPlaying ? "2px solid rgba(108,240,255,.35)" : "1px solid rgba(108,240,255,.12)",
              margin: "0 auto",
              boxShadow: isThisTrackPlaying
                ? "0 8px 40px rgba(0,0,0,.5), 0 0 60px rgba(160,107,255,.15), 0 0 30px rgba(108,240,255,.08)"
                : "0 8px 40px rgba(0,0,0,.5), 0 0 60px rgba(160,107,255,.08)",
              cursor: "pointer",
              position: "relative",
              transition: "box-shadow 0.3s ease, border 0.3s ease",
            }} data-testid="img-track-cover">
              {coverSrc ? (
                <img src={coverSrc} alt={track.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Music size={96} style={{ color: "rgba(160,107,255,.2)" }} />
              )}
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#eaf0ff", margin: "0 0 8px 0" }} data-testid="text-track-page-title">
              {track.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ color: "rgba(170,182,232,.7)", fontSize: "1rem" }} data-testid="text-track-page-artist">
                by {track.artist}
              </span>
              {track.genre && (
                <span style={{
                  fontSize: "0.7rem",
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "rgba(160,107,255,.15)",
                  border: "1px solid rgba(160,107,255,.2)",
                  color: "#a06bff",
                  fontWeight: 600,
                }} data-testid="text-track-page-genre">
                  {track.genre}
                </span>
              )}
              {track.aiTool && (
                <span style={{ fontSize: "0.7rem", color: "rgba(160,107,255,.7)" }} data-testid="text-track-page-aitool">
                  Created with {track.aiTool}
                </span>
              )}
            </div>
            <div style={{ color: "rgba(170,182,232,.5)", fontSize: "0.85rem", marginBottom: 14 }}>
              <span data-testid="text-track-plays">{track.plays} plays</span>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleShare}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 20px",
                  background: "rgba(108,240,255,.08)",
                  border: "1px solid rgba(108,240,255,.2)",
                  borderRadius: 8,
                  color: "#6cf0ff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
                data-testid="button-share-track"
              >
                <Share2 size={15} /> Share
              </button>
              {track.fileUrl && (
                <a
                  href={`/api/tracks/${track.id}/download`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "10px 20px",
                    background: "rgba(160,107,255,.08)",
                    border: "1px solid rgba(160,107,255,.2)",
                    borderRadius: 8,
                    color: "#a06bff",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    textDecoration: "none",
                  }}
                  data-testid="button-download-track"
                >
                  <Download size={15} /> Download
                </a>
              )}
            </div>
          </div>

          {creator && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(108,240,255,.08)" }}>
              <a
                href={`/creator/${creator.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  color: "inherit",
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: "rgba(108,240,255,.04)",
                  border: "1px solid rgba(108,240,255,.08)",
                  transition: "background .2s",
                }}
                data-testid="link-track-creator"
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  flexShrink: 0,
                  overflow: "hidden",
                  background: creator.avatarUrl
                    ? `url(${creator.avatarUrl}) center/cover`
                    : `linear-gradient(135deg, ${creator.avatarColor === "pink" ? "#ff4fd8" : creator.avatarColor === "cyan" ? "#6cf0ff" : "#a06bff"}, rgba(108,240,255,.3))`,
                }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#eaf0ff" }} data-testid="text-track-creator-name">
                    {creator.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(170,182,232,.5)" }}>
                    {creator.trackCount} track{creator.trackCount !== 1 ? "s" : ""} · View full library
                  </div>
                </div>
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
