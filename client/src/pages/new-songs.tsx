import { useQuery } from "@tanstack/react-query";
import { type Track } from "@shared/schema";

function formatPlays(plays: number) {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
}

export default function NewSongs() {
  const { data: tracks = [], isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "new"],
  });

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 32 }}>
        <section className="panel">
          <div className="section-header">
            <h3 data-testid="panel-header-new-songs">New Songs of the Week</h3>
          </div>
          <div className="list tall" data-testid="list-new-songs">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="row"
                  style={{ height: 74, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
                  data-testid={`skeleton-track-${i}`}
                />
              ))
            ) : tracks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(170,182,232,.6)" }} data-testid="empty-new-songs">
                No new songs found
              </div>
            ) : (
              tracks.map((track) => (
                <div className="row" key={track.id} data-testid={`track-row-${track.id}`}>
                  <div className="thumb">
                    <div className="play-btn">&#9654;</div>
                  </div>
                  <div className="meta">
                    <div className="title" data-testid={`text-track-title-${track.id}`}>{track.title}</div>
                    <div className="by" data-testid={`text-track-artist-${track.id}`}>{track.artist}</div>
                  </div>
                  <div className="stat" data-testid={`text-track-plays-${track.id}`}>{formatPlays(track.plays)}</div>
                </div>
              ))
            )}
          </div>
        </section>
        <div style={{ paddingTop: 20 }}>
          <a href="/" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-back-home">&#8592; Back to Home</a>
        </div>
      </div>
    </div>
  );
}
