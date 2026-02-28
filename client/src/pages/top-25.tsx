import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track, type WeeklyWinner } from "@shared/schema";
import { TrackRow } from "@/components/track-row";
import { Search, X, Trophy, Crown } from "lucide-react";
import { ALL_GENRES } from "@/lib/genres";

export default function Top25() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");

  const { data: tracks = [], isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "top25"],
  });

  const { data: winners = [] } = useQuery<WeeklyWinner[]>({
    queryKey: ["/api/weekly-winners"],
  });

  const genres = ALL_GENRES;

  const filtered = tracks.filter((t) => {
    const matchesGenre = genreFilter === "all" || t.genre === genreFilter;
    if (!searchQuery) return matchesGenre;
    const q = searchQuery.toLowerCase();
    return (
      matchesGenre &&
      (t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q))
    );
  });

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 32, maxWidth: 900, margin: "0 auto" }}>
        <section className="panel" style={{ padding: "20px 24px" }}>
          <div className="section-header" style={{ marginBottom: 4 }}>
            <h3 data-testid="panel-header-top25" style={{ fontSize: "1.3rem" }}>
              Top 25
            </h3>
          </div>
          <p style={{ color: "rgba(170,182,232,.5)", fontSize: "0.8rem", margin: "0 0 16px", padding: "0 2px" }} data-testid="text-top25-subtitle">
            Ranked by total likes. Updates automatically.
          </p>

          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                minWidth: 200,
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
                placeholder="Search by title, artist, or genre..."
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
                data-testid="input-search-top25"
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

            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              style={{
                background: "rgba(108,240,255,.06)",
                border: "1px solid rgba(108,240,255,.15)",
                borderRadius: 8,
                color: "#e0e6f0",
                padding: "10px 14px",
                fontSize: "0.9rem",
                outline: "none",
                cursor: "pointer",
                minWidth: 140,
              }}
              data-testid="select-genre-filter"
            >
              <option value="all" style={{ background: "#0d1220" }}>All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g} style={{ background: "#0d1220" }}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || genreFilter !== "all") && (
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
                onClick={() => {
                  setSearchQuery("");
                  setGenreFilter("all");
                }}
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
                Clear filters
              </button>
            </div>
          )}

          <div className="list tall" data-testid="list-top25">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="row"
                  style={{ height: 74, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
                  data-testid={`skeleton-track-${i}`}
                />
              ))
            ) : filtered.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px 0", color: "rgba(170,182,232,.6)" }}
                data-testid="empty-top25"
              >
                {searchQuery || genreFilter !== "all"
                  ? "No tracks match your search"
                  : "No top tracks found"}
              </div>
            ) : (
              filtered.map((track) => (
                <TrackRow key={track.id} track={track} showRank showDownload />
              ))
            )}
          </div>
        </section>

        {winners.length > 0 && (
          <section className="panel" style={{ padding: "20px 24px", marginTop: 24 }}>
            <div className="section-header" style={{ marginBottom: 4 }}>
              <h3 data-testid="panel-header-hall-of-fame" style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: 10 }}>
                <Trophy style={{ width: 20, height: 20, color: "#ffd700" }} />
                Hall of Fame
              </h3>
            </div>
            <p style={{ color: "rgba(170,182,232,.5)", fontSize: "0.8rem", margin: "0 0 16px", padding: "0 2px" }} data-testid="text-hof-subtitle">
              Weekly #1 champions — retired from Top 25 competition.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {winners.map((w, i) => (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: i === 0 ? "linear-gradient(135deg, rgba(255,215,0,.08), rgba(255,79,216,.06))" : "rgba(108,240,255,.04)",
                    border: `1px solid ${i === 0 ? "rgba(255,215,0,.2)" : "rgba(108,240,255,.08)"}`,
                  }}
                  data-testid={`hall-of-fame-entry-${w.id}`}
                >
                  {w.coverUrl ? (
                    <img
                      src={w.coverUrl}
                      alt={w.trackTitle}
                      style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #ffd700, #ff4fd8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Crown style={{ width: 22, height: 22, color: "#fff" }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-testid={`text-hof-title-${w.id}`}>
                      {w.trackTitle}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(170,182,232,.6)", marginTop: 2 }} data-testid={`text-hof-artist-${w.id}`}>
                      {w.artist}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.75rem", color: "#ffd700", fontWeight: 700 }}>
                      Week of {new Date(w.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(170,182,232,.4)", marginTop: 2 }}>
                      {w.likeCount} likes · {w.playCount} plays
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
