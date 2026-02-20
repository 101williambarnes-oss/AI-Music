import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Track, type Creator } from "@shared/schema";
import { Upload } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { TrackRow } from "@/components/track-row";

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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{ color: "#6cf0ff", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: 1 }} data-testid="text-creator-name">{creator.name}</h1>
                  <div style={{ color: "rgba(170,182,232,.7)", fontSize: 14, marginTop: 6 }} data-testid="text-creator-stats">
                    {creator.trackCount} Track{creator.trackCount !== 1 ? "s" : ""} Published
                  </div>
                </div>
                <a
                  href="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(108,240,255,.25)",
                    background: "rgba(108,240,255,.08)",
                    color: "#6cf0ff",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "background .2s, border-color .2s",
                  }}
                  data-testid="link-back-home"
                >
                  &#8592; Home
                </a>
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
                      <TrackRow
                        key={track.id}
                        track={track}
                        onDelete={isOwnProfile ? (trackId) => deleteTrackMutation.mutate(trackId) : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
