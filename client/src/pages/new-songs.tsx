import { useQuery } from "@tanstack/react-query";
import { type Track } from "@shared/schema";
import { TrackRow } from "@/components/track-row";

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
                <TrackRow key={track.id} track={track} />
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
