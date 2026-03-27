import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Track } from "@shared/schema";
import { Disc3, Plus, X, Upload, Music, GripVertical } from "lucide-react";

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

  const handleCreate = useCallback(async () => {
    if (!title.trim()) return;
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
      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 100, maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: "#eaf0ff", marginBottom: 24 }} data-testid="text-create-album-title">
          <Disc3 size={24} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#a06bff" }} />
          Create Album
        </h1>

        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(108,240,255,.12)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#aab6e8", marginBottom: 6 }}>Album Cover</label>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
            <div style={{ width: 120, height: 120, borderRadius: 10, background: "rgba(160,107,255,.08)", border: "1px dashed rgba(160,107,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer", position: "relative" }}
              onClick={() => document.getElementById("cover-input")?.click()} data-testid="button-cover-upload">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Upload size={24} style={{ color: "rgba(160,107,255,.5)" }} />
                  <div style={{ fontSize: 10, color: "rgba(170,182,232,.4)", marginTop: 4 }}>Upload Cover</div>
                </div>
              )}
            </div>
            <input id="cover-input" type="file" accept="image/*" onChange={handleCoverChange} style={{ display: "none" }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "rgba(170,182,232,.4)" }}>Upload a square image for best results. This will be your album front page.</p>
            </div>
          </div>

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#aab6e8", marginBottom: 6 }}>Album Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter album title..."
            style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(108,240,255,.15)", borderRadius: 8, color: "#eaf0ff", fontSize: 14, marginBottom: 16, outline: "none" }}
            data-testid="input-album-title"
          />

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#aab6e8", marginBottom: 6 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell listeners about this album..."
            rows={3}
            style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(108,240,255,.15)", borderRadius: 8, color: "#eaf0ff", fontSize: 14, resize: "vertical", outline: "none" }}
            data-testid="input-album-description"
          />
        </div>

        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(108,240,255,.12)", borderRadius: 12, padding: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#aab6e8", marginBottom: 12 }}>
            Select Tracks ({selectedTrackIds.length} selected)
          </label>
          {tracks.length === 0 && (
            <p style={{ color: "rgba(170,182,232,.4)", fontSize: 13 }}>You don't have any tracks yet. Upload some songs first!</p>
          )}
          {tracks.map((track) => {
            const isSelected = selectedTrackIds.includes(track.id);
            return (
              <div
                key={track.id}
                onClick={() => toggleTrack(track.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  marginBottom: 4,
                  cursor: "pointer",
                  background: isSelected ? "rgba(160,107,255,.12)" : "rgba(255,255,255,.02)",
                  border: isSelected ? "1px solid rgba(160,107,255,.3)" : "1px solid transparent",
                  transition: "all .2s",
                }}
                data-testid={`select-track-${track.id}`}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: isSelected ? "#a06bff" : "rgba(255,255,255,.08)",
                  border: isSelected ? "none" : "1px solid rgba(108,240,255,.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#fff", fontWeight: 700, flexShrink: 0,
                }}>
                  {isSelected && "✓"}
                </div>
                <Music size={14} style={{ color: "rgba(170,182,232,.4)", flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(170,182,232,.4)" }}>{track.genre}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || creating}
            style={{
              padding: "12px 40px",
              background: title.trim() && !creating ? "linear-gradient(135deg, #a06bff 0%, #ff4fd8 100%)" : "rgba(170,182,232,.15)",
              border: "none",
              borderRadius: 24,
              color: title.trim() && !creating ? "#fff" : "rgba(170,182,232,.4)",
              fontWeight: 700,
              fontSize: 16,
              cursor: title.trim() && !creating ? "pointer" : "not-allowed",
            }}
            data-testid="button-create-album"
          >
            {creating ? "Creating..." : "Create Album"}
          </button>
        </div>
      </div>
    </div>
  );
}
