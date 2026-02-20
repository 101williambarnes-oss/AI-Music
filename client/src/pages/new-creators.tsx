import { useQuery } from "@tanstack/react-query";
import { type Creator } from "@shared/schema";

export default function NewCreators() {
  const { data: creators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 32 }}>
        <section className="panel">
          <div className="section-header">
            <h3 data-testid="panel-header-new-creators">New Creators of the Week</h3>
          </div>
          <div className="creators-grid" data-testid="list-creators">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="creator"
                  style={{ height: 62, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
                  data-testid={`skeleton-creator-${i}`}
                />
              ))
            ) : creators.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(170,182,232,.6)" }} data-testid="empty-creators">
                No creators yet
              </div>
            ) : (
              creators.map((creator) => (
                <div className="creator" key={creator.id} data-testid={`creator-card-${creator.id}`}>
                  <div className="avatar" />
                  <div>
                    <div className="cname" data-testid={`text-creator-name-${creator.id}`}>{creator.name}</div>
                    <div className="ctext" data-testid={`text-creator-tracks-${creator.id}`}>
                      {creator.trackCount} New Track{creator.trackCount !== 1 ? "s" : ""}
                    </div>
                  </div>
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
