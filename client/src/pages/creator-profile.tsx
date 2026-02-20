import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Track, type Creator } from "@shared/schema";
import { Download, Upload, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

function formatPlays(plays: number) {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
}

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

export default function CreatorProfile() {
  const [, params] = useRoute("/creator/:id");
  const creatorId = params?.id;
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("hwm_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { data, isLoading, error } = useQuery<{ creator: Creator; tracks: Track[] }>({
    queryKey: ["/api/creators", creatorId],
    enabled: !!creatorId,
  });

  const creator = data?.creator;
  const tracks = data?.tracks || [];
  const isOwnProfile = user?.creatorId === creator?.id;

  const deleteTrackMutation = useMutation({
    mutationFn: async (trackId: number) => {
      const res = await fetch(`/api/tracks/${trackId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "x-user-id": String(user?.id || "") },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Failed to delete" }));
        throw new Error(data.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks/new"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks/trending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks/top25"] });
    },
  });

  const avatarGradient =
    creator?.avatarColor === "cyan"
      ? "radial-gradient(circle at 30% 30%, rgba(108,240,255,.8), rgba(160,107,255,.35) 55%, rgba(255,79,216,.20))"
      : creator?.avatarColor === "pink"
      ? "radial-gradient(circle at 30% 30%, rgba(255,79,216,.8), rgba(160,107,255,.35) 55%, rgba(108,240,255,.20))"
      : "radial-gradient(circle at 30% 30%, rgba(160,107,255,.8), rgba(108,240,255,.35) 55%, rgba(255,79,216,.20))";

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 40, maxWidth: 700, margin: "0 auto" }}>
        {isLoading ? (
          <section className="panel" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ color: "rgba(170,182,232,.6)", fontSize: 16 }} data-testid="text-loading">Loading creator profile...</div>
          </section>
        ) : error || !creator ? (
          <section className="panel" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ color: "#ff4fd8", fontSize: 18, fontWeight: 700, marginBottom: 12 }} data-testid="text-not-found">Creator Not Found</div>
            <div style={{ color: "rgba(170,182,232,.6)", fontSize: 14 }}>This creator doesn't exist or has been removed.</div>
          </section>
        ) : (
          <>
            <section className="panel" style={{ padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: avatarGradient,
                    border: "2px solid rgba(108,240,255,.25)",
                    flexShrink: 0,
                    boxShadow: "0 0 24px rgba(108,240,255,.15)",
                  }}
                  data-testid="img-creator-avatar"
                />
                <div>
                  <h1 style={{ color: "#6cf0ff", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: 1 }} data-testid="text-creator-name">{creator.name}</h1>
                  <div style={{ color: "rgba(170,182,232,.7)", fontSize: 14, marginTop: 6 }} data-testid="text-creator-stats">
                    {creator.trackCount} Track{creator.trackCount !== 1 ? "s" : ""} Published
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <a
                  href="/upload"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                    padding: "14px 0",
                    background: "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)",
                    border: "none",
                    borderRadius: 8,
                    color: "#050615",
                    fontSize: 16,
                    fontWeight: 800,
                    textDecoration: "none",
                    letterSpacing: 0.5,
                    marginBottom: 24,
                  }}
                  data-testid="button-download-music"
                >
                  <Upload style={{ width: 20, height: 20 }} />
                  Upload Your Music Now
                </a>
              )}

              <div style={{ borderTop: "1px solid rgba(108,240,255,.1)", paddingTop: 20 }}>
                <h3 style={{ color: "#6cf0ff", fontSize: 16, fontWeight: 700, marginBottom: 14, letterSpacing: .5 }} data-testid="text-tracks-heading">
                  Tracks by {creator.name}
                </h3>

                {tracks.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(170,182,232,.6)" }} data-testid="text-no-tracks">
                    No tracks uploaded yet
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }} data-testid="list-creator-tracks">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="row"
                        data-testid={`track-row-${track.id}`}
                      >
                        <div className="thumb">
                          <div className="play-btn">&#9654;</div>
                        </div>
                        <div className="meta">
                          <div className="title" data-testid={`text-track-title-${track.id}`}>{track.title}</div>
                          <div className="by" data-testid={`text-track-genre-${track.id}`}>{track.genre}</div>
                        </div>
                        <div className="stat" data-testid={`text-track-plays-${track.id}`}>{formatPlays(track.plays)}</div>
                        {track.fileUrl && (
                          <a
                            href={track.fileUrl}
                            download
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              background: "rgba(108,240,255,.1)",
                              border: "1px solid rgba(108,240,255,.2)",
                              color: "#6cf0ff",
                              textDecoration: "none",
                              flexShrink: 0,
                            }}
                            data-testid={`button-download-track-${track.id}`}
                          >
                            <Download size={14} />
                          </a>
                        )}
                        {isOwnProfile && (
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this track?")) {
                                deleteTrackMutation.mutate(track.id);
                              }
                            }}
                            disabled={deleteTrackMutation.isPending}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              background: "rgba(255,79,216,.1)",
                              border: "1px solid rgba(255,79,216,.2)",
                              color: "#ff4fd8",
                              cursor: "pointer",
                              flexShrink: 0,
                              opacity: deleteTrackMutation.isPending ? 0.5 : 1,
                            }}
                            data-testid={`button-delete-track-${track.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
        <div style={{ paddingTop: 20, textAlign: "center" }}>
          <a href="/" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-back-home">&#8592; Back to Home</a>
        </div>
      </div>
    </div>
  );
}
