import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track, type Creator } from "@shared/schema";
import { Search, Music, User, X } from "lucide-react";
import heroBg from "@assets/ChatGPT_Image_Feb_18,_2026,_05_26_22_PM_1771460797070.png";
import { TrackRow } from "@/components/track-row";
import { useLocation } from "wouter";
import { ALL_GENRES } from "@/lib/genres";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };



export default function Home() {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [, navigate] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

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

  const { data: creators = [] } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  const genreTracks = activeGenre
    ? allTracks.filter((t) => t.genre.toLowerCase() === activeGenre.toLowerCase())
    : [];

  function searchFilter(tracks: Track[]) {
    if (!searchQuery) return tracks;
    const q = searchQuery.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
    );
  }

  const filteredGenre = searchFilter(genreTracks);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResultTracks = searchQuery.length >= 1
    ? allTracks.filter((t) => {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.genre.toLowerCase().includes(q);
      }).slice(0, 8)
    : [];

  const searchResultCreators = searchQuery.length >= 1
    ? creators.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const hasSearchResults = searchResultTracks.length > 0 || searchResultCreators.length > 0;

  function handleSearchSubmit() {
    if (!searchQuery.trim()) return;
    if (searchResultCreators.length === 1 && searchResultTracks.length === 0) {
      navigate(`/creator/${searchResultCreators[0].id}`);
      setShowDropdown(false);
      setSearchQuery("");
      return;
    }
    if (searchResultTracks.length === 1 && searchResultCreators.length === 0) {
      const track = searchResultTracks[0];
      if (track.creatorId) {
        navigate(`/creator/${track.creatorId}`);
      }
      setShowDropdown(false);
      setSearchQuery("");
      return;
    }
    setShowDropdown(true);
  }

  function clearSearch() {
    setSearchQuery("");
    setShowDropdown(false);
  }

  return (
    <div className="hwm-app">
      <div className="bg-lines" />

      <header className="site-topbar" data-testid="header-main">
        <div className="topbar-left">
          <div className="logo" data-testid="text-brand-name">HIT WAVE MEDIA</div>
        </div>
        <div className="topbar-center">
          <div className="search-wrap" ref={searchRef}>
            <div className="search-box">
              <Search className="search-icon" style={{ width: 16, height: 16, opacity: 0.6, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search tracks, creators, genres..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 1) setShowDropdown(true);
                  else setShowDropdown(false);
                }}
                onFocus={() => { if (searchQuery.length >= 1) setShowDropdown(true); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
                aria-label="Search tracks, creators, and genres"
                data-testid="input-search"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={clearSearch}
                  data-testid="button-search-clear"
                  aria-label="Clear search"
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
              <button
                className="search-submit"
                onClick={handleSearchSubmit}
                data-testid="button-search-submit"
                aria-label="Search"
              >
                <Search style={{ width: 16, height: 16 }} />
              </button>
            </div>
            {showDropdown && searchQuery && (
              <div className="search-dropdown" data-testid="search-dropdown">
                {!hasSearchResults ? (
                  <div className="search-no-results" data-testid="text-no-results">No results found for "{searchQuery}"</div>
                ) : (
                  <>
                    {searchResultCreators.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-label">Creators</div>
                        {searchResultCreators.map((c) => (
                          <a
                            key={c.id}
                            href={`/creator/${c.id}`}
                            className="search-result-item"
                            onClick={() => { setShowDropdown(false); setSearchQuery(""); }}
                            data-testid={`search-result-creator-${c.id}`}
                          >
                            <User style={{ width: 14, height: 14, opacity: 0.6, flexShrink: 0 }} />
                            <span className="search-result-name">{c.name}</span>
                            <span className="search-result-meta">{c.trackCount} track{c.trackCount !== 1 ? "s" : ""}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    {searchResultTracks.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-label">Tracks</div>
                        {searchResultTracks.map((t) => (
                          <a
                            key={t.id}
                            href={t.creatorId ? `/creator/${t.creatorId}` : "#"}
                            className="search-result-item"
                            onClick={() => { setShowDropdown(false); setSearchQuery(""); }}
                            data-testid={`search-result-track-${t.id}`}
                          >
                            <Music style={{ width: 14, height: 14, opacity: 0.6, flexShrink: 0 }} />
                            <span className="search-result-name">{t.title}</span>
                            <span className="search-result-meta">{t.artist} · {t.genre}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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

      <nav className="quick-nav" data-testid="nav-quick-links">
        <a href="/top-25" className="quick-nav-tab" data-testid="link-quick-top25">
          Top 25
        </a>
        <a href="/trending" className="quick-nav-tab" data-testid="link-quick-trending">
          Trending
        </a>
        <a href="/new-songs" className="quick-nav-tab" data-testid="link-quick-new-songs">
          New Songs
        </a>
        <a href="/new-creators" className="quick-nav-tab" data-testid="link-quick-new-creators">
          New Creators
        </a>
      </nav>

      <div className="five-columns" data-testid="section-content">
        <section className="panel column-panel genre-sidebar" data-testid="section-genres">
          <div className="section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <h3 data-testid="panel-header-genres">{activeGenre ? activeGenre : "Genres"}</h3>
            {activeGenre && (
              <button
                onClick={() => setActiveGenre(null)}
                className="genre-close-btn"
                title="Back to Genres"
                data-testid="button-close-genre"
              >
                &#10005;
              </button>
            )}
          </div>
          {activeGenre ? (
            <div className="list column-list" data-testid="list-genre-results">
              {tracksLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="row"
                    style={{ height: 74, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
                  />
                ))
              ) : filteredGenre.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(170,182,232,.6)" }} data-testid="empty-genre-results">
                  No tracks found in {activeGenre}
                </div>
              ) : (
                filteredGenre.map((track) => (
                  <TrackRow key={track.id} track={track} hideComments showDownload />
                ))
              )}
            </div>
          ) : (
            <div className="genre-list column-list" data-testid="list-genres">
              <button
                className={`genre-item${activeGenre === null ? " active" : ""}`}
                onClick={() => setActiveGenre(null)}
                data-testid="button-genre-all"
              >
                All Genres
              </button>
              {ALL_GENRES.map((genre) => (
                <button
                  key={genre}
                  className={`genre-item${activeGenre === genre ? " active" : ""}`}
                  onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
                  data-testid={`button-genre-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
