import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { type Track, type Creator } from "@shared/schema";
import { TrackRow } from "@/components/track-row";
import { Music } from "lucide-react";
import { PageNav } from "@/components/page-nav";

export default function TrackPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery<{ track: Track; creator: Creator | null }>({
    queryKey: ["/api/track", id],
  });

  const track = data?.track;
  const creator = data?.creator;

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

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 16, maxWidth: 900, margin: "0 auto" }}>
        <PageNav />
        <section className="panel" style={{ padding: "20px 24px" }}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#eaf0ff", margin: 0 }} data-testid="text-track-page-title">
              {track.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span style={{ color: "rgba(170,182,232,.7)", fontSize: "0.9rem" }} data-testid="text-track-page-artist">
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
          </div>

          <TrackRow track={track} showDownload />

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
