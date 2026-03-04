import { ListMusic, Trash2, Play, ChevronUp, ChevronDown } from "lucide-react";
import { usePlaylist } from "@/lib/playlistContext";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { TrackRow } from "@/components/track-row";
import { PageNav } from "@/components/page-nav";

export default function Playlist() {
  const { tracks, removeTrack, clearPlaylist, moveTrack } = usePlaylist();
  const { play } = useAudioPlayer();

  function playAll() {
    if (tracks.length === 0) return;
    const first = tracks[0];
    if (first.fileUrl) {
      play(first.id, first.fileUrl, { title: first.title, artist: first.artist, coverUrl: first.coverUrl });
    }
  }

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <PageNav />
      <div className="wrap" style={{ paddingTop: 24, maxWidth: 900, margin: "0 auto" }}>
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }} data-testid="text-playlist-header">
              <ListMusic size={20} /> My Playlist
              <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "rgba(234,240,255,.5)" }}>
                ({tracks.length} {tracks.length === 1 ? "song" : "songs"})
              </span>
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              {tracks.length > 0 && (
                <>
                  <button
                    onClick={playAll}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 8,
                      background: "linear-gradient(135deg, rgba(108,240,255,.15), rgba(160,107,255,.15))",
                      border: "1px solid rgba(108,240,255,.3)",
                      color: "#6cf0ff",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    data-testid="button-play-all"
                  >
                    <Play size={14} fill="currentColor" /> Play All
                  </button>
                  <button
                    onClick={() => { if (confirm("Clear your entire playlist?")) clearPlaylist(); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 8,
                      background: "rgba(255,79,216,.1)",
                      border: "1px solid rgba(255,79,216,.2)",
                      color: "#ff4fd8",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    data-testid="button-clear-playlist"
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                </>
              )}
            </div>
          </div>
          <div style={{ padding: "10px 10px 12px" }} data-testid="list-playlist-tracks">
            {tracks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(170,182,232,.6)" }} data-testid="empty-playlist">
                <ListMusic size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>Your playlist is empty</div>
                <div style={{ fontSize: "0.85rem" }}>
                  Tap the <span style={{ color: "#ff4fd8", fontWeight: 600 }}>+</span> button on any track to add it here
                </div>
              </div>
            ) : (
              tracks.map((track, index) => (
                <div key={track.id} style={{ display: "flex", alignItems: "stretch", gap: 0 }} data-testid={`playlist-item-${track.id}`}>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 4px", flexShrink: 0 }}>
                    <button
                      onClick={() => index > 0 && moveTrack(index, index - 1)}
                      disabled={index === 0}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: "transparent",
                        border: "none",
                        color: index === 0 ? "rgba(234,240,255,.15)" : "rgba(108,240,255,.6)",
                        cursor: index === 0 ? "default" : "pointer",
                        padding: 0,
                      }}
                      title="Move up"
                      data-testid={`button-move-up-${track.id}`}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <span style={{ textAlign: "center", fontSize: "0.7rem", color: "rgba(234,240,255,.4)", fontWeight: 700 }}>
                      {index + 1}
                    </span>
                    <button
                      onClick={() => index < tracks.length - 1 && moveTrack(index, index + 1)}
                      disabled={index === tracks.length - 1}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: "transparent",
                        border: "none",
                        color: index === tracks.length - 1 ? "rgba(234,240,255,.15)" : "rgba(108,240,255,.6)",
                        cursor: index === tracks.length - 1 ? "default" : "pointer",
                        padding: 0,
                      }}
                      title="Move down"
                      data-testid={`button-move-down-${track.id}`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <TrackRow track={track} hidePlaylistBtn />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "0 6px", flexShrink: 0 }}>
                    <button
                      onClick={() => removeTrack(track.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: "rgba(255,79,216,.1)",
                        border: "1px solid rgba(255,79,216,.2)",
                        color: "#ff4fd8",
                        cursor: "pointer",
                      }}
                      title="Remove from playlist"
                      data-testid={`button-remove-playlist-${track.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(170,182,232,.4)", fontSize: "0.8rem" }}>
          Songs play automatically in order when using "Play All"
        </div>
      </div>
    </div>
  );
}
