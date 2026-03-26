import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track, type Creator } from "@shared/schema";
import { Search, Music, User, X, Library, ListMusic, Heart, Play, ChevronRight, Info, Disc3, GripVertical, LogOut } from "lucide-react";
import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";
import { useLocation } from "wouter";
import { useAudioPlayer } from "@/lib/audioPlayer";


type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

type TrackWithLikes = Track & { likeCount?: number };

type HomeData = {
  top25: TrackWithLikes[];
  trending: TrackWithLikes[];
  newSongs: TrackWithLikes[];
  newCreators: Creator[];
};

function Top25Row({ track, index }: { track: TrackWithLikes; index: number }) {
  const { currentTrackId, isPlaying, play, toggle } = useAudioPlayer();
  const isActive = currentTrackId === track.id && isPlaying;

  const handleClick = useCallback(() => {
    if (!track.fileUrl) return;
    if (currentTrackId === track.id) {
      toggle();
    } else {
      play(track.id, track.fileUrl, { title: track.title, artist: track.artist, coverUrl: track.coverUrl, djIntroUrl: (track as any).djIntroUrl });
    }
  }, [track, play, toggle, currentTrackId]);

  return (
    <div
      onClick={handleClick}
      className="mockup-top25-row"
      style={{ background: isActive ? "rgba(160,107,255,.1)" : undefined, cursor: "pointer" }}
      data-testid={`home-track-${track.id}`}
    >
      <span className="mockup-rank" style={{ color: index < 3 ? "#ff4fd8" : "rgba(255,255,255,.45)" }} data-testid={`text-rank-${index + 1}`}>
        {index + 1}.
      </span>
      <div className="mockup-top25-info">
        <div className="mockup-top25-title" data-testid={`text-title-${track.id}`}>{track.title}</div>
        <div className="mockup-top25-artist">{track.artist}</div>
      </div>
      <span className="mockup-plays">{(track.plays || 0).toLocaleString()}</span>
      <span className="mockup-likes">
        <Heart size={11} fill="#ff4fd8" color="#ff4fd8" />
        {(track.likeCount || 0).toLocaleString()}
      </span>
    </div>
  );
}

function NewSongRow({ track }: { track: TrackWithLikes }) {
  const { currentTrackId, isPlaying, play, toggle } = useAudioPlayer();
  const isActive = currentTrackId === track.id && isPlaying;
  const { data: creatorData } = useQuery<{ creator: { avatarUrl: string | null } }>({
    queryKey: ["/api/creators", track.creatorId],
    enabled: !!track.creatorId,
  });

  const handleClick = useCallback(() => {
    if (!track.fileUrl) return;
    if (currentTrackId === track.id) {
      toggle();
    } else {
      play(track.id, track.fileUrl, { title: track.title, artist: track.artist, coverUrl: track.coverUrl, djIntroUrl: (track as any).djIntroUrl });
    }
  }, [track, play, toggle, currentTrackId]);

  const thumbSrc = track.coverUrl || creatorData?.creator?.avatarUrl || null;

  return (
    <div
      onClick={handleClick}
      className="mockup-newsong-row"
      style={{ background: isActive ? "rgba(160,107,255,.1)" : undefined, cursor: "pointer" }}
      data-testid={`new-song-card-${track.id}`}
    >
      <div className="mockup-newsong-thumb">
        {thumbSrc ? (
          <img src={thumbSrc} alt={track.title} />
        ) : (
          <div className="mockup-newsong-thumb-placeholder">
            <Music size={24} style={{ color: "rgba(160,107,255,.4)" }} />
          </div>
        )}
        {isActive && (
          <div className="mockup-newsong-playing">
            <span style={{ color: "#fff", fontSize: 12 }}>{"\u275A\u275A"}</span>
          </div>
        )}
      </div>
      <div className="mockup-newsong-info">
        <div className="mockup-newsong-title">
          {track.title} - <span style={{ color: "rgba(108,240,255,.7)" }}>{track.artist}</span>
        </div>
        <div className="mockup-newsong-artist">{track.artist}</div>
      </div>
      <span className="mockup-newsong-plays">{(track.plays || 0).toLocaleString()} Plays</span>
      <Heart size={14} className="mockup-newsong-heart" />
      <GripVertical size={14} className="mockup-newsong-menu" />
    </div>
  );
}

function TrendingRow({ track, index }: { track: TrackWithLikes; index: number }) {
  const { currentTrackId, isPlaying, play, toggle } = useAudioPlayer();
  const isActive = currentTrackId === track.id && isPlaying;

  const handleClick = useCallback(() => {
    if (!track.fileUrl) return;
    if (currentTrackId === track.id) {
      toggle();
    } else {
      play(track.id, track.fileUrl, { title: track.title, artist: track.artist, coverUrl: track.coverUrl, djIntroUrl: (track as any).djIntroUrl });
    }
  }, [track, play, toggle, currentTrackId]);

  return (
    <div
      onClick={handleClick}
      className="mockup-trending-row"
      style={{ background: isActive ? "rgba(160,107,255,.1)" : undefined, cursor: "pointer" }}
      data-testid={`trending-track-${track.id}`}
    >
      <span className="mockup-rank" style={{ color: "rgba(255,255,255,.45)" }}>{index + 1}.</span>
      <div className="mockup-trending-info">
        <span className="mockup-trending-title">{track.title}</span>
        <span className="mockup-trending-sep"> - </span>
        <span className="mockup-trending-artist">{track.artist}</span>
      </div>
      <Heart size={13} className="mockup-trending-heart" />
      <GripVertical size={13} className="mockup-trending-menu" />
    </div>
  );
}

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
            <a href="/playlist" data-testid="link-quick-playlist">My Playlist</a>
            {user && user.creatorId && (
              <a href={`/creator/${user.creatorId}`} data-testid="link-mobile-my-library">My Library</a>
            )}
            <a href="/jukebox" data-testid="link-quick-jukebox">Jukebox</a>
            <a href="/about" data-testid="link-quick-about">About Us</a>
          </nav>
        </div>
        <div className="mockup-topbar-row2">
          <div className="mockup-row2-spacer"></div>
          <div className="mockup-brand-center" data-testid="text-brand">
            <span style={{ fontWeight: 900, fontStyle: "italic", color: "#fff", fontSize: "16px" }}>Hit Wave Media</span>{" "}
            <span style={{ fontWeight: 400, fontSize: "12px", color: "rgba(255,255,255,.5)" }}>for</span>{" "}
            <span style={{ fontWeight: 700, color: "#fff", fontSize: "15px" }}>Music Creators</span>
            <span style={{ margin: "0 8px", color: "rgba(108,240,255,.3)" }}>—</span>
            <span style={{ color: "#6cf0ff", fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }} data-testid="text-tagline">AI-Only Music Platform</span>
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
                <a href="/sign-in" className="mockup-nav-auth-btn" data-testid="link-sign-in">Sign In</a>
                <a href="/sign-up" className="mockup-nav-auth-btn mockup-nav-signup" data-testid="link-sign-up">Sign Up</a>
                <span className="mockup-nav-divider">|</span>
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
              {top25.map((track, i) => (
                <Top25Row key={track.id} track={track} index={i} />
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
                <NewSongRow key={track.id} track={track} />
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

          <section className="mockup-panel" data-testid="section-trending">
            <div className="mockup-panel-header">
              <span className="mockup-panel-title">Trending Songs</span>
              <a href="/trending" className="mockup-see-all" data-testid="link-trending-see-all">See All <ChevronRight size={13} /></a>
            </div>
            {isLoading ? (
              <div className="mockup-loading">Loading...</div>
            ) : (
              <div className="mockup-trending-list">
                {trending.map((track, i) => (
                  <TrendingRow key={track.id} track={track} index={i} />
                ))}
              </div>
            )}
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
