import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Track } from "@shared/schema";
import { Disc3, Upload, Music, X } from "lucide-react";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

export default function CreateAlbum() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hwm_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const { data: myTracks = [] } = useQuery<{ tracks: Track[] }>({
    queryKey: ["/api/creators", user?.creatorId],
    enabled: !!user?.creatorId,
    select: (data: any) => data,
  });

  const tracks: Track[] = (myTracks as any)?.tracks || [];

  const selectedTracks = selectedTrackIds.map(id => tracks.find(t => t.id === id)).filter(Boolean) as Track[];

  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const toggleTrack = useCallback((trackId: number) => {
    setSelectedTrackIds(prev =>
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  }, []);

  const removeTrack = useCallback((trackId: number) => {
    setSelectedTrackIds(prev => prev.filter(id => id !== trackId));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!title.trim() || selectedTrackIds.length === 0) return;
    setCreating(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (description.trim()) formData.append("description", description.trim());
      if (coverFile) formData.append("cover", coverFile);

      const res = await fetch("/api/albums", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Failed to create album");
      const album = await res.json();

      for (let i = 0; i < selectedTrackIds.length; i++) {
        await apiRequest("POST", `/api/albums/${album.id}/tracks`, { trackId: selectedTrackIds[i], trackOrder: i });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators", user?.creatorId, "albums"] });
      navigate(`/album/${album.id}`);
    } catch (err) {
      console.error("Failed to create album:", err);
    } finally {
      setCreating(false);
    }
  }, [title, description, coverFile, selectedTrackIds, user, navigate]);

  if (!user || !user.creatorId) {
    return (
      <div className="hwm-app mockup-bg">
        <div className="wrap" style={{ paddingTop: 60, maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#ff4fd8", fontSize: 20, fontWeight: 700 }}>Sign in as a creator to make albums</h2>
          <a href="/sign-in" style={{ color: "#6cf0ff", marginTop: 16, display: "inline-block" }} data-testid="link-signin">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="hwm-app mockup-bg">
      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 100, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: "#eaf0ff", marginBottom: 24 }} data-testid="text-create-album-title">
          <Disc3 size={24} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#a06bff" }} />
          Create Album
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }} className="create-album-grid">

          <div>
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(108,240,255,.12)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#aab6e8", marginBottom: 6 }}>Album Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter album title..."
                style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(108,240,255,.15)", borderRadius: 8, color: "#eaf0ff", fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }}
                data-testid="input-album-title"
              />

              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#aab6e8", marginBottom: 6 }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell listeners about this album..."
                rows={2}
                style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(108,240,255,.15)", borderRadius: 8, color: "#eaf0ff", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }}
                data-testid="input-album-description"
              />
            </div>

            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(108,240,255,.12)", borderRadius: 12, padding: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#aab6e8", marginBottom: 10 }}>
                Pick Your Songs
              </label>
              <p style={{ fontSize: 11, color: "rgba(170,182,232,.4)", marginBottom: 12 }}>
                Tap a song to add it to your album. Each song gets numbered in order.
              </p>
              {tracks.length === 0 && (
                <p style={{ color: "rgba(170,182,232,.4)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>You don't have any tracks yet. Upload some songs first!</p>
              )}
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {tracks.map((track) => {
                  const selectedIndex = selectedTrackIds.indexOf(track.id);
                  const isSelected = selectedIndex !== -1;
                  return (
                    <div
                      key={track.id}
                      onClick={() => toggleTrack(track.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 8,
                        marginBottom: 4,
                        cursor: "pointer",
                        background: isSelected ? "rgba(160,107,255,.15)" : "rgba(255,255,255,.02)",
                        border: isSelected ? "1px solid rgba(160,107,255,.35)" : "1px solid transparent",
                        transition: "all .2s",
                      }}
                      data-testid={`select-track-${track.id}`}
                    >
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: isSelected ? "#a06bff" : "rgba(255,255,255,.06)",
                        border: isSelected ? "none" : "1px solid rgba(108,240,255,.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: "#fff", fontWeight: 800, flexShrink: 0,
                      }}>
                        {isSelected ? `#${selectedIndex + 1}` : <Music size={12} style={{ color: "rgba(170,182,232,.3)" }} />}
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#c9a0ff" : "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</div>
                        <div style={{ fontSize: 10, color: "rgba(170,182,232,.4)" }}>{track.genre}</div>
                      </div>
                      {isSelected && (
                        <div style={{ fontSize: 10, color: "#a06bff", fontWeight: 700 }}>Added</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ position: "sticky", top: 32 }}>
            <div style={{
              background: "rgba(10,8,30,.85)", border: "1px solid rgba(108,240,255,.15)", borderRadius: 14,
              overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,.5)",
            }}>
              <div
                onClick={() => document.getElementById("cover-input")?.click()}
                style={{
                  width: "100%", aspectRatio: "1", position: "relative",
                  background: coverPreview ? `url(${coverPreview}) center/cover` : "linear-gradient(135deg, rgba(160,107,255,.15) 0%, rgba(255,79,216,.1) 100%)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                data-testid="button-cover-upload"
              >
                {!coverPreview && (
                  <div style={{ textAlign: "center" }}>
                    <Upload size={32} style={{ color: "rgba(160,107,255,.4)" }} />
                    <div style={{ fontSize: 12, color: "rgba(170,182,232,.4)", marginTop: 6 }}>Tap to upload cover art</div>
                  </div>
                )}
                {coverPreview && (
                  <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.6)", borderRadius: 6, padding: "4px 8px", fontSize: 10, color: "#fff" }}>Change</div>
                )}
              </div>
              <input id="cover-input" type="file" accept="image/*" onChange={handleCoverChange} style={{ display: "none" }} />

              <div style={{ padding: "16px 18px 8px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#a06bff", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Album</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#eaf0ff", marginBottom: 2 }}>
                  {title || "Untitled Album"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(170,182,232,.5)", marginBottom: 12 }}>
                  {user?.name || "You"} · {selectedTracks.length} song{selectedTracks.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(108,240,255,.08)", maxHeight: 260, overflowY: "auto" }}>
                {selectedTracks.length === 0 ? (
                  <div style={{ padding: "24px 18px", textAlign: "center", color: "rgba(170,182,232,.3)", fontSize: 13 }}>
                    Pick songs from the left to build your album
                  </div>
                ) : (
                  selectedTracks.map((track, i) => (
                    <div key={track.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 18px",
                      borderBottom: i < selectedTracks.length - 1 ? "1px solid rgba(108,240,255,.05)" : undefined,
                    }} data-testid={`album-preview-track-${track.id}`}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: "rgba(160,107,255,.2)", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800, color: "#a06bff", flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
                        data-testid={`remove-track-${track.id}`}
                      >
                        <X size={14} style={{ color: "rgba(170,182,232,.4)" }} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: "12px 18px 16px" }}>
                <button
                  onClick={handleCreate}
                  disabled={!title.trim() || selectedTrackIds.length === 0 || creating}
                  style={{
                    width: "100%", padding: "12px 0",
                    background: title.trim() && selectedTrackIds.length > 0 && !creating
                      ? "linear-gradient(135deg, #a06bff 0%, #ff4fd8 100%)"
                      : "rgba(170,182,232,.12)",
                    border: "none", borderRadius: 24,
                    color: title.trim() && selectedTrackIds.length > 0 && !creating ? "#fff" : "rgba(170,182,232,.3)",
                    fontWeight: 700, fontSize: 15,
                    cursor: title.trim() && selectedTrackIds.length > 0 && !creating ? "pointer" : "not-allowed",
                  }}
                  data-testid="button-create-album"
                >
                  {creating ? "Creating..." : `Create Album (${selectedTrackIds.length} song${selectedTrackIds.length !== 1 ? "s" : ""})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .create-album-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
