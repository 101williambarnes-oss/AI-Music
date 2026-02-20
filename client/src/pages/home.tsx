import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track, type Creator } from "@shared/schema";
import { Search } from "lucide-react";
import heroBg from "@assets/ChatGPT_Image_Feb_18,_2026,_05_26_22_PM_1771460797070.png";
import { TrackRow } from "@/components/track-row";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

const ALL_GENRES = [
  "Pop", "Dance Pop", "Indie Pop", "Electro Pop",
  "Hip Hop", "Rap", "Trap",
  "EDM", "House", "Techno", "Trance", "Drum & Bass", "Dubstep", "Future Bass",
  "Rock", "Alt Rock", "Metal", "Industrial",
  "Country", "Blues", "Americana",
  "Cinematic", "Orchestral", "Epic", "Soundtrack",
  "Lo-Fi", "Chillhop", "Study Beats",
  "R&B", "Neo-Soul", "Soul",
  "Experimental", "Ambient", "Glitch", "Synthwave",
  "Electronic",
];

function GenreColumn({
  genre,
  tracks,
  id,
}: {
  genre: string;
  tracks: Track[];
  id: string;
}) {
  return (
    <section className="panel column-panel" id={id} data-testid={`section-genre-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
      <div className="section-header">
        <h3 data-testid={`panel-header-genre-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>{genre}</h3>
        <span className="genre-count" data-testid={`text-genre-count-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>{tracks.length} song{tracks.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="list column-list" data-testid={`list-genre-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
        {tracks.map((track) => (
          <TrackRow key={track.id} track={track} />
        ))}
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
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

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

  const { data: allTracks = [], isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "all"],
  });

  const { data: creators = [], isLoading: creatorsLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  const genreMap = useMemo(() => {
    const map = new Map<string, Track[]>();
    let tracks = allTracks;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tracks = tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q)
      );
    }

    for (const track of tracks) {
      const genreKey = track.genre.trim();
      const existing = map.get(genreKey) || [];
      existing.push(track);
      map.set(genreKey, existing);
    }
    return map;
  }, [allTracks, searchQuery]);

  const activeGenres = useMemo(() => {
    const ordered: string[] = [];
    const mapKeys = Array.from(genreMap.keys());
    for (const g of ALL_GENRES) {
      const key = mapKeys.find((k) => k.toLowerCase() === g.toLowerCase());
      if (key && genreMap.get(key)!.length > 0) {
        ordered.push(key);
      }
    }
    for (const key of mapKeys) {
      if (!ordered.some((o) => o.toLowerCase() === key.toLowerCase())) {
        ordered.push(key);
      }
    }
    return ordered;
  }, [genreMap]);

  function genreId(genre: string) {
    return "genre-" + genre.toLowerCase().replace(/[^a-z0-9]/g, "-");
  }

  function scrollToGenre(genre: string) {
    const el = document.getElementById(genreId(genre));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }

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
        {activeGenres.map((genre) => (
          <button
            key={genre}
            className="genre-pill"
            onClick={() => scrollToGenre(genre)}
            data-testid={`button-genre-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="genre-columns" ref={columnsRef} data-testid="section-content">
        {tracksLoading ? (
          [1, 2, 3, 4].map((i) => (
            <section key={i} className="panel column-panel" data-testid={`skeleton-column-${i}`}>
              <div className="section-header">
                <h3 style={{ opacity: 0.3 }}>Loading...</h3>
              </div>
              <div className="list column-list">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="row"
                    style={{ height: 74, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
                  />
                ))}
              </div>
            </section>
          ))
        ) : activeGenres.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(170,182,232,.6)", gridColumn: "1/-1" }} data-testid="empty-genres">
            No tracks found
          </div>
        ) : (
          activeGenres.map((genre) => (
            <GenreColumn
              key={genre}
              genre={genre}
              tracks={genreMap.get(genre) || []}
              id={genreId(genre)}
            />
          ))
        )}

        <section className="panel column-panel" data-testid="section-creators">
          <div className="section-header">
            <h3 data-testid="panel-header-creators">Creators</h3>
            <span className="genre-count" data-testid="text-creators-count">
              {creators.length} creator{creators.length !== 1 ? "s" : ""}
            </span>
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
