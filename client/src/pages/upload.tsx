import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Music, Image } from "lucide-react";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [ownsRights, setOwnsRights] = useState(false);
  const [agreesTerms, setAgreesTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  const TOOLS = ["Suno", "Udio", "Stable Audio", "AIVA", "Other"];

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (file) {
      const allowed = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowed.includes(ext)) {
        setError("Only audio files are allowed (.mp3, .wav, .ogg, .flac, .m4a, .aac)");
        setAudioFile(null);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be under 50MB");
        setAudioFile(null);
        return;
      }
      setError("");
      setAudioFile(file);
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (file) {
      const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".mov"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowed.includes(ext)) {
        setError("Only image/video files are allowed (.jpg, .png, .gif, .webp, .mp4, .webm, .mov)");
        setCoverFile(null);
        setCoverPreview(null);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("Cover file must be under 50MB");
        setCoverFile(null);
        setCoverPreview(null);
        return;
      }
      setError("");
      setCoverFile(file);
      const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      if (isImage) {
        const url = URL.createObjectURL(file);
        setCoverPreview(url);
      } else {
        setCoverPreview(null);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Title is required.");
    if (!genre.trim()) return setError("Genre is required.");
    if (!audioFile) return setError("Please select an audio file to upload.");
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
      formData.append("audioFile", audioFile);
      if (coverFile) formData.append("coverFile", coverFile);
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
        <div className="wrap" style={{ paddingTop: 60, maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <div style={{ color: "rgba(170,182,232,.6)", fontSize: 16 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 60, maxWidth: 420, margin: "0 auto" }}>
          <section className="panel" style={{ padding: 32, textAlign: "center" }}>
            <h2 style={{ color: "#6cf0ff", fontSize: 24, fontWeight: 700, marginBottom: 12 }} data-testid="text-upload-login-required">Sign In Required</h2>
            <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, marginBottom: 24 }}>You need to sign in to upload tracks.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <a href="/sign-in" style={{ padding: "10px 24px", background: "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)", borderRadius: 6, color: "#050615", fontWeight: 700, fontSize: 15, textDecoration: "none" }} data-testid="link-signin">Sign In</a>
              <a href="/sign-up" style={{ padding: "10px 24px", border: "1px solid rgba(108,240,255,.3)", borderRadius: 6, color: "#6cf0ff", fontWeight: 700, fontSize: 15, textDecoration: "none" }} data-testid="link-signup">Sign Up</a>
            </div>
          </section>
          <div style={{ paddingTop: 20, textAlign: "center" }}>
            <a href="/" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-back-home">&#8592; Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 60, maxWidth: 520, margin: "0 auto" }}>
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
              <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Electronic, Hip-Hop, Rock" style={inputStyle} required data-testid="input-track-genre" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Audio File *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.ogg,.flac,.m4a,.aac"
                onChange={handleFileChange}
                style={{ display: "none" }}
                data-testid="input-audio-file"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%",
                  padding: "20px 14px",
                  background: audioFile ? "rgba(108,240,255,.08)" : "rgba(255,255,255,.04)",
                  border: `2px dashed ${audioFile ? "rgba(108,240,255,.4)" : "rgba(108,240,255,.15)"}`,
                  borderRadius: 6,
                  color: audioFile ? "#6cf0ff" : "rgba(170,182,232,.5)",
                  fontSize: 14,
                  textAlign: "center",
                  cursor: "pointer",
                  boxSizing: "border-box" as const,
                  transition: "border-color 0.2s, background 0.2s",
                }}
                data-testid="button-choose-file"
              >
                {audioFile ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Music size={18} />
                    <span>{audioFile.name}</span>
                    <span style={{ color: "rgba(170,182,232,.5)", fontSize: 12 }}>({(audioFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                  </div>
                ) : (
                  <div>
                    <Music size={24} style={{ marginBottom: 6, opacity: 0.5 }} />
                    <div>Click to choose an audio file</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>MP3, WAV, OGG, FLAC, M4A, AAC (max 50MB)</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aab6e8", fontSize: 13, marginBottom: 6 }}>Cover Image or Video (optional)</label>
              <input
                ref={coverInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov"
                onChange={handleCoverChange}
                style={{ display: "none" }}
                data-testid="input-cover-file"
              />
              <div
                onClick={() => coverInputRef.current?.click()}
                style={{
                  width: "100%",
                  padding: "20px 14px",
                  background: coverFile ? "rgba(160,107,255,.08)" : "rgba(255,255,255,.04)",
                  border: `2px dashed ${coverFile ? "rgba(160,107,255,.4)" : "rgba(160,107,255,.15)"}`,
                  borderRadius: 6,
                  color: coverFile ? "#a06bff" : "rgba(170,182,232,.5)",
                  fontSize: 14,
                  textAlign: "center",
                  cursor: "pointer",
                  boxSizing: "border-box" as const,
                  transition: "border-color 0.2s, background 0.2s",
                }}
                data-testid="button-choose-cover"
              >
                {coverFile ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    {coverPreview && (
                      <img src={coverPreview} alt="Cover preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} data-testid="img-cover-preview" />
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Image size={18} />
                      <span>{coverFile.name}</span>
                      <span style={{ color: "rgba(170,182,232,.5)", fontSize: 12 }}>({(coverFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Image size={24} style={{ marginBottom: 6, opacity: 0.5 }} />
                    <div>Click to add a cover image or video</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>JPG, PNG, GIF, WEBP, MP4, WEBM, MOV (max 50MB)</div>
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
        <div style={{ paddingTop: 20, textAlign: "center" }}>
          <a href="/" style={{ color: "#6cf0ff", textDecoration: "none" }} data-testid="link-back-home">&#8592; Back to Home</a>
        </div>
      </div>
    </div>
  );
}
