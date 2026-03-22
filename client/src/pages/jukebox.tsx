import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { Play, Pause } from "lucide-react";
import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";

type Track = {
  id: number;
  title: string;
  artist: string;
  genre: string;
  plays: number;
  fileUrl: string | null;
  coverUrl: string | null;
  creatorId: number;
};

export default function Jukebox() {
  const { data: tracks, isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "all"],
  });

  const { currentTrackId, isPlaying, toggle } = useAudioPlayer();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #050510 0%, #0a0e22 30%, #0d1030 60%, #050510 100%)",
        color: "#eaf0ff",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
      data-testid="page-jukebox"
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: "100%",
          background: "linear-gradient(180deg, #ff4fd8, #a06bff, #6cf0ff, #a06bff, #ff4fd8)",
          boxShadow: "0 0 20px rgba(255,79,216,.4), 0 0 40px rgba(160,107,255,.2)",
          zIndex: 10,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 6,
          height: "100%",
          background: "linear-gradient(180deg, #6cf0ff, #a06bff, #ff4fd8, #a06bff, #6cf0ff)",
          boxShadow: "0 0 20px rgba(108,240,255,.4), 0 0 40px rgba(160,107,255,.2)",
          zIndex: 10,
        }}
      />

      <header
        style={{
          textAlign: "center",
          padding: "28px 20px 20px",
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "linear-gradient(180deg, rgba(5,5,16,.98) 0%, rgba(5,5,16,.9) 80%, transparent 100%)",
          backdropFilter: "blur(12px)",
        }}
      >
        <img
          src={siteLogo}
          alt="Hit Wave Media"
          style={{ height: 40, width: "auto", margin: "0 auto 12px", display: "block" }}
        />
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900,
            letterSpacing: 3,
            textTransform: "uppercase",
            background: "linear-gradient(90deg, #ff4fd8, #a06bff, #6cf0ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
            textShadow: "none",
          }}
          data-testid="text-jukebox-title"
        >
          Now Playing
        </h1>
      </header>

      <main style={{ padding: "8px 20px 40px", maxWidth: 900, margin: "0 auto" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(170,182,232,.5)" }}>
            Loading tracks...
          </div>
        ) : !tracks || tracks.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(170,182,232,.5)" }}>
            No tracks available
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            {tracks.map((track) => {
              const isActive = currentTrackId === track.id;
              const isThisPlaying = isActive && isPlaying;

              return (
                <button
                  key={track.id}
                  onClick={() => {
                    if (track.fileUrl) {
                      toggle(track.id, track.fileUrl, {
                        title: track.title,
                        artist: track.artist,
                        coverUrl: track.coverUrl,
                      });
                    }
                  }}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, rgba(160,107,255,.2), rgba(255,79,216,.15))"
                      : "rgba(15,18,40,.7)",
                    border: isActive
                      ? "2px solid rgba(160,107,255,.6)"
                      : "1px solid rgba(108,240,255,.1)",
                    borderRadius: 14,
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "transform .15s, border-color .2s, box-shadow .2s",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: isActive
                      ? "0 0 24px rgba(160,107,255,.3), 0 0 48px rgba(255,79,216,.1)"
                      : "0 2px 12px rgba(0,0,0,.3)",
                  }}
                  data-testid={`jukebox-track-${track.id}`}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      position: "relative",
                      overflow: "hidden",
                      background: track.coverUrl
                        ? "none"
                        : `linear-gradient(135deg, hsl(${(track.id * 47) % 360}, 60%, 25%), hsl(${(track.id * 47 + 60) % 360}, 50%, 20%))`,
                    }}
                  >
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 40,
                          color: "rgba(255,255,255,.15)",
                        }}
                      >
                        ♪
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: isThisPlaying
                          ? "rgba(0,0,0,.35)"
                          : "rgba(0,0,0,.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background .2s",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: isThisPlaying
                            ? "linear-gradient(135deg, #ff4fd8, #a06bff)"
                            : "rgba(108,240,255,.85)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: isThisPlaying
                            ? "0 0 20px rgba(255,79,216,.5)"
                            : "0 0 16px rgba(108,240,255,.4)",
                          transition: "background .2s, box-shadow .2s",
                        }}
                      >
                        {isThisPlaying ? (
                          <Pause size={22} color="#fff" fill="#fff" />
                        ) : (
                          <Play size={22} color="#050510" fill="#050510" style={{ marginLeft: 2 }} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "10px 8px 12px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isActive ? "#6cf0ff" : "#eaf0ff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.3,
                      }}
                    >
                      {track.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: isActive ? "rgba(160,107,255,.9)" : "rgba(170,182,232,.5)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginTop: 2,
                      }}
                    >
                      {track.artist}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "16px",
          color: "rgba(170,182,232,.25)",
          fontSize: 11,
        }}
      >
        &copy; {new Date().getFullYear()} Hit Wave Media
      </footer>
    </div>
  );
}
