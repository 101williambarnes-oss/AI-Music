import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track, type Creator } from "@shared/schema";
import { Search } from "lucide-react";
import heroBg from "@assets/ChatGPT_Image_Feb_18,_2026,_05_26_22_PM_1771460797070.png";
import { TrackRow } from "@/components/track-row";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

const GENRE_GROUPS = [
  {
    name: "Pop",
    genres: ["Pop", "Dance Pop", "Indie Pop", "Electro Pop"],
  },
  {
    name: "Hip Hop",
    genres: ["Hip Hop", "Rap", "Trap"],
  },
  {
    name: "EDM",
    genres: ["EDM", "House", "Techno", "Trance", "Drum & Bass", "Dubstep", "Future Bass"],
  },
  {
    name: "Rock",
    genres: ["Rock", "Alt Rock", "Metal", "Industrial"],
  },
  {
    name: "Country",
    genres: ["Country", "Blues", "Americana"],
  },
  {
    name: "Cinematic",
    genres: ["Cinematic", "Orchestral", "Epic", "Soundtrack"],
  },
  {
    name: "Lo-Fi",
    genres: ["Lo-Fi", "Chillhop", "Study Beats"],
  },
  {
    name: "R&B",
    genres: ["R&B", "Neo-Soul", "Soul"],
  },
  {
    name: "Experimental",
    genres: ["Experimental", "Ambient", "Glitch", "Synthwave"],
  },
];

function TrackList({
  title,
  tracks,
  showRank,
  isLoading,
  testId,
}: {
  title: string;
  tracks: Track[];
  showRank?: boolean;
  isLoading?: boolean;
  testId?: string;
}) {
  return (
    <section className="panel column-panel" data-testid={`section-${testId}`}>
      <div className="section-header">
        <h3 data-testid={`panel-header-${testId}`}>{title}</h3>
      </div>
      <div className="list column-list" data-testid={`list-${testId}`}>
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
    <a href={`/creator/${creator.id}`} style={{ textDecoration: "none", color: "inherit" }} data-testid={`creator-card-${creator.id}`}>
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
  );
}

export default function Home() {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hwm_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          setUser(parsed);
        } else {
          localStorage.removeItem("hwm_user");
        }
      }
    } catch {
      localStorage.removeItem("hwm_user");
    }
  }, []);

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

  function filterTracks(tracks: Track[]) {
    let result = tracks;
    if (activeGenre) {
      result = result.filter(
        (t) => t.genre.toLowerCase() === activeGenre.toLowerCase()
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q)
      );
    }
    return result;
  }

  const filteredTrending = filterTracks(trending);
  const filteredNew = filterTracks(newSongs);
  const filteredTop = filterTracks(topTracks);

  return (
    <div className="hwm-app">
      <div className="bg-lines" />

      <header className="site-topbar" data-testid="header-main">
        <div className="topbar-left">
          <div className="logo" data-testid="text-brand-name">HIT WAVE MEDIA</div>
        </div>
        <div className="topbar-center">
          <div className="search-wrap">
            <label className="search-box">
              <Search className="search-icon" style={{ width: 16, height: 16, opacity: 0.6, flexShrink: 0 }} />
              <input
                type="search"
                placeholder="Search tracks, creators, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tracks, creators, and genres"
                data-testid="input-search"
              />
            </label>
            <div className="search-tagline" data-testid="text-tagline">Search and listen. No account required.</div>
          </div>
        </div>
        <div className="topbar-actions">
          {user ? (
            <>
              <a href={user.creatorId ? `/creator/${user.creatorId}` : "/"} className="topbar-login" data-testid="link-creators-login">Creators Login</a>
              <button
                className="topbar-login"
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit", padding: 0 }}
                onClick={async () => {
                  await fetch("/api/auth/signout", { method: "POST" });
                  localStorage.removeItem("hwm_user");
                  setUser(null);
                }}
                data-testid="button-signout"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a href="/sign-in" className="topbar-login" data-testid="link-creators-login">Creators Login</a>
              <a href="/sign-up" className="topbar-signup" data-testid="button-sign-up">Sign Up</a>
            </>
          )}
        </div>
      </header>

      <section className="hero" data-testid="section-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="heroContent" aria-hidden="true">
          <h1 className="heroTitle sr-only" data-testid="text-hero-title">HIT WAVE MEDIA</h1>
          <div className="heroSubtitle sr-only" data-testid="text-hero-subtitle">The Home of AI Music</div>
        </div>
      </section>

      <div className="genre-bar" data-testid="genre-bar">
        <button
          className={`genre-pill${activeGenre === null ? " active" : ""}`}
          onClick={() => setActiveGenre(null)}
          data-testid="button-genre-all"
        >
          All Genres
        </button>
        {GENRE_GROUPS.map((group) =>
          group.genres.map((genre) => (
            <button
              key={genre}
              className={`genre-pill${activeGenre === genre ? " active" : ""}`}
              onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
              data-testid={`button-genre-${genre.toLowerCase().replace(/[^a-z]/g, "-")}`}
            >
              {genre}
            </button>
          ))
        )}
      </div>

      <div className="four-columns" data-testid="section-content">
        <TrackList
          title="Trending Now"
          tracks={filteredTrending}
          isLoading={trendingLoading}
          testId="trending"
        />

        <TrackList
          title="Top 25 This Week"
          tracks={filteredTop}
          showRank
          isLoading={topLoading}
          testId="top25"
        />

        <TrackList
          title="New Songs of the Week"
          tracks={filteredNew}
          isLoading={newSongsLoading}
          testId="new-songs"
        />

        <section className="panel column-panel" data-testid="section-creators">
          <div className="section-header">
            <h3 data-testid="panel-header-creators">New Creators of the Week</h3>
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
              <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(170,182,232,.6)" }} data-testid="empty-creators">
                No creators yet
              </div>
            ) : (
              creators.map((creator) => <CreatorCard key={creator.id} creator={creator} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
