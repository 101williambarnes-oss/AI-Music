import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Track } from "@shared/schema";
import { Disc3, Upload, Music, X, Plus, Loader2 } from "lucide-react";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

type UploadedNewTrack = {
  tempId: string;
  title: string;
  file: File;
  genre: string;
  uploading: boolean;
  uploaded: boolean;
  trackId: number | null;
  error: string | null;
};

type AlbumTrackItem = {
  type: "existing";
  trackId: number;
  title: string;
} | {
  type: "new";
  tempId: string;
  title: string;
};

export default function CreateAlbum() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [albumItems, setAlbumItems] = useState<AlbumTrackItem[]>([]);
  const [newUploads, setNewUploads] = useState<UploadedNewTrack[]>([]);
  const [creating, setCreating] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"platform" | "upload">("platform");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadGenre, setUploadGenre] = useState("Other");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hwm_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        fetch("/api/auth/me", { credentials: "include" })
          .then(r => {
            if (!r.ok) {
              localStorage.removeItem("hwm_user");
              setUser(null);
            } else {
              return r.json().then(data => {
                if (data.user) {
                  localStorage.setItem("hwm_user", JSON.stringify(data.user));
                  setUser(data.user);
                } else {
                  localStorage.removeItem("hwm_user");
                  setUser(null);
                }
              });
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const { data: myTracks = [] } = useQuery<{ tracks: Track[] }>({
    queryKey: ["/api/creators", user?.creatorId],
    enabled: !!user?.creatorId,
    select: (data: any) => data,
  });

  const tracks: Track[] = (myTracks as any)?.tracks || [];

  const selectedExistingIds = albumItems.filter(i => i.type === "existing").map(i => (i as any).trackId);
  const selectedNewTempIds = albumItems.filter(i => i.type === "new").map(i => (i as any).tempId);

  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const toggleExistingTrack = useCallback((track: Track) => {
    setAlbumItems(prev => {
      const exists = prev.some(i => i.type === "existing" && i.trackId === track.id);
      if (exists) return prev.filter(i => !(i.type === "existing" && i.trackId === track.id));
      return [...prev, { type: "existing", trackId: track.id, title: track.title }];
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setAlbumItems(prev => {
      const removed = prev[index];
      if (removed?.type === "new") {
        setNewUploads(u => u.filter(nu => nu.tempId !== removed.tempId));
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleAddUpload = useCallback(async () => {
    if (!uploadFile || !uploadTitle.trim()) return;

    const tempId = `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newTrack: UploadedNewTrack = {
      tempId,
      title: uploadTitle.trim(),
      file: uploadFile,
      genre: uploadGenre,
      uploading: false,
      uploaded: false,
      trackId: null,
      error: null,
    };

    setNewUploads(prev => [...prev, newTrack]);
    setAlbumItems(prev => [...prev, { type: "new", tempId, title: uploadTitle.trim() }]);
    setUploadTitle("");
    setUploadFile(null);
    setUploadGenre("Other");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [uploadFile, uploadTitle, uploadGenre]);

  const handleCreate = useCallback(async () => {
    if (!title.trim() || albumItems.length === 0 || !coverFile) return;
    setCreating(true);

    try {
      const uploadedTrackIds: Record<string, number> = {};
      const activeNewTempIds = albumItems.filter(i => i.type === "new").map(i => (i as any).tempId);
      const uploadsToProcess = newUploads.filter(nu => activeNewTempIds.includes(nu.tempId));
      for (const nu of uploadsToProcess) {
        if (nu.uploaded && nu.trackId) {
          uploadedTrackIds[nu.tempId] = nu.trackId;
          continue;
        }

        setNewUploads(prev => prev.map(u => u.tempId === nu.tempId ? { ...u, uploading: true, error: null } : u));

        const formData = new FormData();
        formData.append("title", nu.title);
        formData.append("genre", nu.genre);
        formData.append("file", nu.file);
        formData.append("aiTools", JSON.stringify([]));
        formData.append("explicit", "false");
        if (user?.id) formData.append("userId", String(user.id));

        try {
          const res = await fetch("/api/tracks/upload", { method: "POST", body: formData, credentials: "include" });
          if (!res.ok) {
            const errData = await res.json().catch(() => null);
            throw new Error(errData?.message || `Upload failed (${res.status})`);
          }
          const result = await res.json();
          uploadedTrackIds[nu.tempId] = result.track.id;
          setNewUploads(prev => prev.map(u => u.tempId === nu.tempId ? { ...u, uploading: false, uploaded: true, trackId: result.track.id } : u));
        } catch (err: any) {
          setNewUploads(prev => prev.map(u => u.tempId === nu.tempId ? { ...u, uploading: false, error: err.message } : u));
          setCreating(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      if (description.trim()) formData.append("description", description.trim());
      if (coverFile) formData.append("cover", coverFile);

      const res = await fetch("/api/albums", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Failed to create album (${res.status})`);
      }
      const album = await res.json();

      for (let i = 0; i < albumItems.length; i++) {
        const item = albumItems[i];
        let trackId: number;
        if (item.type === "existing") trackId = item.trackId;
        else trackId = uploadedTrackIds[item.tempId];

        if (trackId) {
          await apiRequest("POST", `/api/albums/${album.id}/tracks`, { trackId, trackOrder: i });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators", user?.creatorId, "albums"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators", user?.creatorId] });
      navigate(`/album/${album.id}`);
    } catch (err: any) {
      console.error("Failed to create album:", err);
      setPublishError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }, [title, description, coverFile, albumItems, newUploads, user, navigate]);

  const totalSongs = albumItems.length;

  const GENRES = ["Hip Hop", "R&B", "Pop", "Rock", "Country", "Jazz", "Blues", "Electronic", "Classical", "Reggae", "Latin", "Gospel", "Indie", "Alternative", "Metal", "Folk", "Soul", "Funk", "Punk", "Lo-fi", "Other"];

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

            <div style={{ display: "flex", borderRadius: "10px 10px 0 0", overflow: "hidden", marginBottom: 0 }}>
              <button
                onClick={() => setActiveTab("platform")}
                style={{
                  flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
                  background: activeTab === "platform" ? "rgba(160,107,255,.15)" : "rgba(255,255,255,.04)",
                  color: activeTab === "platform" ? "#c9a0ff" : "rgba(170,182,232,.5)",
                  fontWeight: 700, fontSize: 13, borderBottom: activeTab === "platform" ? "2px solid #a06bff" : "2px solid transparent",
                }}
                data-testid="tab-platform-songs"
              >
                <Music size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                My Songs on Platform
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                style={{
                  flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
                  background: activeTab === "upload" ? "rgba(108,240,255,.1)" : "rgba(255,255,255,.04)",
                  color: activeTab === "upload" ? "#6cf0ff" : "rgba(170,182,232,.5)",
                  fontWeight: 700, fontSize: 13, borderBottom: activeTab === "upload" ? "2px solid #6cf0ff" : "2px solid transparent",
                }}
                data-testid="tab-upload-songs"
              >
                <Upload size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                Upload from Computer
              </button>
            </div>

            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(108,240,255,.12)", borderRadius: "0 0 12px 12px", padding: 20 }}>
              {activeTab === "platform" && (
                <>
                  <p style={{ fontSize: 11, color: "rgba(170,182,232,.4)", marginBottom: 12 }}>
                    Tap a song to add it to your album. Each song gets numbered in order.
                  </p>
                  {tracks.length === 0 && (
                    <p style={{ color: "rgba(170,182,232,.4)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>You don't have any tracks yet. Upload some songs first!</p>
                  )}
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {tracks.map((track) => {
                      const isSelected = selectedExistingIds.includes(track.id);
                      const itemIndex = albumItems.findIndex(i => i.type === "existing" && i.trackId === track.id);
                      const albumPosition = itemIndex !== -1 ? albumItems.slice(0, itemIndex + 1).indexOf(albumItems[itemIndex]) + 1 : -1;
                      const overallIndex = itemIndex !== -1 ? itemIndex + 1 : -1;
                      return (
                        <div
                          key={track.id}
                          onClick={() => toggleExistingTrack(track)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 12px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
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
                            {isSelected ? `#${overallIndex}` : <Music size={12} style={{ color: "rgba(170,182,232,.3)" }} />}
                          </div>
                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#c9a0ff" : "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</div>
                            <div style={{ fontSize: 10, color: "rgba(170,182,232,.4)" }}>{track.genre}</div>
                          </div>
                          {isSelected && <div style={{ fontSize: 10, color: "#a06bff", fontWeight: 700 }}>Added</div>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {activeTab === "upload" && (
                <>
                  <p style={{ fontSize: 11, color: "rgba(170,182,232,.4)", marginBottom: 12 }}>
                    Select multiple audio files at once — they'll all be added to your album automatically.
                  </p>

                  <div style={{ marginBottom: 16 }}>
                    <button
                      onClick={() => bulkFileInputRef.current?.click()}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        width: "100%", padding: "16px 0",
                        background: "rgba(108,240,255,.08)",
                        border: "2px dashed rgba(108,240,255,.25)",
                        borderRadius: 12,
                        color: "#6cf0ff",
                        fontWeight: 700, fontSize: 14,
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                      data-testid="button-bulk-upload"
                    >
                      <Upload size={18} /> Choose Audio Files
                    </button>
                    <input
                      ref={bulkFileInputRef}
                      type="file"
                      accept=".mp3,.wav,.ogg,.flac,.m4a,.aac,.mp4,.webm"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        for (let i = 0; i < files.length; i++) {
                          const file = files[i];
                          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
                          const songTitle = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
                          const tempId = `new-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`;
                          const newTrack: UploadedNewTrack = {
                            tempId,
                            title: songTitle,
                            file,
                            genre: uploadGenre,
                            uploading: false,
                            uploaded: false,
                            trackId: null,
                            error: null,
                          };
                          setNewUploads(prev => [...prev, newTrack]);
                          setAlbumItems(prev => [...prev, { type: "new", tempId, title: songTitle }]);
                        }
                        if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
                      }}
                      style={{ display: "none" }}
                      data-testid="input-bulk-files"
                    />
                    <p style={{ fontSize: 10, color: "rgba(170,182,232,.3)", textAlign: "center", marginTop: 6 }}>
                      MP3, WAV, OGG, FLAC, M4A, AAC supported — select as many as you want
                    </p>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#aab6e8", marginBottom: 4 }}>Default Genre for uploads</label>
                    <select
                      value={uploadGenre}
                      onChange={(e) => setUploadGenre(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(108,240,255,.15)", borderRadius: 8, color: "#eaf0ff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      data-testid="select-upload-genre"
                    >
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(108,240,255,.08)", paddingTop: 12, marginTop: 4 }}>
                    <p style={{ fontSize: 11, color: "rgba(170,182,232,.35)", marginBottom: 8 }}>Or add one song at a time:</p>
                    <div style={{ marginBottom: 8 }}>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Song title..."
                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(108,240,255,.15)", borderRadius: 8, color: "#eaf0ff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                        data-testid="input-upload-title"
                      />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".mp3,.wav,.ogg,.flac,.m4a,.aac,.mp4,.webm"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        style={{ width: "100%", padding: "6px 0", color: "rgba(170,182,232,.5)", fontSize: 11 }}
                        data-testid="input-upload-file"
                      />
                    </div>
                    <button
                      onClick={handleAddUpload}
                      disabled={!uploadFile || !uploadTitle.trim()}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        width: "100%", padding: "8px 0",
                        background: uploadFile && uploadTitle.trim() ? "rgba(108,240,255,.12)" : "rgba(255,255,255,.04)",
                        border: uploadFile && uploadTitle.trim() ? "1px solid rgba(108,240,255,.25)" : "1px solid rgba(108,240,255,.1)",
                        borderRadius: 8,
                        color: uploadFile && uploadTitle.trim() ? "#6cf0ff" : "rgba(170,182,232,.3)",
                        fontWeight: 700, fontSize: 12,
                        cursor: uploadFile && uploadTitle.trim() ? "pointer" : "not-allowed",
                      }}
                      data-testid="button-add-upload"
                    >
                      <Plus size={14} /> Add Single Song
                    </button>
                  </div>
                </>
              )}
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
                    <div style={{ fontSize: 10, color: "#ff4fd8", marginTop: 4, fontWeight: 600 }}>Required *</div>
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
                  {user?.name || "You"} · {totalSongs} song{totalSongs !== 1 ? "s" : ""}
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(108,240,255,.08)", maxHeight: 260, overflowY: "auto" }}>
                {albumItems.length === 0 ? (
                  <div style={{ padding: "24px 18px", textAlign: "center", color: "rgba(170,182,232,.3)", fontSize: 13 }}>
                    Pick songs or upload new ones to build your album
                  </div>
                ) : (
                  albumItems.map((item, i) => {
                    const isNew = item.type === "new";
                    const nu = isNew ? newUploads.find(u => u.tempId === item.tempId) : null;
                    return (
                      <div key={isNew ? item.tempId : `e-${item.trackId}`} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 18px",
                        borderBottom: i < albumItems.length - 1 ? "1px solid rgba(108,240,255,.05)" : undefined,
                      }} data-testid={`album-preview-item-${i}`}>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: "rgba(160,107,255,.2)", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 800, color: "#a06bff", flexShrink: 0,
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.title}
                          </div>
                          {isNew && (
                            <div style={{ fontSize: 10, color: nu?.uploading ? "#6cf0ff" : nu?.uploaded ? "#4ade80" : "#ff4fd8" }}>
                              {nu?.uploading ? "Uploading..." : nu?.uploaded ? "Uploaded" : nu?.error ? `Error: ${nu.error}` : "New upload"}
                            </div>
                          )}
                        </div>
                        {nu?.uploading ? (
                          <Loader2 size={14} style={{ color: "#6cf0ff", animation: "spin 1s linear infinite" }} />
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeItem(i); }}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
                            data-testid={`remove-item-${i}`}
                          >
                            <X size={14} style={{ color: "rgba(170,182,232,.4)" }} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ padding: "16px 18px 20px" }}>
                {publishError && (
                  <div style={{
                    background: "rgba(255,79,79,.12)", border: "1px solid rgba(255,79,79,.3)", borderRadius: 10,
                    padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#ff6b6b", fontWeight: 600, textAlign: "center",
                  }} data-testid="publish-error">
                    {publishError}
                  </div>
                )}

                {!title.trim() && (
                  <div style={{ fontSize: 12, color: "rgba(170,182,232,.4)", textAlign: "center", marginBottom: 8 }}>
                    Enter an album title to get started
                  </div>
                )}
                {title.trim() && !coverFile && (
                  <div style={{ fontSize: 12, color: "#ff4fd8", textAlign: "center", marginBottom: 8, fontWeight: 600 }}>
                    Tap the cover area above to add album art
                  </div>
                )}
                {title.trim() && coverFile && albumItems.length === 0 && (
                  <div style={{ fontSize: 12, color: "#ff4fd8", textAlign: "center", marginBottom: 8, fontWeight: 600 }}>
                    Add at least one song to your album
                  </div>
                )}

                <button
                  onClick={() => { setPublishError(null); handleCreate(); }}
                  disabled={!title.trim() || albumItems.length === 0 || !coverFile || creating}
                  style={{
                    width: "100%", padding: "20px 0",
                    background: title.trim() && albumItems.length > 0 && coverFile && !creating
                      ? "linear-gradient(135deg, #a06bff 0%, #ff4fd8 100%)"
                      : "rgba(170,182,232,.08)",
                    border: title.trim() && albumItems.length > 0 && coverFile && !creating
                      ? "2px solid rgba(255,79,216,.4)"
                      : "2px solid rgba(170,182,232,.1)",
                    borderRadius: 30,
                    color: title.trim() && albumItems.length > 0 && coverFile && !creating ? "#fff" : "rgba(170,182,232,.25)",
                    fontWeight: 900, fontSize: 20, textTransform: "uppercase" as const,
                    cursor: title.trim() && albumItems.length > 0 && coverFile && !creating ? "pointer" : "not-allowed",
                    boxShadow: title.trim() && albumItems.length > 0 && coverFile && !creating
                      ? "0 6px 30px rgba(160,107,255,.4), 0 0 60px rgba(255,79,216,.15)"
                      : "none",
                    transition: "all .3s",
                    letterSpacing: 1.5,
                  }}
                  data-testid="button-create-album"
                >
                  {creating ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                      Publishing...
                    </span>
                  ) : (
                    `PUBLISH ALBUM`
                  )}
                </button>

                {title.trim() && albumItems.length > 0 && coverFile && !creating && (
                  <p style={{ fontSize: 10, color: "rgba(170,182,232,.35)", textAlign: "center", marginTop: 8 }}>
                    Your album will appear in the Albums section immediately
                  </p>
                )}
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
