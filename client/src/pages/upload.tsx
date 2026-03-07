import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Upload as UploadIcon } from "lucide-react";
import { PageNav } from "@/components/page-nav";
import { ALL_GENRES } from "@/lib/genres";

const ALLOWED_EXTS = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".mp4", ".webm", ".mov", ".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ACCEPT = ALLOWED_EXTS.join(",");

export default function Upload() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [isExplicit, setIsExplicit] = useState(false);
  const [ownsRights, setOwnsRights] = useState(false);
  const [agreesTerms, setAgreesTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  const TOOLS = ["Suno", "Udio", "Beatoven.ai", "Soundraw", "Stable Audio", "Mubert", "Riffusion", "Uberduck AI", "MusicGen", "Producer AI", "Boomy", "Ecrett Music", "Soundful", "Other"];

  useEffect(() => {
    const stored = localStorage.getItem("hwm_user");
    if (stored) {
      setIsLoggedIn(true);
      setAuthChecking(false);
    } else {
      fetch("/api/auth/me")
        .then((res) => {
          if (res.ok) {
            return res.json().then((data: any) => {
              if (data?.user) {
                localStorage.setItem("hwm_user", JSON.stringify(data.user));
                setIsLoggedIn(true);
              }
            });
          }
        })
        .catch(() => {})
        .finally(() => setAuthChecking(false));
    }
  }, []);

  function toggleTool(tool: string) {
    setAiTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  }

  const AUDIO_EXTS = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"];
  const VIDEO_EXTS = [".mp4", ".webm", ".mov"];
  const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (preview) URL.revokeObjectURL(preview);
    if (coverPreview && coverPreview !== "video") URL.revokeObjectURL(coverPreview);
    setPreview(null);
    setCoverFile(null);
    setCoverPreview(null);

    let audioFile: File | null = null;
    let videoFile: File | null = null;
    let imageFile: File | null = null;

    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i];
      const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        setError("Unsupported file: " + f.name);
        return;
      }
      if (f.size > 50 * 1024 * 1024) {
        setError("File too large: " + f.name + " (max 50MB)");
        return;
      }
      if (AUDIO_EXTS.includes(ext)) audioFile = f;
      else if (VIDEO_EXTS.includes(ext)) videoFile = f;
      else if (IMAGE_EXTS.includes(ext)) imageFile = f;
    }

    setError("");

    if (audioFile && (imageFile || videoFile)) {
      setFile(audioFile);
      const cover = imageFile || videoFile!;
      setCoverFile(cover);
      const coverExt = cover.name.substring(cover.name.lastIndexOf(".")).toLowerCase();
      setCoverPreview(IMAGE_EXTS.includes(coverExt) ? URL.createObjectURL(cover) : "video");
    } else if (audioFile) {
      setFile(audioFile);
    } else if (videoFile) {
      setFile(videoFile);
    } else if (imageFile) {
      setFile(imageFile);
      setPreview(URL.createObjectURL(imageFile));
    } else if (selectedFiles.length === 1) {
      setFile(selectedFiles[0]);
      const ext = selectedFiles[0].name.substring(selectedFiles[0].name.lastIndexOf(".")).toLowerCase();
      if (IMAGE_EXTS.includes(ext)) setPreview(URL.createObjectURL(selectedFiles[0]));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Title is required.");
    if (!genre.trim()) return setError("Genre is required.");
    if (!file) return setError("Please select a file to upload.");
    if (aiTools.length === 0) return setError("Select at least one AI tool used.");
    if (!ownsRights) return setError("You must confirm you own all rights.");
    if (!agreesTerms) return setError("You must agree to the platform terms.");

    setLoading(true);

    try {
      const stored = localStorage.getItem("hwm_user");
      const userData = stored ? JSON.parse(stored) : null;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("genre", genre);
      formData.append("aiTools", JSON.stringify(aiTools));
      formData.append("file", file);
      formData.append("explicit", String(isExplicit));
      if (coverFile) formData.append("cover", coverFile);
      if (userData?.id) formData.append("userId", String(userData.id));

      const res = await fetch("/api/tracks/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setLocation(`/creator/${data.creatorId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(108,240,255,.15)",
    borderRadius: 6,
    color: "#eaf0ff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
  };

  if (authChecking) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 16, maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <PageNav />
          <div style={{ color: "rgba(170,182,232,.6)", fontSize: 16 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 16, maxWidth: 420, margin: "0 auto" }}>
          <PageNav />
          <section className="panel" style={{ padding: 32, textAlign: "center" }}>
            <h2 style={{ color: "#6cf0ff", fontSize: 24, fontWeight: 700, marginBottom: 12 }} data-testid="text-upload-login-required">Sign In Required</h2>
            <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, marginBottom: 24 }}>You need to sign in to upload tracks.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <a href="/sign-in" style={{ padding: "10px 24px", background: "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)", borderRadius: 6, color: "#050615", fontWeight: 700, fontSize: 15, textDecoration: "none" }} data-testid="link-signin">Sign In</a>
              <a href="/sign-up" style={{ padding: "10px 24px", border: "1px solid rgba(108,240,255,.3)", borderRadius: 6, color: "#6cf0ff", fontWeight: 700, fontSize: 15, textDecoration: "none" }} data-testid="link-signup">Sign Up</a>
            </div>
          </section>
        </div>
      </div>
    );
  }

  function getFileLabel(f: File) {
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if ([".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"].includes(ext)) return "Audio";
    if ([".mp4", ".webm", ".mov"].includes(ext)) return "Video";
    return "Image";
  }

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 16, maxWidth: 520, margin: "0 auto" }}>
        <PageNav />
        <section className="panel" style={{ padding: 32 }}>
          <h2 style={{ color: "#6cf0ff", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }} data-testid="text-upload-title">Upload Track</h2>
          <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, textAlign: "center", marginBottom: 24 }} data-testid="text-upload-subtitle">Share your AI-generated music with the world</p>

          {error && (
            <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(255,79,216,.12)", border: "1px solid rgba(255,79,216,.3)", borderRadius: 6, color: "#ff4fd8", fontSize: 14 }} data-testid="text-upload-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} data-testid="form-upload">
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Track Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Track title" style={inputStyle} required data-testid="input-track-title" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Genre *</label>
              <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ ...inputStyle, appearance: "auto" as any }} required data-testid="input-track-genre">
                <option value="" style={{ background: "#0d1229", color: "#aab6e8" }}>Select a genre</option>
                {ALL_GENRES.map((g) => (
                  <option key={g} value={g.toLowerCase()} style={{ background: "#0d1229", color: "#eaf0ff", padding: "8px" }}>{g}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Upload File *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                data-testid="input-file"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%",
                  padding: "24px 14px",
                  background: file ? "rgba(108,240,255,.08)" : "rgba(255,255,255,.04)",
                  border: `2px dashed ${file ? "rgba(108,240,255,.4)" : "rgba(108,240,255,.15)"}`,
                  borderRadius: 6,
                  color: file ? "#6cf0ff" : "rgba(170,182,232,.5)",
                  fontSize: 14,
                  textAlign: "center",
                  cursor: "pointer",
                  boxSizing: "border-box" as const,
                  transition: "border-color 0.2s, background 0.2s",
                }}
                data-testid="button-choose-file"
              >
                {file ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    {coverPreview && coverPreview !== "video" && (
                      <img src={coverPreview} alt="Cover" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
                    )}
                    {preview && !coverFile && (
                      <img src={preview} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} data-testid="img-file-preview" />
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                      <span style={{ background: "rgba(108,240,255,.15)", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{getFileLabel(file)}</span>
                      <span>{file.name}</span>
                      <span style={{ color: "rgba(170,182,232,.5)", fontSize: 12 }}>({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    </div>
                    {coverFile && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ background: "rgba(160,107,255,.15)", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, color: "#c9a0ff" }}>
                          {coverPreview === "video" ? "Video" : "Image"}
                        </span>
                        <span style={{ fontSize: 13 }}>{coverFile.name}</span>
                      </div>
                    )}
                    <div style={{ color: "rgba(170,182,232,.4)", fontSize: 12, marginTop: 2 }}>Click to change files</div>
                  </div>
                ) : (
                  <div>
                    <UploadIcon size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <div style={{ fontSize: 15, marginBottom: 4 }}>Click to upload your files</div>
                    <div style={{ fontSize: 12, color: "rgba(170,182,232,.4)" }}>Select your song + image or video together</div>
                    <div style={{ fontSize: 11, marginTop: 6, color: "rgba(170,182,232,.3)" }}>You can select multiple files at once (max 50MB each)</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 10 }}>AI Tools Used *</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {TOOLS.map((tool) => (
                  <label key={tool} style={{ display: "flex", alignItems: "center", gap: 6, color: "#dfefff", fontSize: 14, cursor: "pointer" }} data-testid={`checkbox-tool-${tool.toLowerCase().replace(/\s/g, "-")}`}>
                    <input type="checkbox" checked={aiTools.includes(tool)} onChange={() => toggleTool(tool)} style={{ accentColor: "#6cf0ff" }} />
                    {tool}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12, borderTop: "1px solid rgba(108,240,255,.1)", paddingTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff4fd8", fontSize: 14, cursor: "pointer" }} data-testid="checkbox-explicit">
                <input type="checkbox" checked={isExplicit} onChange={(e) => setIsExplicit(e.target.checked)} style={{ accentColor: "#ff4fd8" }} />
                This song contains explicit language
              </label>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#dfefff", fontSize: 14, cursor: "pointer" }} data-testid="checkbox-owns-rights">
                <input type="checkbox" checked={ownsRights} onChange={(e) => setOwnsRights(e.target.checked)} style={{ accentColor: "#6cf0ff" }} />
                I own all rights to this song
              </label>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#dfefff", fontSize: 14, cursor: "pointer" }} data-testid="checkbox-agrees-terms">
                <input type="checkbox" checked={agreesTerms} onChange={(e) => setAgreesTerms(e.target.checked)} style={{ accentColor: "#6cf0ff" }} />
                I agree to the platform terms
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 0",
                background: loading ? "rgba(108,240,255,.3)" : "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)",
                border: "none",
                borderRadius: 6,
                color: "#050615",
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              data-testid="button-upload-submit"
            >
              {loading ? "Uploading..." : "Upload Track"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
