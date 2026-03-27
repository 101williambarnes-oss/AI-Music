import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Track, type Creator, type Album } from "@shared/schema";
import { Disc3, Play, Pause, Music, User, Calendar } from "lucide-react";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { useCallback, useState } from "react";

type AlbumData = {
  album: Album;
  creator: Creator | null;
  tracks: Track[];
};

function AlbumTrackTab({ track, index, isActive, isThisPlaying, onSelect }: {
  track: Track; index: number; isActive: boolean; isThisPlaying: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "12px 16px",
        borderTop: index > 0 ? "1px solid rgba(108,240,255,.06)" : undefined,
        background: isActive ? "rgba(160,107,255,.12)" : "transparent",
        border: "none",
        borderLeft: isActive ? "3px solid #a06bff" : "3px solid transparent",
        cursor: track.fileUrl ? "pointer" : "default",
        transition: "all .2s",
        textAlign: "left",
        color: "inherit",
      }}
      data-testid={`album-track-${track.id}`}
    >
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isActive ? "rgba(160,107,255,.2)" : "rgba(255,255,255,.04)",
        fontSize: 13, fontWeight: 700,
        color: isThisPlaying ? "#a06bff" : isActive ? "#6cf0ff" : "rgba(170,182,232,.5)",
        flexShrink: 0,
      }}>
        {isThisPlaying ? <Pause size={14} /> : index + 1}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: isActive ? "#a06bff" : "#eaf0ff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {track.title}
        </div>
      </div>
      {isThisPlaying && (
        <div style={{ fontSize: 10, color: "#a06bff", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
          Playing
        </div>
      )}
    </button>
  );
}

export default function AlbumPage() {
  const [, params] = useRoute("/album/:id");
  const albumId = params?.id;
  const { currentTrackId, isPlaying, play, toggle } = useAudioPlayer();

  const { data, isLoading } = useQuery<AlbumData>({
    queryKey: ["/api/albums", albumId],
    enabled: !!albumId,
  });

  const playTrack = useCallback((track: Track) => {
    if (!track.fileUrl) return;
    const isActive = currentTrackId === track.id;
    if (isActive) {
      toggle();
    } else {
      play(track.id, track.fileUrl, { title: track.title, artist: track.artist, coverUrl: track.coverUrl });
    }
  }, [currentTrackId, play, toggle]);

  const handlePlayAll = useCallback(() => {
    if (data?.tracks && data.tracks.length > 0) {
      const first = data.tracks[0];
      if (first.fileUrl) {
        play(first.id, first.fileUrl, { title: first.title, artist: first.artist, coverUrl: first.coverUrl });
      }
    }
  }, [data, play]);

  if (isLoading) {
    return (
      <div className="hwm-app mockup-bg">
        <div className="wrap" style={{ paddingTop: 60, textAlign: "center" }}>
          <div style={{ color: "rgba(170,182,232,.5)" }}>Loading album...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="hwm-app mockup-bg">
        <div className="wrap" style={{ paddingTop: 60, textAlign: "center" }}>
          <div style={{ color: "#ff4fd8", fontSize: 20, fontWeight: 700 }}>Album not found</div>
          <a href="/albums" style={{ color: "#6cf0ff", marginTop: 16, display: "inline-block" }}>Browse Albums</a>
        </div>
      </div>
    );
  }

  const { album, creator, tracks } = data;
  const createdDate = album.createdAt ? new Date(album.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="hwm-app mockup-bg">
      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 100, maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 24, marginBottom: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 200, height: 200, borderRadius: 12, overflow: "hidden", background: "rgba(160,107,255,.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(108,240,255,.12)" }}>
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} data-testid="img-album-cover" />
            ) : (
              <Disc3 size={80} style={{ color: "rgba(160,107,255,.3)" }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a06bff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Album</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#eaf0ff", marginBottom: 8 }} data-testid="text-album-title">{album.title}</h1>
            {album.description && (
              <p style={{ fontSize: 13, color: "rgba(170,182,232,.5)", marginBottom: 10 }}>{album.description}</p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {creator && (
                <a href={`/creator/${creator.id}`} style={{ fontSize: 14, color: "#6cf0ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }} data-testid="link-album-creator">
                  <User size={14} /> {creator.name}
                </a>
              )}
              <span style={{ fontSize: 12, color: "rgba(170,182,232,.4)", display: "flex", alignItems: "center", gap: 4 }}>
                <Music size={12} /> {tracks.length} track{tracks.length !== 1 ? "s" : ""}
              </span>
              {createdDate && (
                <span style={{ fontSize: 12, color: "rgba(170,182,232,.4)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={12} /> {createdDate}
                </span>
              )}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button
                onClick={handlePlayAll}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 24px", background: "linear-gradient(135deg, #a06bff 0%, #ff4fd8 100%)",
                  border: "none", borderRadius: 24, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
                data-testid="button-play-album"
              >
                <Play size={16} /> Play Album
              </button>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(108,240,255,.1)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: "rgba(108,240,255,.05)", fontSize: 11, fontWeight: 700, color: "rgba(170,182,232,.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Songs
          </div>
          {tracks.map((track, i) => (
            <AlbumTrackTab
              key={track.id}
              track={track}
              index={i}
              isActive={currentTrackId === track.id}
              isThisPlaying={currentTrackId === track.id && isPlaying}
              onSelect={() => playTrack(track)}
            />
          ))}
          {tracks.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: "rgba(170,182,232,.4)", fontSize: 14 }}>No tracks in this album yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
