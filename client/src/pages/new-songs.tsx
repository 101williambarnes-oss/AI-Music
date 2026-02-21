import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track } from "@shared/schema";
import { TrackRow } from "@/components/track-row";
import { Search, X } from "lucide-react";
import { ALL_GENRES } from "@/lib/genres";

export default function NewSongs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");

  const { data: tracks = [], isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "new"],
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
            <h3 data-testid="panel-header-new-songs" style={{ fontSize: "1.3rem" }}>
              New Songs of the Week
            </h3>
          </div>
          <p style={{ color: "rgba(170,182,232,.5)", fontSize: "0.8rem", margin: "0 0 16px", padding: "0 2px" }} data-testid="text-new-songs-subtitle">
            Songs stay up for 7 days after upload, then rotate out for fresh music.
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
                data-testid="input-search-new-songs"
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
            ) : filtered.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px 0", color: "rgba(170,182,232,.6)" }}
                data-testid="empty-new-songs"
              >
                {searchQuery || genreFilter !== "all"
                  ? "No songs match your search"
                  : "No new songs found"}
              </div>
            ) : (
              filtered.map((track) => (
                <TrackRow key={track.id} track={track} showDownload />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
