import { useQuery } from "@tanstack/react-query";
import { type Track, type Creator } from "@shared/schema";
import { Download, ArrowRight } from "lucide-react";
import { TrackRow } from "@/components/track-row";

export default function Downloads() {
  const { data: allTracks = [], isLoading: allLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { data: newTracks = [], isLoading: newLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "new"],
  });

  const { data: creators = [], isLoading: creatorsLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  const genreGroups: Record<string, Track[]> = {};
  allTracks.forEach((track) => {
    if (!genreGroups[track.genre]) {
      genreGroups[track.genre] = [];
    }
    genreGroups[track.genre].push(track);
  });

  const sortedGenres = Object.keys(genreGroups).sort();

  return (
    <div className="hwm-app">
      <div className="bg-lines" />

      <header className="site-topbar" data-testid="header-downloads">
        <div className="topbar-left">
          <a href="/" style={{ textDecoration: "none" }}>
            <div className="logo" data-testid="text-brand-name">HIT WAVE MEDIA</div>
          </a>
        </div>
        <div className="topbar-center">
          <h2 style={{ color: "#6cf0ff", fontSize: 20, fontWeight: 800, letterSpacing: 1, margin: 0 }} data-testid="text-page-title">
            <Download style={{ width: 20, height: 20, display: "inline", verticalAlign: "middle", marginRight: 8 }} />
            Downloads
          </h2>
        </div>
        <div className="topbar-actions">
          <a href="/sign-in" className="topbar-login" data-testid="link-creators-login">Creators Login</a>
          <a href="/sign-up" className="topbar-signup" data-testid="button-sign-up">Sign Up</a>
        </div>
      </header>

      <div className="wrap" style={{ paddingTop: 24, maxWidth: 900, margin: "0 auto" }}>
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="section-header">
            <h3 data-testid="panel-header-new-songs">New Songs of the Week</h3>
          </div>
          <div style={{ padding: "10px 10px 12px" }} data-testid="list-new-songs">
            {newLoading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="row"
                  style={{ height: 74, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
                  data-testid={`skeleton-new-${i}`}
                />
              ))
            ) : newTracks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(170,182,232,.6)" }} data-testid="empty-new-songs">
                No new songs this week
              </div>
            ) : (
              newTracks.map((track) => (
                <TrackRow key={track.id} track={track} showDownload />
              ))
            )}
          </div>
        </section>

        <section className="panel" style={{ marginBottom: 20, padding: 24, textAlign: "center" }}>
          <Download style={{ width: 32, height: 32, color: "#6cf0ff", margin: "0 auto 12px" }} />
          <h3 style={{ color: "#6cf0ff", fontSize: 18, fontWeight: 700, marginBottom: 8 }} data-testid="text-download-info-title">Download Music from Creator Profiles</h3>
          <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, marginBottom: 0, maxWidth: 480, margin: "0 auto" }} data-testid="text-download-info-desc">
            To download music, visit a creator's profile page. Each creator has a "Download Music Now" button on their tracks.
          </p>
        </section>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: "#6cf0ff", fontSize: 20, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }} data-testid="text-creators-heading">Creators</h2>
          <p style={{ color: "rgba(170,182,232,.5)", fontSize: 13, margin: 0 }}>Visit a creator's profile to download their music</p>
        </div>

        {creatorsLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="row" style={{ height: 60, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite", marginBottom: 8 }} />
          ))
        ) : creators.length === 0 ? (
          <section className="panel" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ color: "rgba(170,182,232,.6)" }} data-testid="empty-creators">No creators available</div>
          </section>
        ) : (
          <section className="panel" style={{ marginBottom: 20 }}>
            <div style={{ padding: "10px 10px 12px" }} data-testid="list-creators">
              {creators.map((creator) => {
                const avatarGradient =
                  creator.avatarColor === "cyan"
                    ? "radial-gradient(circle at 30% 30%, rgba(108,240,255,.8), rgba(160,107,255,.35) 55%, rgba(255,79,216,.20))"
                    : creator.avatarColor === "pink"
                    ? "radial-gradient(circle at 30% 30%, rgba(255,79,216,.8), rgba(160,107,255,.35) 55%, rgba(108,240,255,.20))"
                    : "radial-gradient(circle at 30% 30%, rgba(160,107,255,.8), rgba(108,240,255,.35) 55%, rgba(255,79,216,.20))";
                return (
                  <a
                    key={creator.id}
                    href={`/creator/${creator.id}`}
                    className="row"
                    style={{ textDecoration: "none", cursor: "pointer" }}
                    data-testid={`link-creator-${creator.id}`}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: avatarGradient, border: "1px solid rgba(108,240,255,.2)", flexShrink: 0 }} />
                    <div className="meta">
                      <div className="title" data-testid={`text-creator-name-${creator.id}`}>{creator.name}</div>
                      <div className="by">{creator.trackCount} track{creator.trackCount !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6cf0ff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                      <Download style={{ width: 14, height: 14 }} />
                      Download Music
                      <ArrowRight style={{ width: 14, height: 14, opacity: 0.6 }} />
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: "#6cf0ff", fontSize: 20, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }} data-testid="text-browse-by-genre">Browse by Genre</h2>
          <p style={{ color: "rgba(170,182,232,.5)", fontSize: 13, margin: 0 }}>All tracks organized by genre</p>
        </div>

        {allLoading ? (
          [1, 2, 3].map((i) => (
            <section key={i} className="panel" style={{ marginBottom: 14 }}>
              <div className="section-header">
                <h3 style={{ opacity: 0.3 }}>Loading...</h3>
              </div>
              <div style={{ padding: 10 }}>
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="row"
                    style={{ height: 74, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
                  />
                ))}
              </div>
            </section>
          ))
        ) : sortedGenres.length === 0 ? (
          <section className="panel" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ color: "rgba(170,182,232,.6)" }} data-testid="empty-genres">No tracks available</div>
          </section>
        ) : (
          sortedGenres.map((genre) => (
            <section key={genre} className="panel" style={{ marginBottom: 14 }} data-testid={`genre-section-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
              <div className="section-header">
                <h3 data-testid={`genre-heading-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>{genre}</h3>
              </div>
              <div style={{ padding: "10px 10px 12px" }}>
                {genreGroups[genre].map((track) => (
                  <TrackRow key={track.id} track={track} showDownload />
                ))}
              </div>
            </section>
          ))
        )}

        <div style={{ paddingTop: 20, paddingBottom: 40, textAlign: "center" }}>
          <a href="/" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-back-home">&#8592; Back to Home</a>
        </div>
      </div>
    </div>
  );
}
