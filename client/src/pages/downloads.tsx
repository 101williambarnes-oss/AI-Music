import { useQuery } from "@tanstack/react-query";
import { type Track } from "@shared/schema";
import { Download } from "lucide-react";

function formatPlays(plays: number) {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
}

function DownloadTrackRow({ track }: { track: Track }) {
  return (
    <div className="row" data-testid={`download-track-row-${track.id}`}>
      <div className="thumb">
        <div className="play-btn">&#9654;</div>
      </div>
      <div className="meta">
        <div className="title" data-testid={`text-track-title-${track.id}`}>{track.title}</div>
        <div className="by" data-testid={`text-track-artist-${track.id}`}>{track.artist}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="stat" data-testid={`text-track-plays-${track.id}`}>{formatPlays(track.plays)}</div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            background: "linear-gradient(135deg, rgba(108,240,255,.2), rgba(160,107,255,.2))",
            border: "1px solid rgba(108,240,255,.3)",
            borderRadius: 8,
            color: "#6cf0ff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap" as const,
          }}
          data-testid={`button-download-${track.id}`}
        >
          <Download style={{ width: 14, height: 14 }} />
          Download
        </button>
      </div>
    </div>
  );
}

export default function Downloads() {
  const { data: allTracks = [], isLoading: allLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const { data: newTracks = [], isLoading: newLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "new"],
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
                <DownloadTrackRow key={track.id} track={track} />
              ))
            )}
          </div>
        </section>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: "#6cf0ff", fontSize: 20, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }} data-testid="text-browse-by-genre">Browse by Genre</h2>
          <p style={{ color: "rgba(170,182,232,.5)", fontSize: 13, margin: 0 }}>All tracks organized by genre for easy downloading</p>
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
                  <DownloadTrackRow key={track.id} track={track} />
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
