import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Creator } from "@shared/schema";
import { Search, X, ArrowLeft } from "lucide-react";

export default function NewCreators() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: creators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  const filtered = searchQuery
    ? creators.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : creators;

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 32, maxWidth: 900, margin: "0 auto" }}>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#6cf0ff",
            textDecoration: "none",
            marginBottom: 16,
            fontSize: "0.9rem",
          }}
          data-testid="link-back-home"
        >
          <ArrowLeft size={16} />
          Back to Home
        </a>

        <section className="panel" style={{ padding: "20px 24px" }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <h3 data-testid="panel-header-new-creators" style={{ fontSize: "1.3rem" }}>
              New Creators
            </h3>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: "rgba(108,240,255,.06)",
                border: "1px solid rgba(108,240,255,.15)",
                borderRadius: 8,
                padding: "0 12px",
              }}
            >
              <Search style={{ width: 16, height: 16, opacity: 0.5, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search creators by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#e0e6f0",
                  padding: "10px 10px",
                  fontSize: "0.9rem",
                }}
                data-testid="input-search-creators"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(170,182,232,.6)",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                  }}
                  data-testid="button-clear-search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {searchQuery && (
            <div
              style={{
                marginBottom: 16,
                fontSize: "0.85rem",
                color: "rgba(170,182,232,.7)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              data-testid="text-results-count"
            >
              <span>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
              </span>
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "rgba(108,240,255,.1)",
                  border: "1px solid rgba(108,240,255,.15)",
                  borderRadius: 4,
                  color: "#6cf0ff",
                  cursor: "pointer",
                  padding: "2px 8px",
                  fontSize: "0.8rem",
                }}
                data-testid="button-clear-filters"
              >
                Clear search
              </button>
            </div>
          )}

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
            ) : filtered.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px 0", color: "rgba(170,182,232,.6)" }}
                data-testid="empty-creators"
              >
                {searchQuery ? "No creators match your search" : "No creators yet"}
              </div>
            ) : (
              filtered.map((creator) => (
                <a
                  href={`/creator/${creator.id}`}
                  key={creator.id}
                  style={{ textDecoration: "none", color: "inherit" }}
                  data-testid={`creator-card-${creator.id}`}
                >
                  <div className="creator" style={{ cursor: "pointer" }}>
                    <div className="avatar" />
                    <div>
                      <div className="cname" data-testid={`text-creator-name-${creator.id}`}>{creator.name}</div>
                      <div className="ctext" data-testid={`text-creator-tracks-${creator.id}`}>
                        {creator.trackCount} New Track{creator.trackCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
