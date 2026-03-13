import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track, type Creator } from "@shared/schema";
import { Search, Music, User, X, Library, ListMusic, ShieldCheck, Heart, Play, ChevronRight } from "lucide-react";
import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";
import landingBg from "@assets/ChatGPT_Image_Mar_12,_2026,_08_51_51_PM_1773371441054.png";
import { useLocation } from "wouter";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { VideoModal } from "@/components/video-modal";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

type TrackWithLikes = Track & { likeCount?: number };

type HomeData = {
  top25: TrackWithLikes[];
  trending: TrackWithLikes[];
  newSongs: TrackWithLikes[];
  newCreators: Creator[];
};

function MiniTrackCard({ track, index }: { track: TrackWithLikes; index?: number }) {
  const { currentTrackId, isPlaying, play, toggle } = useAudioPlayer();
  const isCurrentlyPlaying = currentTrackId === track.id && isPlaying;
  const hasAudio = !!track.fileUrl;
  const isMedia = !!track.fileUrl;
  const [showVideoModal, setShowVideoModal] = useState(false);
  const wantModalRef = useRef(false);
  const { data: creatorData } = useQuery<{ creator: { avatarUrl: string | null } }>({
    queryKey: ["/api/creators", track.creatorId],
    enabled: !!track.creatorId,
  });

  useEffect(() => {
    if (wantModalRef.current && isPlaying && currentTrackId === track.id) {
      wantModalRef.current = false;
      setShowVideoModal(true);
    }
  }, [isPlaying, currentTrackId, track.id]);

  const handleClick = useCallback(() => {
    if (!hasAudio) return;
    if (isMedia) {
      wantModalRef.current = true;
      if (currentTrackId !== track.id || !isPlaying) {
        play(track.id, track.fileUrl!, { title: track.title, artist: track.artist, coverUrl: track.coverUrl });
      }
      setShowVideoModal(true);
    } else {
      toggle(track.id, track.fileUrl!, { title: track.title, artist: track.artist, coverUrl: track.coverUrl });
    }
  }, [hasAudio, isMedia, track, play, toggle, currentTrackId, isPlaying]);

  const thumbSrc = track.coverUrl || creatorData?.creator?.avatarUrl || null;

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 10px",
          borderRadius: 10,
          cursor: hasAudio ? "pointer" : "default",
          background: isCurrentlyPlaying ? "rgba(160,107,255,.12)" : "transparent",
          transition: "background .2s",
        }}
        className="home-track-row"
        data-testid={`home-track-${track.id}`}
      >
        {index !== undefined && (
          <span style={{
            fontSize: 18, fontWeight: 800, color: index < 3 ? "#ff4fd8" : "rgba(255,255,255,.5)",
            width: 24, textAlign: "center", flexShrink: 0,
          }} data-testid={`text-rank-${index + 1}`}>
            {index + 1}
          </span>
        )}
        <div style={{
          width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0,
          background: "rgba(160,107,255,.15)", position: "relative",
        }}>
          {thumbSrc ? (
            <img src={thumbSrc} alt={track.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Music size={20} style={{ color: "rgba(160,107,255,.5)" }} />
            </div>
          )}
          {isCurrentlyPlaying && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#ff4fd8", fontSize: 14 }}>{"\u275A\u275A"}</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }} data-testid={`text-title-${track.id}`}>
            {track.title}
            {track.explicit && (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 14, height: 14, borderRadius: 3, background: "rgba(255,79,216,.15)",
                border: "1px solid rgba(255,79,216,.3)", color: "#ff4fd8", fontSize: 8,
                fontWeight: 800, marginLeft: 5, verticalAlign: "middle",
              }}>E</span>
            )}
          </div>
          <div style={{
            fontSize: 11, color: "rgba(170,182,232,.6)", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {track.artist}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>
            {(track.plays || 0).toLocaleString()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#ff4fd8" }}>
            <Heart size={10} fill="#ff4fd8" />
            {(track.likeCount || 0).toLocaleString()}
          </span>
        </div>
      </div>
      {showVideoModal && isMedia && (
        <VideoModal track={track} onClose={() => { wantModalRef.current = false; setShowVideoModal(false); }} creatorAvatarUrl={creatorData?.creator?.avatarUrl} />
      )}
    </>
  );
}

function NewSongCard({ track }: { track: TrackWithLikes }) {
  const { currentTrackId, isPlaying, play, toggle } = useAudioPlayer();
  const isCurrentlyPlaying = currentTrackId === track.id && isPlaying;
  const hasAudio = !!track.fileUrl;
  const isMedia = !!track.fileUrl;
  const [showVideoModal, setShowVideoModal] = useState(false);
  const wantModalRef = useRef(false);
  const { data: creatorData } = useQuery<{ creator: { avatarUrl: string | null } }>({
    queryKey: ["/api/creators", track.creatorId],
    enabled: !!track.creatorId,
  });

  useEffect(() => {
    if (wantModalRef.current && isPlaying && currentTrackId === track.id) {
      wantModalRef.current = false;
      setShowVideoModal(true);
    }
  }, [isPlaying, currentTrackId, track.id]);

  const handleClick = useCallback(() => {
    if (!hasAudio) return;
    if (isMedia) {
      wantModalRef.current = true;
      if (currentTrackId !== track.id || !isPlaying) {
        play(track.id, track.fileUrl!, { title: track.title, artist: track.artist, coverUrl: track.coverUrl });
      }
      setShowVideoModal(true);
    } else {
      toggle(track.id, track.fileUrl!, { title: track.title, artist: track.artist, coverUrl: track.coverUrl });
    }
  }, [hasAudio, isMedia, track, play, toggle, currentTrackId, isPlaying]);

  const thumbSrc = track.coverUrl || creatorData?.creator?.avatarUrl || null;

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          cursor: hasAudio ? "pointer" : "default",
          borderRadius: 14,
          overflow: "hidden",
          background: "rgba(15,20,40,.7)",
          border: "1px solid rgba(160,107,255,.15)",
          transition: "transform .2s, border-color .2s",
          minWidth: 150,
          flex: "0 0 auto",
        }}
        className="new-song-card"
        data-testid={`new-song-card-${track.id}`}
      >
        <div style={{
          width: "100%", aspectRatio: "1", position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, rgba(160,107,255,.2), rgba(255,79,216,.1))",
        }}>
          {thumbSrc ? (
            <img src={thumbSrc} alt={track.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Music size={40} style={{ color: "rgba(160,107,255,.4)" }} />
            </div>
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 50%)",
          }} />
          <div style={{
            position: "absolute", bottom: 8, left: 8, right: 8,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: isCurrentlyPlaying ? "rgba(255,79,216,.9)" : "rgba(160,107,255,.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,.4)",
            }}>
              {isCurrentlyPlaying ? (
                <span style={{ color: "#fff", fontSize: 12 }}>{"\u275A\u275A"}</span>
              ) : (
                <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
              )}
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#ff4fd8", fontWeight: 700 }}>
              <Heart size={10} fill="#ff4fd8" /> {(track.likeCount || 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div style={{ padding: "10px 10px 12px" }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {track.title}
          </div>
          <div style={{ fontSize: 11, color: "rgba(170,182,232,.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {track.artist}
          </div>
          <div style={{ fontSize: 11, color: "rgba(170,182,232,.4)", marginTop: 2 }}>
            {(track.plays || 0).toLocaleString()} plays
          </div>
        </div>
      </div>
      {showVideoModal && isMedia && (
        <VideoModal track={track} onClose={() => { wantModalRef.current = false; setShowVideoModal(false); }} creatorAvatarUrl={creatorData?.creator?.avatarUrl} />
      )}
    </>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cleanMode, setCleanMode] = useState(() => {
    try { return localStorage.getItem("hwm_clean_mode") === "true"; } catch { return false; }
  });
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

  const { data: homeData, isLoading } = useQuery<HomeData>({
    queryKey: ["/api/home-data"],
  });

  const { data: allTracks = [] } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "all"],
  });

  const { data: creators = [] } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  function cleanFilter(tracks: TrackWithLikes[]) {
    if (!cleanMode) return tracks;
    return tracks.filter((t) => !t.explicit);
  }

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

  const top25 = cleanFilter(homeData?.top25 || []);
  const trending = cleanFilter(homeData?.trending || []);
  const newSongs = cleanFilter(homeData?.newSongs || []);
  const newCreators = homeData?.newCreators || [];

  return (
    <div className="hwm-app" style={{ backgroundImage: `url(${landingBg})`, backgroundSize: "cover", backgroundPosition: "top center", backgroundAttachment: "fixed", backgroundRepeat: "no-repeat" }}>
      <div className="bg-lines" style={{ background: "rgba(7,10,20,.55)" }} />

      <header className="site-topbar" data-testid="header-main">
        <div className="topbar-left" style={{ display: "flex" }}>
          <a href="/" data-testid="link-logo" style={{ textDecoration: "none" }}>
            <img src={siteLogo} alt="Hit Wave Media" className="site-logo-banner" data-testid="img-logo" />
          </a>
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
        <button
          onClick={() => {
            const next = !cleanMode;
            setCleanMode(next);
            localStorage.setItem("hwm_clean_mode", String(next));
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px",
            borderRadius: 16,
            border: cleanMode ? "1px solid rgba(108,240,255,.5)" : "1px solid rgba(255,255,255,.2)",
            background: cleanMode ? "rgba(108,240,255,.12)" : "transparent",
            color: cleanMode ? "#6cf0ff" : "rgba(255,255,255,.5)",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all .2s",
          }}
          title={cleanMode ? "Clean Mode is ON — explicit songs hidden" : "Turn on Clean Mode to hide explicit songs"}
          data-testid="button-clean-mode"
        >
          <ShieldCheck size={13} />
          Clean
        </button>
        <div className="topbar-actions">
          {user ? (
            <>
              {user.creatorId && (
                <a href={`/creator/${user.creatorId}`} className="topbar-library" data-testid="link-my-library">
                  <Library style={{ width: 14, height: 14 }} />
                  My Library
                </a>
              )}
              {user.id === 2 && (
                <a href="/admin" className="topbar-login" style={{ borderColor: "rgba(255,215,0,.4)", color: "#ffd700" }} data-testid="link-admin">Admin</a>
              )}
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
              <span className="topbar-listen-msg" style={{ padding: "6px 10px", borderRadius: 16, border: "1px solid rgba(108,240,255,.3)", fontSize: 11, color: "#6cf0ff", fontWeight: 600, whiteSpace: "nowrap" }} data-testid="text-no-signup">Listen instantly. No signup required.</span>
              <a href="/sign-in" className="topbar-login" data-testid="link-creators-login">Creators Login</a>
              <a href="/sign-up" className="topbar-signup" data-testid="button-sign-up">Creator Sign Up</a>
            </>
          )}
        </div>
      </header>

      <section className="hero" data-testid="section-hero">
        <div style={{ position: "relative", zIndex: 3, color: "#ffffff", fontSize: 18, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", textAlign: "center", textShadow: "0 0 10px rgba(255,255,255,.6), 0 0 30px rgba(108,240,255,.5), 0 0 60px rgba(160,107,255,.3)" }} data-testid="text-tagline">AI-Only Music Platform</div>
      </section>

      <div style={{ display: "flex", justifyContent: "center", padding: "10px 22px 0" }}>
        <a href="/studios" className="studios-btn" data-testid="link-studios" onClick={() => {
          try {
            const vid = localStorage.getItem("hwm_vid") || "anon";
            const data = JSON.stringify({ visitorId: vid });
            if (navigator.sendBeacon) {
              navigator.sendBeacon("/api/studio-click", new Blob([data], { type: "application/json" }));
            } else {
              fetch("/api/studio-click", { method: "POST", headers: { "x-visitor-id": vid }, keepalive: true }).catch(() => {});
            }
          } catch {}
        }}>
          Hitwave Studios for Music Creators
        </a>
      </div>

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
        <a href="/playlist" className="quick-nav-tab" data-testid="link-quick-playlist">
          <ListMusic style={{ width: 14, height: 14 }} />
          My Playlist
        </a>
        {user && user.creatorId && (
          <a href={`/creator/${user.creatorId}`} className="quick-nav-tab quick-nav-mobile-library" data-testid="link-mobile-my-library">
            <Library style={{ width: 14, height: 14 }} />
            My Library
          </a>
        )}
      </nav>

      <div className="home-sections" data-testid="section-content">
        <section className="home-panel" data-testid="section-top25">
          <div className="home-section-header">
            <a href="/top-25" className="home-section-title" data-testid="link-top25-header">
              Top 25 Trending Songs
            </a>
            <a href="/top-25" className="home-see-all" data-testid="link-top25-see-all">
              See All <ChevronRight size={14} />
            </a>
          </div>
          {isLoading ? (
            <div style={{ padding: 20, textAlign: "center", color: "rgba(170,182,232,.4)" }}>Loading...</div>
          ) : (
            <div className="home-top25-grid">
              {top25.map((track, i) => (
                <MiniTrackCard key={track.id} track={track} index={i} />
              ))}
            </div>
          )}
        </section>

        <div className="home-two-col">
          <section className="home-panel" data-testid="section-new-songs">
            <div className="home-section-header">
              <a href="/new-songs" className="home-section-title" data-testid="link-new-songs-header">
                New Songs
              </a>
              <a href="/new-songs" className="home-see-all" data-testid="link-new-songs-see-all">
                See All <ChevronRight size={14} />
              </a>
            </div>
            {isLoading ? (
              <div style={{ padding: 20, textAlign: "center", color: "rgba(170,182,232,.4)" }}>Loading...</div>
            ) : (
              <div className="home-new-songs-scroll">
                {newSongs.map((track) => (
                  <NewSongCard key={track.id} track={track} />
                ))}
              </div>
            )}
          </section>

          <section className="home-panel" data-testid="section-new-creators">
            <div className="home-section-header">
              <a href="/new-creators" className="home-section-title" data-testid="link-new-creators-header">
                New Creators
              </a>
              <a href="/new-creators" className="home-see-all" data-testid="link-new-creators-see-all">
                See All <ChevronRight size={14} />
              </a>
            </div>
            {isLoading ? (
              <div style={{ padding: 20, textAlign: "center", color: "rgba(170,182,232,.4)" }}>Loading...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "4px 6px 10px" }}>
                {newCreators.map((creator) => (
                  <a
                    key={creator.id}
                    href={`/creator/${creator.id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 10px",
                      borderRadius: 10, textDecoration: "none", transition: "background .2s",
                    }}
                    className="home-track-row"
                    data-testid={`home-creator-${creator.id}`}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", overflow: "hidden",
                      background: `linear-gradient(135deg, rgba(160,107,255,.3), rgba(255,79,216,.2))`,
                      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {creator.avatarUrl ? (
                        <img src={creator.avatarUrl} alt={creator.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <User size={20} style={{ color: "rgba(160,107,255,.6)" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 700, color: "#fff",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {creator.name}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(170,182,232,.5)" }}>
                        {creator.trackCount} track{creator.trackCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: "rgba(170,182,232,.3)", flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="home-panel" data-testid="section-trending">
          <div className="home-section-header">
            <a href="/trending" className="home-section-title" data-testid="link-trending-header">
              Trending Songs
            </a>
            <a href="/trending" className="home-see-all" data-testid="link-trending-see-all">
              See All <ChevronRight size={14} />
            </a>
          </div>
          {isLoading ? (
            <div style={{ padding: 20, textAlign: "center", color: "rgba(170,182,232,.4)" }}>Loading...</div>
          ) : (
            <div className="home-top25-grid">
              {trending.map((track, i) => (
                <MiniTrackCard key={track.id} track={track} index={i} />
              ))}
            </div>
          )}
        </section>

        <div style={{
          textAlign: "center", padding: "40px 20px",
          background: "rgba(15,20,40,.5)", borderRadius: 20,
          border: "1px solid rgba(160,107,255,.12)",
        }}>
          <h2 style={{
            fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 8,
            textShadow: "0 0 20px rgba(160,107,255,.3)",
          }}>
            Upload Your AI Music
          </h2>
          <p style={{ fontSize: 14, color: "rgba(170,182,232,.6)", marginBottom: 20 }}>
            Share your AI-generated tracks and grow your audience.
          </p>
          <a
            href={user ? "/upload" : "/sign-up"}
            style={{
              display: "inline-flex", alignItems: "center", padding: "14px 40px",
              fontSize: 16, fontWeight: 800, color: "#fff", textDecoration: "none",
              borderRadius: 999,
              background: "linear-gradient(135deg, #ff4fd8, #a06bff)",
              boxShadow: "0 4px 20px rgba(255,79,216,.3)",
              transition: "transform .2s, box-shadow .2s",
            }}
            className="upload-cta-btn"
            data-testid="link-upload-cta"
          >
            Upload Now
          </a>
        </div>
      </div>

      <footer style={{ textAlign: "center", padding: "32px 16px 24px", borderTop: "1px solid rgba(108,240,255,.06)" }}>
        <div style={{ fontSize: 12, color: "rgba(170,182,232,.35)" }}>
          <a href="/terms" style={{ color: "rgba(170,182,232,.5)", textDecoration: "none" }} data-testid="link-footer-terms">Terms of Service</a>
          <span style={{ margin: "0 10px" }}>·</span>
          <span>&copy; {new Date().getFullYear()} Hit Wave Media</span>
        </div>
      </footer>
    </div>
  );
}
