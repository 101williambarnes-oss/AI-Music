import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { Play, Pause } from "lucide-react";
import { useState } from "react";
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

function JukeboxTile({ track, isActive, isThisPlaying, onToggle }: {
  track: Track;
  isActive: boolean;
  isThisPlaying: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showOverlay = hovered || isActive;

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(160,107,255,.15), rgba(255,79,216,.1))"
          : "rgba(10,14,32,.8)",
        border: isActive
          ? "2px solid rgba(160,107,255,.5)"
          : "1px solid rgba(108,240,255,.08)",
        borderRadius: 10,
        padding: 0,
        cursor: "pointer",
        textAlign: "center",
        transition: "transform .15s, border-color .2s, box-shadow .2s",
        overflow: "hidden",
        position: "relative",
        boxShadow: isActive
          ? "0 0 20px rgba(160,107,255,.25), 0 0 40px rgba(255,79,216,.08)"
          : "0 2px 10px rgba(0,0,0,.3)",
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
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              color: "rgba(255,255,255,.12)",
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
              : showOverlay ? "rgba(0,0,0,.25)" : "rgba(0,0,0,0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background .2s, opacity .2s",
            opacity: showOverlay ? 1 : 0,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: isThisPlaying
                ? "linear-gradient(135deg, #ff4fd8, #a06bff)"
                : "rgba(108,240,255,.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isThisPlaying
                ? "0 0 18px rgba(255,79,216,.5)"
                : "0 0 14px rgba(108,240,255,.4)",
              transition: "background .2s, box-shadow .2s, transform .15s",
              transform: showOverlay ? "scale(1)" : "scale(0.7)",
            }}
          >
            {isThisPlaying ? (
              <Pause size={20} color="#fff" fill="#fff" />
            ) : (
              <Play size={20} color="#050510" fill="#050510" style={{ marginLeft: 2 }} />
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 6px 10px" }}>
        <div
          style={{
            fontSize: 12,
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
            fontSize: 10,
            color: isActive ? "rgba(160,107,255,.9)" : "rgba(170,182,232,.45)",
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
}

export default function Jukebox() {
  const { data: rawTracks, isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "jukebox"],
    queryFn: async () => {
      const res = await fetch("/api/tracks/all");
      if (!res.ok) throw new Error("Failed to load");
      const data: Track[] = await res.json();
      return data.filter(t => t.coverUrl).sort((a, b) => a.id - b.id);
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const tracks = rawTracks ?? null;
  const { currentTrackId, isPlaying, toggle } = useAudioPlayer();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, #0c1228 0%, #040812 50%, #020408 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "16px 8px",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
      data-testid="page-jukebox"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 740,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            background: "linear-gradient(180deg, #1a1e3a 0%, #12152a 10%, #0c0f20 50%, #080b18 90%, #0a0d1e 100%)",
            borderRadius: "32px 32px 24px 24px",
            border: "3px solid transparent",
            borderImage: "linear-gradient(180deg, rgba(108,240,255,.3), rgba(160,107,255,.2), rgba(255,79,216,.2), rgba(160,107,255,.15)) 1",
            overflow: "hidden",
            boxShadow: "0 0 60px rgba(108,240,255,.08), 0 0 120px rgba(160,107,255,.05), 0 4px 40px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.05)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 12,
              height: "100%",
              background: "linear-gradient(180deg, #ff4fd8, #a06bff, #6cf0ff, #ff4fd8, #a06bff, #6cf0ff, #ff4fd8, #a06bff, #6cf0ff)",
              boxShadow: "4px 0 25px rgba(255,79,216,.3), 4px 0 50px rgba(160,107,255,.15), 4px 0 80px rgba(108,240,255,.1)",
              zIndex: 5,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 12,
              height: "100%",
              background: "linear-gradient(180deg, #6cf0ff, #a06bff, #ff4fd8, #6cf0ff, #a06bff, #ff4fd8, #6cf0ff, #a06bff, #ff4fd8)",
              boxShadow: "-4px 0 25px rgba(108,240,255,.3), -4px 0 50px rgba(160,107,255,.15), -4px 0 80px rgba(255,79,216,.1)",
              zIndex: 5,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 12,
              right: 12,
              height: 4,
              background: "linear-gradient(90deg, #ff4fd8, #a06bff, #6cf0ff, #a06bff, #ff4fd8)",
              boxShadow: "0 2px 20px rgba(160,107,255,.4)",
              zIndex: 5,
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 12,
              right: 12,
              height: 4,
              background: "linear-gradient(90deg, #6cf0ff, #a06bff, #ff4fd8, #a06bff, #6cf0ff)",
              boxShadow: "0 -2px 20px rgba(160,107,255,.4)",
              zIndex: 5,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "0 12px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "30px 20px 20px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80%",
                  height: "100%",
                  background: "radial-gradient(ellipse at 50% 0%, rgba(160,107,255,.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <img
                src={siteLogo}
                alt="Hit Wave Media"
                style={{
                  height: 38,
                  width: "auto",
                  margin: "0 auto 16px",
                  display: "block",
                  filter: "drop-shadow(0 0 8px rgba(108,240,255,.3))",
                }}
              />

              <div
                style={{
                  display: "inline-block",
                  padding: "8px 40px",
                  borderRadius: 30,
                  border: "2px solid rgba(108,240,255,.3)",
                  background: "linear-gradient(135deg, rgba(10,14,32,.9), rgba(15,20,45,.8))",
                  boxShadow: "0 0 30px rgba(108,240,255,.1), 0 0 60px rgba(160,107,255,.05), inset 0 0 30px rgba(108,240,255,.04), inset 0 1px 0 rgba(255,255,255,.05)",
                  position: "relative",
                }}
              >
                <h1
                  style={{
                    fontSize: "clamp(22px, 4.5vw, 36px)",
                    fontWeight: 900,
                    letterSpacing: 5,
                    textTransform: "uppercase",
                    background: "linear-gradient(90deg, #ff4fd8, #c97aff, #6cf0ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    margin: 0,
                    filter: "drop-shadow(0 0 10px rgba(160,107,255,.3))",
                  }}
                  data-testid="text-jukebox-title"
                >
                  Now Playing
                </h1>
              </div>
            </div>

            <div
              style={{
                margin: "0 6px",
                borderRadius: 16,
                border: "1px solid rgba(108,240,255,.1)",
                background: "linear-gradient(180deg, rgba(6,10,24,.9), rgba(4,6,16,.95))",
                boxShadow: "inset 0 2px 20px rgba(0,0,0,.5), inset 0 0 40px rgba(108,240,255,.02)",
                padding: "14px",
                minHeight: 300,
              }}
            >
              {isLoading ? (
                <div style={{ textAlign: "center", padding: 60, color: "rgba(170,182,232,.4)" }}>
                  Loading tracks...
                </div>
              ) : !tracks || tracks.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "rgba(170,182,232,.4)" }}>
                  No tracks available
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                    gap: 12,
                  }}
                >
                  {tracks.map((track) => {
                    const isActive = currentTrackId === track.id;
                    const isThisPlaying = isActive && isPlaying;

                    return (
                      <JukeboxTile
                        key={track.id}
                        track={track}
                        isActive={isActive}
                        isThisPlaying={isThisPlaying}
                        onToggle={() => {
                          if (track.fileUrl) {
                            toggle(track.id, track.fileUrl, {
                              title: track.title,
                              artist: track.artist,
                              coverUrl: track.coverUrl,
                            });
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "16px 10px 20px",
                color: "rgba(170,182,232,.2)",
                fontSize: 10,
              }}
            >
              &copy; {new Date().getFullYear()} Hit Wave Media
            </div>
          </div>
        </div>

        <div
          style={{
            width: "60%",
            height: 6,
            margin: "0 auto",
            background: "linear-gradient(90deg, transparent, rgba(108,240,255,.15), rgba(160,107,255,.1), rgba(108,240,255,.15), transparent)",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 4px 20px rgba(108,240,255,.08)",
          }}
        />
      </div>
    </div>
  );
}
