import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { type Track, type Creator, type Album } from "@shared/schema";
import { Disc3, Play, Pause, Music, User, Calendar, ChevronRight } from "lucide-react";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { useCallback, useState, useEffect, useRef } from "react";

type AlbumData = {
  album: Album;
  creator: Creator | null;
  tracks: Track[];
};

type AlbumWithCreator = Album & { creator: Creator | null; trackCount: number };

function AlbumTrackRow({ track, index, isActive, isThisPlaying, onSelect, albumCover }: {
  track: Track; index: number; isActive: boolean; isThisPlaying: boolean; onSelect: () => void; albumCover: string | null;
}) {
  const coverSrc = track.coverUrl || albumCover;
  return (
    <button
      onClick={onSelect}
      className="album-track-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        padding: "14px 20px",
        background: isActive ? "rgba(160,107,255,.1)" : "transparent",
        border: "none",
        cursor: track.fileUrl ? "pointer" : "default",
        transition: "all .2s",
        textAlign: "left",
        color: "inherit",
        borderRadius: 8,
      }}
      data-testid={`album-track-${track.id}`}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700,
        color: isThisPlaying ? "#a06bff" : isActive ? "#6cf0ff" : "rgba(170,182,232,.45)",
        flexShrink: 0,
        minWidth: 32,
      }}>
        {isThisPlaying ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 18 }}>
            <div style={{ width: 3, background: "#a06bff", borderRadius: 2, animation: "eqbar1 .5s ease infinite" }} />
            <div style={{ width: 3, background: "#a06bff", borderRadius: 2, animation: "eqbar2 .5s ease .1s infinite" }} />
            <div style={{ width: 3, background: "#a06bff", borderRadius: 2, animation: "eqbar3 .5s ease .2s infinite" }} />
          </div>
        ) : (
          index + 1
        )}
      </div>

      <div style={{
        width: 44, height: 44, borderRadius: 6, overflow: "hidden", flexShrink: 0,
        background: "rgba(160,107,255,.08)",
      }}>
        {coverSrc ? (
          <img src={coverSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Music size={18} style={{ color: "rgba(160,107,255,.3)" }} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{
          fontSize: 15, fontWeight: 600,
          color: isActive ? "#c9a0ff" : "#eaf0ff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {track.title}
        </div>
        {track.artist && (
          <div style={{ fontSize: 12, color: "rgba(170,182,232,.4)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {track.artist}
          </div>
        )}
      </div>

      {isThisPlaying ? (
        <div style={{ fontSize: 10, color: "#a06bff", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, flexShrink: 0 }}>
          Now Playing
        </div>
      ) : isActive ? (
        <Pause size={16} style={{ color: "#a06bff", flexShrink: 0 }} />
      ) : (
        <Play size={16} style={{ color: "rgba(170,182,232,.2)", flexShrink: 0 }} className="track-play-icon" />
      )}
    </button>
  );
}

export default function AlbumPage() {
  const [, params] = useRoute("/album/:id");
  const [, navigate] = useLocation();
  const albumId = params?.id;
  const { currentTrackId, isPlaying, play, toggle, setOnEnded } = useAudioPlayer();
  const [djPlaying, setDjPlaying] = useState(false);
  const [djLoading, setDjLoading] = useState(false);
  const [djPlayed, setDjPlayed] = useState(false);
  const djAudioRef = useRef<HTMLAudioElement | null>(null);
  const albumTracksRef = useRef<Track[]>([]);

  const { data, isLoading } = useQuery<AlbumData>({
    queryKey: ["/api/albums", albumId],
    enabled: !!albumId,
  });

  const { data: allAlbums = [] } = useQuery<AlbumWithCreator[]>({
    queryKey: ["/api/albums"],
  });

  const moreAlbums = allAlbums.filter(a => String(a.id) !== albumId);

  useEffect(() => {
    if (data?.tracks) {
      albumTracksRef.current = data.tracks;
    }
  }, [data?.tracks]);

  useEffect(() => {
    const handleEnded = (endedTrackId: number) => {
      const tracks = albumTracksRef.current;
      const currentIndex = tracks.findIndex(t => t.id === endedTrackId);
      if (currentIndex === -1) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex < tracks.length) {
        const nextTrack = tracks[nextIndex];
        if (nextTrack.fileUrl) {
          play(nextTrack.id, nextTrack.fileUrl, {
            title: nextTrack.title,
            artist: nextTrack.artist,
            coverUrl: nextTrack.coverUrl,
          }, { skipIntro: true });
        }
      }
    };

    setOnEnded(handleEnded);
    return () => setOnEnded(null);
  }, [play, setOnEnded]);

  useEffect(() => {
    return () => {
      if (djAudioRef.current) {
        djAudioRef.current.pause();
        djAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setDjPlayed(false);
    setDjPlaying(false);
    setDjLoading(false);
    if (djAudioRef.current) {
      djAudioRef.current.pause();
      djAudioRef.current = null;
    }
  }, [albumId]);

  const playDjIntroThenAlbum = useCallback(async () => {
    if (!data?.tracks || data.tracks.length === 0) return;
    if (!data.album) return;

    const firstTrack = data.tracks[0];
    if (!firstTrack.fileUrl) return;

    if (djPlayed) {
      play(firstTrack.id, firstTrack.fileUrl, { title: firstTrack.title, artist: firstTrack.artist, coverUrl: firstTrack.coverUrl });
      return;
    }

    setDjLoading(true);

    try {
      const res = await fetch(`/api/albums/${data.album.id}/dj-intro`, { method: "POST" });
      if (res.ok) {
        const { djIntroUrl } = await res.json();
        if (djIntroUrl) {
          const audio = new Audio(djIntroUrl);
          djAudioRef.current = audio;
          setDjPlaying(true);

          audio.onended = () => {
            setDjPlaying(false);
            setDjPlayed(true);
            djAudioRef.current = null;
            play(firstTrack.id, firstTrack.fileUrl!, { title: firstTrack.title, artist: firstTrack.artist, coverUrl: firstTrack.coverUrl });
          };

          audio.onerror = () => {
            setDjPlaying(false);
            setDjPlayed(true);
            djAudioRef.current = null;
            play(firstTrack.id, firstTrack.fileUrl!, { title: firstTrack.title, artist: firstTrack.artist, coverUrl: firstTrack.coverUrl });
          };

          await audio.play().catch(() => {
            setDjPlaying(false);
            setDjPlayed(true);
            djAudioRef.current = null;
            play(firstTrack.id, firstTrack.fileUrl!, { title: firstTrack.title, artist: firstTrack.artist, coverUrl: firstTrack.coverUrl });
          });

          setDjLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("DJ intro fetch failed:", err);
    }

    setDjLoading(false);
    setDjPlayed(true);
    play(firstTrack.id, firstTrack.fileUrl, { title: firstTrack.title, artist: firstTrack.artist, coverUrl: firstTrack.coverUrl });
  }, [data, djPlayed, play]);

  const playTrack = useCallback((track: Track) => {
    if (!track.fileUrl) return;

    if (djAudioRef.current) {
      djAudioRef.current.pause();
      djAudioRef.current = null;
      setDjPlaying(false);
    }

    const isActive = currentTrackId === track.id;
    if (isActive) {
      toggle();
    } else {
      play(track.id, track.fileUrl, { title: track.title, artist: track.artist, coverUrl: track.coverUrl });
    }
  }, [currentTrackId, play, toggle]);

  if (isLoading) {
    return (
      <div className="hwm-app mockup-bg">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <Disc3 size={48} style={{ color: "rgba(160,107,255,.3)", animation: "spin 2s linear infinite" }} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="hwm-app mockup-bg">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
          <Disc3 size={64} style={{ color: "rgba(170,182,232,.15)" }} />
          <div style={{ color: "#ff4fd8", fontSize: 22, fontWeight: 700 }}>Album not found</div>
          <a href="/albums" style={{ color: "#6cf0ff", fontSize: 14 }} data-testid="link-browse-albums">Browse Albums</a>
        </div>
      </div>
    );
  }

  const { album, creator, tracks } = data;
  const createdDate = album.createdAt ? new Date(album.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="hwm-app mockup-bg">
      <div style={{
        position: "relative",
        width: "100%",
        minHeight: 420,
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
      }}>
        {album.coverUrl && (
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${album.coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(40px) brightness(.4)",
            transform: "scale(1.2)",
          }} />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(7,10,20,.3) 0%, rgba(7,10,20,.95) 100%)",
        }} />

        <div style={{
          position: "relative", width: "100%", maxWidth: 900, margin: "0 auto",
          padding: "60px 24px 40px", display: "flex", gap: 32, alignItems: "flex-end", flexWrap: "wrap",
        }}>
          <div style={{
            width: 260, height: 260, borderRadius: 12, overflow: "hidden", flexShrink: 0,
            boxShadow: "0 16px 60px rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.08)",
          }}>
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} data-testid="img-album-cover" />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(160,107,255,.15), rgba(255,79,216,.1))" }}>
                <Disc3 size={100} style={{ color: "rgba(160,107,255,.25)" }} />
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 220, paddingBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a06bff", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Album</div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 10, lineHeight: 1.1 }} data-testid="text-album-title">{album.title}</h1>
            {album.description && (
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", marginBottom: 14, maxWidth: 500, lineHeight: 1.5 }}>{album.description}</p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
              {creator && (
                <a href={`/creator/${creator.id}`} style={{ fontSize: 14, color: "#6cf0ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }} data-testid="link-album-creator">
                  <User size={14} /> {creator.name}
                </a>
              )}
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", gap: 4 }}>
                <Music size={13} /> {tracks.length} track{tracks.length !== 1 ? "s" : ""}
              </span>
              {createdDate && (
                <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={13} /> {createdDate}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={playDjIntroThenAlbum}
                disabled={djLoading || tracks.length === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "14px 32px", background: "linear-gradient(135deg, #a06bff 0%, #ff4fd8 100%)",
                  border: "none", borderRadius: 28, color: "#fff", fontWeight: 700, fontSize: 15,
                  cursor: djLoading ? "wait" : "pointer",
                  opacity: djLoading ? 0.7 : 1,
                  boxShadow: "0 4px 24px rgba(160,107,255,.3)",
                  transition: "all .2s",
                }}
                data-testid="button-play-album"
              >
                <Play size={18} fill="#fff" /> {djLoading ? "Loading DJ..." : "Play Album"}
              </button>
              {djPlaying && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#c9a0ff", fontWeight: 600 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a06bff", animation: "pulse 1s infinite" }} />
                  DJ William Allen introducing...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 40px" }}>
        <div style={{
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(108,240,255,.08)",
          borderRadius: 14,
          overflow: "hidden",
          marginTop: -8,
        }}>
          {tracks.map((track, i) => (
            <AlbumTrackRow
              key={track.id}
              track={track}
              index={i}
              isActive={currentTrackId === track.id}
              isThisPlaying={currentTrackId === track.id && isPlaying}
              onSelect={() => playTrack(track)}
              albumCover={album.coverUrl}
            />
          ))}
          {tracks.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(170,182,232,.4)", fontSize: 15 }}>No tracks in this album yet</div>
          )}
        </div>
      </div>

      {moreAlbums.length > 0 && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 120px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#eaf0ff" }}>More Albums</h2>
            <a href="/albums" style={{ fontSize: 13, color: "#6cf0ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }} data-testid="link-see-all-albums">
              See All <ChevronRight size={14} />
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 }}>
            {moreAlbums.slice(0, 6).map((a) => (
              <div
                key={a.id}
                onClick={() => { navigate(`/album/${a.id}`); window.scrollTo(0, 0); }}
                className="album-card-hover"
                style={{
                  background: "rgba(10,8,30,.7)",
                  border: "1px solid rgba(108,240,255,.08)",
                  borderRadius: 12,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all .3s ease",
                }}
                data-testid={`more-album-${a.id}`}
              >
                <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", background: "rgba(160,107,255,.06)" }}>
                  {a.coverUrl ? (
                    <img src={a.coverUrl} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .3s" }} className="album-cover-img" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Disc3 size={50} style={{ color: "rgba(160,107,255,.2)" }} />
                    </div>
                  )}
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(170,182,232,.45)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <User size={11} /> {a.creator?.name || "Unknown"} · {a.trackCount} tracks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes eqbar1 {
          0%, 100% { height: 6px; }
          50% { height: 16px; }
        }
        @keyframes eqbar2 {
          0%, 100% { height: 14px; }
          50% { height: 6px; }
        }
        @keyframes eqbar3 {
          0%, 100% { height: 10px; }
          50% { height: 18px; }
        }
        .album-track-row:hover {
          background: rgba(160,107,255,.06) !important;
        }
        .album-track-row:hover .track-play-icon {
          color: rgba(170,182,232,.5) !important;
        }
        .album-card-hover:hover {
          border-color: rgba(160,107,255,.3) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(160,107,255,.12);
        }
        .album-card-hover:hover .album-cover-img {
          transform: scale(1.05);
        }
        @media (max-width: 600px) {
          .album-hero-layout {
            flex-direction: column !important;
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
}
