import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { type Track, type Creator } from "@shared/schema";

const GENRE_GROUPS = [
  {
    name: "Electronic",
    genres: ["EDM", "House", "Techno", "Trance", "Drum & Bass", "Dubstep", "Future Bass", "Synthwave", "Chillstep"],
  },
  {
    name: "Hip Hop & R&B",
    genres: ["Hip Hop", "Rap", "Trap", "R&B", "Neo-Soul"],
  },
  {
    name: "Pop & More",
    genres: ["Pop", "Dance Pop", "Indie Pop", "Electro Pop"],
  },
  {
    name: "Rock & Metal",
    genres: ["Rock", "Alt Rock", "Metal", "Industrial"],
  },
  {
    name: "Chill & Instrumental",
    genres: ["Lo-Fi", "Ambient", "Instrumental", "Cinematic", "Piano"],
  },
  {
    name: "Roots & Other",
    genres: ["Country", "Blues", "Jazz", "Reggae", "Experimental"],
  },
];

function formatPlays(plays: number) {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
}

function TrackRow({ track, showRank }: { track: Track; showRank?: boolean }) {
  return (
    <div
      className="row"
      data-testid={`track-row-${track.id}`}
    >
      <div className="thumb">
        {showRank && track.rank ? (
          <span className="rankBadge" data-testid={`text-rank-${track.rank}`}>#{track.rank}</span>
        ) : (
          <div className="play-btn">&#9654;</div>
        )}
      </div>
      <div className="meta">
        <div className="title" data-testid={`text-track-title-${track.id}`}>{track.title}</div>
        <div className="by" data-testid={`text-track-artist-${track.id}`}>{track.artist}</div>
      </div>
      <div className="stat" data-testid={`text-track-plays-${track.id}`}>{formatPlays(track.plays)}</div>
    </div>
  );
}

function TrackList({
  title,
  subtitle,
  tracks,
  showRank,
  tall,
  isLoading,
  testId,
}: {
  title: string;
  subtitle?: string;
  tracks: Track[];
  showRank?: boolean;
  tall?: boolean;
  isLoading?: boolean;
  testId?: string;
}) {
  return (
    <section className="panel">
      <div className="ph">
        <h3 data-testid={`panel-header-${testId}`}>{title}</h3>
        {subtitle && <div className="mini">{subtitle}</div>}
      </div>
      <div className={`list${tall ? " tall" : ""}`} data-testid={`list-${testId}`}>
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
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(170,182,232,.6)" }} data-testid={`empty-${testId}`}>
            No tracks found
          </div>
        ) : (
          tracks.map((track) => (
            <TrackRow key={track.id} track={track} showRank={showRank} />
          ))
        )}
      </div>
    </section>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div className="creator" data-testid={`creator-card-${creator.id}`}>
      <div className="avatar" />
      <div>
        <div className="cname" data-testid={`text-creator-name-${creator.id}`}>{creator.name}</div>
        <div className="ctext" data-testid={`text-creator-tracks-${creator.id}`}>
          {creator.trackCount} New Track{creator.trackCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeGenre, setActiveGenre] = useState("EDM");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: trending = [], isLoading: trendingLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "trending"],
  });

  const { data: newSongs = [], isLoading: newSongsLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "new"],
  });

  const { data: topTracks = [], isLoading: topLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "top25"],
  });

  const { data: creators = [], isLoading: creatorsLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  const filteredTrending = searchQuery
    ? trending.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : trending;

  const filteredNew = searchQuery
    ? newSongs.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : newSongs;

  return (
    <div className="hwm-app">
      <div className="bg-lines" />

      <header className="hwm-header" data-testid="header-main">
        <div className="brand">
          <div className="brand-name" data-testid="text-brand-name">HIT WAVE MEDIA</div>
          <div className="brand-tag" data-testid="text-brand-tagline">The Home of AI Music</div>
        </div>

        <div className="search-wrap">
          <label className="search-box">
            <Search className="search-icon" style={{ width: 18, height: 18, opacity: 0.75, color: "rgba(234,240,255,.8)", flexShrink: 0 }} />
            <input
              type="search"
              placeholder="Search tracks, creators, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tracks, creators, and genres"
              data-testid="input-search"
            />
          </label>
        </div>

        <div className="auth">
          <a href="#" className="auth-link" data-testid="link-creators-login">Creators Login</a>
          <button className="auth-btn" data-testid="button-sign-up">Sign Up</button>
        </div>
      </header>

      <section className="hero" data-testid="section-hero">
        <div className="hero-glow" />
        <h1 className="hero-title" data-testid="text-hero-title">
          <span className="hero-title-hit">HIT</span>{" "}
          <span className="hero-title-wave">WAVE</span>{" "}
          <span className="hero-title-media">MEDIA</span>
        </h1>
        <div className="hero-divider" />
        <h2 data-testid="text-hero-subtitle">The Home of AI Music</h2>

        <div className="hero-badges">
          <span className="hero-badge badge-cyan">Trending Tracks</span>
          <span className="hero-badge badge-purple">Top Charts</span>
          <span className="hero-badge badge-pink">New Creators</span>
        </div>
      </section>

      <div className="wrap" data-testid="section-content">
        <div className="grid-layout">
          <aside className="panel sidebar-panel" data-testid="sidebar-genres">
            <div className="ph">
              <h3 data-testid="panel-header-genres">Explore Sounds</h3>
              <div className="mini">Genres</div>
            </div>
            <nav className="genres" aria-label="Genre navigation" data-testid="nav-genres">
              {GENRE_GROUPS.map((group) => (
                <div
                  key={group.name}
                  className="genre-group"
                  data-testid={`genre-group-${group.name.toLowerCase().replace(/[^a-z]/g, "-")}`}
                >
                  <div className="genre-group-title">
                    {group.name} <span style={{ opacity: 0.7 }}>&#9662;</span>
                  </div>
                  <div className="genre-items">
                    {group.genres.map((genre) => (
                      <div
                        key={genre}
                        className={`genre-item${activeGenre === genre ? " active" : ""}`}
                        onClick={() => setActiveGenre(genre)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={activeGenre === genre}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveGenre(genre); }}
                        data-testid={`button-genre-${genre.toLowerCase().replace(/[^a-z]/g, "-")}`}
                      >
                        {genre}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <main className="stack" data-testid="section-main">
            <TrackList
              title="Trending Now"
              subtitle="scroll"
              tracks={filteredTrending}
              tall
              isLoading={trendingLoading}
              testId="trending"
            />
            <TrackList
              title="New Songs of the Week"
              subtitle="scroll"
              tracks={filteredNew}
              isLoading={newSongsLoading}
              testId="new-songs"
            />
          </main>

          <aside className="stack" data-testid="sidebar-right">
            <TrackList
              title="Top 25 This Week"
              subtitle="scroll"
              tracks={topTracks}
              showRank
              tall
              isLoading={topLoading}
              testId="top25"
            />
            <section className="panel">
              <div className="ph">
                <h3 data-testid="panel-header-creators">New Creators of the Week</h3>
                <div className="mini">scroll</div>
              </div>
              <div className="creators-grid" data-testid="list-creators">
                {creatorsLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="creator"
                      style={{ height: 62, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
                      data-testid={`skeleton-creator-${i}`}
                    />
                  ))
                ) : creators.length === 0 ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "32px 0", color: "rgba(170,182,232,.6)" }} data-testid="empty-creators">
                    No creators yet
                  </div>
                ) : (
                  creators.map((creator) => <CreatorCard key={creator.id} creator={creator} />)
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
