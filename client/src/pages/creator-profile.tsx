import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { type Track, type Creator } from "@shared/schema";
import { Upload, Camera } from "lucide-react";
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
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`/api/creators/${creatorId}/avatar`, {
        method: "POST",
        credentials: "include",
        headers: { "x-user-id": String(user?.id || "") },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Failed to upload" }));
        throw new Error(data.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
    },
  });

  function handleAvatarClick() {
    if (isOwnProfile && avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      avatarMutation.mutate(file);
    }
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }

  const avatarGradient =
    creator?.avatarColor === "cyan"
      ? "radial-gradient(circle at 30% 30%, rgba(108,240,255,.8), rgba(160,107,255,.35) 55%, rgba(255,79,216,.20))"
      : creator?.avatarColor === "pink"
      ? "radial-gradient(circle at 30% 30%, rgba(255,79,216,.8), rgba(160,107,255,.35) 55%, rgba(108,240,255,.20))"
      : "radial-gradient(circle at 30% 30%, rgba(160,107,255,.8), rgba(108,240,255,.35) 55%, rgba(255,79,216,.20))";

  return (
    <div className="hwm-app">
      <div className="bg-lines" />

      <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 8 }}>
        <a href="/" style={{ textDecoration: "none" }} data-testid="link-logo-home">
          <div style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: "1.5rem",
            fontWeight: 900,
            letterSpacing: 3,
            background: "linear-gradient(90deg, #6cf0ff 0%, #a06bff 50%, #ff4fd8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }} data-testid="text-brand-logo">
            HIT WAVE MEDIA
          </div>
          <div style={{ fontSize: "0.7rem", color: "rgba(170,182,232,.5)", letterSpacing: 2, marginTop: 2 }}>
            The Home of AI Music
          </div>
        </a>
      </div>

      <div className="wrap" style={{ paddingTop: 16, maxWidth: 700, margin: "0 auto" }}>
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
                    background: creator.avatarUrl ? `url(${creator.avatarUrl}) center/cover no-repeat` : avatarGradient,
                    border: "2px solid rgba(108,240,255,.25)",
                    flexShrink: 0,
                    boxShadow: "0 0 24px rgba(108,240,255,.15)",
                    cursor: isOwnProfile ? "pointer" : "default",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onClick={handleAvatarClick}
                  title={isOwnProfile ? "Click to change your profile photo" : undefined}
                  data-testid="img-creator-avatar"
                >
                  {isOwnProfile && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 0",
                      }}
                    >
                      <Camera size={14} style={{ color: "#fff" }} />
                    </div>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                  data-testid="input-avatar-upload"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{ color: "#6cf0ff", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: 1 }} data-testid="text-creator-name">{creator.name}</h1>
                  <div style={{ color: "rgba(170,182,232,.7)", fontSize: 14, marginTop: 6 }} data-testid="text-creator-stats">
                    {creator.trackCount} Track{creator.trackCount !== 1 ? "s" : ""} Published
                  </div>
                  {avatarMutation.isPending && (
                    <div style={{ color: "#6cf0ff", fontSize: 12, marginTop: 4 }}>Uploading photo...</div>
                  )}
                  {avatarMutation.isError && (
                    <div style={{ color: "#ff4fd8", fontSize: 12, marginTop: 4 }}>Failed to upload photo. Try again.</div>
                  )}
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
                      <TrackRow
                        key={track.id}
                        track={track}
                        showDownload
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
