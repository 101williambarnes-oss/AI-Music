import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track, type Creator, type Album } from "@shared/schema";
import { Search, Music, User, X, ChevronRight, Disc3, LogOut, Shield } from "lucide-react";
import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";
import { useLocation } from "wouter";
import { TrackRow } from "@/components/track-row";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

type TrackWithLikes = Track & { likeCount?: number };

type AlbumWithInfo = Album & { trackCount: number; creatorName: string };

type HomeData = {
  top25: TrackWithLikes[];
  trending: TrackWithLikes[];
  newSongs: TrackWithLikes[];
  newCreators: Creator[];
  albums: AlbumWithInfo[];
};

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cleanMode, setCleanMode] = useState(() => {
    try { return localStorage.getItem("hwm_clean_mode") === "true"; } catch { return false; }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [, navigate] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hwm_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) setUser(parsed);
        else localStorage.removeItem("hwm_user");
      }
    } catch { localStorage.removeItem("hwm_user"); }
  }, []);

  const { data: homeData, isLoading } = useQuery<HomeData>({ queryKey: ["/api/home-data"] });
  const { data: allTracks = [] } = useQuery<Track[]>({ queryKey: ["/api/tracks", "all"] });
  const { data: creators = [] } = useQuery<Creator[]>({ queryKey: ["/api/creators"] });

  function cleanFilter(tracks: TrackWithLikes[]) {
    if (!cleanMode) return tracks;
    return tracks.filter((t) => !t.explicit);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
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
      navigate(`/creator/${searchResultCreators[0].id}`); setShowDropdown(false); setSearchQuery(""); return;
    }
    if (searchResultTracks.length === 1 && searchResultCreators.length === 0) {
      const t = searchResultTracks[0];
      if (t.creatorId) navigate(`/creator/${t.creatorId}`);
      setShowDropdown(false); setSearchQuery(""); return;
    }
    setShowDropdown(true);
  }

  const top25 = cleanFilter(homeData?.top25 || []);
  const trending = cleanFilter(homeData?.trending || []);
  const newSongs = cleanFilter(homeData?.newSongs || []);
  const newCreators = homeData?.newCreators || [];
  const albums = homeData?.albums || [];

  return (
    <div className="hwm-app mockup-bg">
      <header className="mockup-topbar" data-testid="header-main">
        <div className="mockup-topbar-row1">
          <a href="/" data-testid="link-logo" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src={siteLogo} alt="Hit Wave Media" className="mockup-logo" data-testid="img-logo" />
          </a>
          <nav className="mockup-topbar-nav mockup-nav-row1" data-testid="nav-quick-links">
            <a href="/top-25" data-testid="link-quick-top25">Top 25</a>
            <a href="/trending" data-testid="link-quick-trending">Trending</a>
            <a href="/new-songs" data-testid="link-quick-new-songs">New Songs</a>
            <a href="/new-creators" data-testid="link-quick-new-creators">New Creators</a>
            <a href="/albums" data-testid="link-quick-albums">Albums</a>
            <a href="/playlist" data-testid="link-quick-playlist">My Playlist</a>
            {user && user.creatorId && (
              <a href={`/creator/${user.creatorId}`} data-testid="link-mobile-my-library">My Library</a>
            )}
            <a href="/jukebox" data-testid="link-quick-jukebox">Jukebox</a>
            <a href="/about" data-testid="link-quick-about">About Us</a>
            {user && user.id === 2 && (
              <a href="/admin" data-testid="link-mobile-admin">Admin</a>
            )}
          </nav>
        </div>
        <div className="mockup-topbar-row2">
          <div className="mockup-row2-spacer"></div>
          <div className="mockup-brand-center" data-testid="text-brand">
            <span className="mockup-brand-hwm">Hit Wave Media</span>{" "}
            <span className="mockup-brand-for">for</span>{" "}
            <span className="mockup-brand-mc">Music Creators</span>
            <span className="mockup-brand-dash">—</span>
            <span className="mockup-brand-ai" data-testid="text-tagline">AI-Only Music Platform</span>
          </div>
          <div className="mockup-row2-right">
            <div className="mockup-search-bar" ref={searchRef} data-testid="search-bar">
              <Search size={15} className="mockup-search-icon" />
              <input
                type="text"
                placeholder="Search songs, artists..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => { if (searchQuery.length >= 1) setShowDropdown(true); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
                className="mockup-search-input"
                data-testid="input-search"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setShowDropdown(false); }} className="mockup-search-clear" data-testid="button-search-clear">
                  <X size={13} />
                </button>
              )}
              {showDropdown && hasSearchResults && (
                <div className="mockup-search-dropdown" data-testid="search-dropdown">
                  {searchResultTracks.map((t) => (
                    <a
                      key={t.id}
                      href={`/track/${t.id}`}
                      className="mockup-search-result"
                      onClick={() => { setShowDropdown(false); setSearchQuery(""); }}
                      data-testid={`search-result-track-${t.id}`}
                    >
                      <Music size={13} />
                      <span>{t.title}</span>
                      <span className="mockup-search-result-artist">- {t.artist}</span>
                    </a>
                  ))}
                  {searchResultCreators.map((c) => (
                    <a
                      key={c.id}
                      href={`/creator/${c.id}`}
                      className="mockup-search-result"
                      onClick={() => { setShowDropdown(false); setSearchQuery(""); }}
                      data-testid={`search-result-creator-${c.id}`}
                    >
                      <User size={13} />
                      <span>{c.name}</span>
                      <span className="mockup-search-result-artist">Creator</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            {user ? (
              <>
                <a href={user.creatorId ? `/creator/${user.creatorId}` : "/upload"} className="mockup-nav-user" data-testid="link-user-profile">
                  <User size={14} /> {user.name}
                </a>
                {user.id === 2 && (
                  <a href="/admin" className="mockup-nav-auth-btn mockup-nav-creator" data-testid="link-admin" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Shield size={13} /> Admin
                  </a>
                )}
                <button
                  className="mockup-nav-auth-btn mockup-nav-logout"
                  onClick={() => {
                    fetch("/api/auth/signout", { method: "POST" });
                    localStorage.removeItem("hwm_user");
                    setUser(null);
                  }}
                  data-testid="button-logout"
                >
                  <LogOut size={13} /> Log Out
                </button>
              </>
            ) : (
              <>
                <a href="/sign-in" className="mockup-nav-auth-btn mockup-nav-creator" data-testid="link-creator-login">Creator Sign In</a>
                <a href="/sign-up" className="mockup-nav-auth-btn mockup-nav-creator" data-testid="link-creator-signup">Creator Sign Up</a>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mockup-three-col" data-testid="section-content">
        <section className="mockup-panel" data-testid="section-top25">
          <div className="mockup-panel-header">
            <span className="mockup-panel-title">Top 25 Trending Songs</span>
            <a href="/top-25" className="mockup-see-all" data-testid="link-top25-see-all">See All <ChevronRight size={13} /></a>
          </div>
          {isLoading ? (
            <div className="mockup-loading">Loading...</div>
          ) : (
            <div className="mockup-top25-list">
              {top25.map((track) => (
                <TrackRow key={track.id} track={track} showRank hideLibrary hidePlaylistBtn />
              ))}
            </div>
          )}
        </section>

        <section className="mockup-panel" data-testid="section-new-songs">
          <div className="mockup-panel-header">
            <span className="mockup-panel-title">New Songs</span>
            <a href="/new-songs" className="mockup-see-all" data-testid="link-new-songs-see-all">See All <ChevronRight size={13} /></a>
          </div>
          {isLoading ? (
            <div className="mockup-loading">Loading...</div>
          ) : (
            <div className="mockup-newsong-list">
              {newSongs.map((track) => (
                <TrackRow key={track.id} track={track} hidePlaylistBtn />
              ))}
            </div>
          )}
        </section>

        <div className="mockup-col-right">
          <section className="mockup-panel" data-testid="section-new-creators">
            <div className="mockup-panel-header">
              <span className="mockup-panel-title">New Creators</span>
              <a href="/new-creators" className="mockup-see-all" data-testid="link-new-creators-see-all">See All <ChevronRight size={13} /></a>
            </div>
            {isLoading ? (
              <div className="mockup-loading">Loading...</div>
            ) : (
              <div className="mockup-creators-list">
                {newCreators.map((creator) => (
                  <a
                    key={creator.id}
                    href={`/creator/${creator.id}`}
                    className="mockup-creator-row"
                    data-testid={`home-creator-${creator.id}`}
                  >
                    <div className="mockup-creator-avatar">
                      {creator.avatarUrl ? (
                        <img src={creator.avatarUrl} alt={creator.name} />
                      ) : (
                        <User size={18} style={{ color: "rgba(160,107,255,.6)" }} />
                      )}
                    </div>
                    <span className="mockup-creator-name">{creator.name}</span>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="mockup-panel" data-testid="section-albums">
            <div className="mockup-panel-header">
              <span className="mockup-panel-title">New Albums</span>
              <a href="/albums" className="mockup-see-all" data-testid="link-albums-see-all">See All <ChevronRight size={13} /></a>
            </div>
            {isLoading ? (
              <div className="mockup-loading">Loading...</div>
            ) : albums.length === 0 ? (
              <div style={{ padding: "20px 16px", textAlign: "center", color: "rgba(170,182,232,.4)", fontSize: 13 }}>No albums yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 0" }}>
                {albums.map((album) => (
                  <a
                    key={album.id}
                    href={`/album/${album.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 14px",
                      textDecoration: "none",
                      borderRadius: 8,
                      transition: "background .2s",
                    }}
                    className="mockup-album-row"
                    data-testid={`album-card-${album.id}`}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 8, overflow: "hidden",
                      background: "rgba(160,107,255,.08)", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid rgba(108,240,255,.1)",
                    }}>
                      {album.coverUrl ? (
                        <img src={album.coverUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Disc3 size={22} style={{ color: "rgba(160,107,255,.3)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(170,182,232,.5)" }}>{album.creatorName} · {album.trackCount} track{album.trackCount !== 1 ? "s" : ""}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="mockup-panel" data-testid="section-trending">
            <div className="mockup-panel-header">
              <span className="mockup-panel-title">Trending Songs</span>
              <a href="/trending" className="mockup-see-all" data-testid="link-trending-see-all">See All <ChevronRight size={13} /></a>
            </div>
            {isLoading ? (
              <div className="mockup-loading">Loading...</div>
            ) : (
              <div className="mockup-trending-list">
                {trending.map((track) => (
                  <TrackRow key={track.id} track={track} hideLibrary hidePlaylistBtn />
                ))}
              </div>
            )}
          </section>

          <section className="mockup-panel" data-testid="section-jukebox-promo">
            <div className="mockup-panel-header">
              <span className="mockup-panel-title">Jukebox</span>
              <a href="/jukebox" className="mockup-see-all" data-testid="link-jukebox-see-all">Open Jukebox <ChevronRight size={13} /></a>
            </div>
            <a href="/jukebox" style={{ display: "block", padding: "16px", textDecoration: "none", textAlign: "center" }} data-testid="link-jukebox-promo">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "18px 20px", borderRadius: 12, background: "linear-gradient(135deg, rgba(160,107,255,.1), rgba(255,79,216,.06))", border: "1px solid rgba(160,107,255,.2)" }}>
                <Music size={22} style={{ color: "#a06bff" }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#eaf0ff" }}>Browse the Jukebox</div>
                  <div style={{ fontSize: 11, color: "rgba(170,182,232,.5)", marginTop: 2 }}>Visual grid of tracks with cover art</div>
                </div>
              </div>
            </a>
          </section>
        </div>
      </div>

      <footer className="mockup-footer" data-testid="footer">
        <a href="/terms" data-testid="link-footer-terms">Terms of Service</a>
        <span> · </span>
        <span>&copy; {new Date().getFullYear()} Hit Wave Media</span>
      </footer>
    </div>
  );
}
