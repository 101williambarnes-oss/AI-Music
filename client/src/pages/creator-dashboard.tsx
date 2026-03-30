import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Headphones, Heart, Users, Flame, Trophy, TrendingUp, Clock, Disc3, Plus, MapPin, Check, ChevronDown, ChevronUp, X, Music, Download, ImagePlus } from "lucide-react";
import { type Album } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";


type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

type DashboardData = {
  thisWeek: { plays: number; likes: number; followers: number; rankStatus: string };
  performance: { mostPlayedTrack: { title: string; plays: number }; mostLikedTrack: { title: string; likes: number }; conversionRate: number };
  tracks: { id: number; title: string; plays: number; likes: number; status: string; fileUrl: string | null; coverUrl: string | null }[];
  motivation: { likesAwayFromTop25: number; inTop25: boolean };
  nextReset: { days: number; hours: number; minutes: number };
};

type AlbumWithCount = Album & { trackCount: number };

type SimpleTrack = { id: number; title: string };

function AlbumManagerCard({ album, creatorTracks, userId }: { album: AlbumWithCount; creatorTracks: SimpleTrack[]; userId: number }) {
  const [expanded, setExpanded] = useState(false);
  const [albumTracks, setAlbumTracks] = useState<SimpleTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  const loadAlbumTracks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/albums/${album.id}/tracks`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAlbumTracks(data);
      }
    } catch {}
    setLoading(false);
  }, [album.id]);

  useEffect(() => {
    if (expanded) loadAlbumTracks();
  }, [expanded, loadAlbumTracks]);

  const albumTrackIds = new Set(albumTracks.map(t => t.id));
  const availableTracks = creatorTracks.filter(t => !albumTrackIds.has(t.id));

  const [error, setError] = useState<string | null>(null);

  const addTrack = async (trackId: number) => {
    setAdding(true);
    setError(null);
    try {
      await apiRequest("POST", `/api/albums/${album.id}/tracks`, { trackId, userId });
      await loadAlbumTracks();
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
    } catch (e: any) {
      setError(e?.message || "Failed to add track");
    } finally {
      setAdding(false);
    }
  };

  const removeTrack = async (trackId: number) => {
    setRemoving(trackId);
    setError(null);
    try {
      await apiRequest("DELETE", `/api/albums/${album.id}/tracks/${trackId}`);
      await loadAlbumTracks();
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
    } catch (e: any) {
      setError(e?.message || "Failed to remove track");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(108,240,255,.08)", borderRadius: 8, overflow: "hidden" }} data-testid={`dashboard-album-${album.id}`}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", cursor: "pointer" }}
        data-testid={`button-expand-album-${album.id}`}
      >
        <div style={{ width: 48, height: 48, borderRadius: 6, overflow: "hidden", background: "rgba(160,107,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {album.coverUrl ? (
            <img src={album.coverUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Disc3 size={20} style={{ color: "rgba(160,107,255,.3)" }} />
          )}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.title}</div>
          <div style={{ fontSize: 11, color: "rgba(170,182,232,.4)" }}>{album.trackCount} track{album.trackCount !== 1 ? "s" : ""}</div>
        </div>
        {expanded ? <ChevronUp size={16} style={{ color: "rgba(170,182,232,.4)", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "rgba(170,182,232,.4)", flexShrink: 0 }} />}
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(108,240,255,.06)", padding: "12px 14px" }}>
          {loading ? (
            <div style={{ color: "rgba(170,182,232,.4)", fontSize: 13, textAlign: "center", padding: 8 }}>Loading tracks...</div>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#aab6e8", marginBottom: 8 }}>Songs in this album:</div>
              {albumTracks.length === 0 ? (
                <div style={{ color: "rgba(170,182,232,.3)", fontSize: 13, padding: "8px 0" }}>No songs added yet</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                  {albumTracks.map((track, i) => (
                    <div key={track.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, background: "rgba(255,255,255,.02)" }} data-testid={`album-track-${album.id}-${track.id}`}>
                      <span style={{ fontSize: 12, color: "rgba(170,182,232,.35)", width: 20, textAlign: "right", flexShrink: 0 }}>{i + 1}.</span>
                      <Music size={13} style={{ color: "rgba(160,107,255,.4)", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</span>
                      <button
                        onClick={() => removeTrack(track.id)}
                        disabled={removing === track.id}
                        style={{ background: "rgba(255,79,216,.08)", border: "1px solid rgba(255,79,216,.2)", borderRadius: 4, padding: "3px 8px", color: "#ff4fd8", fontSize: 11, fontWeight: 600, cursor: removing === track.id ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}
                        data-testid={`button-remove-track-${album.id}-${track.id}`}
                      >
                        <X size={11} /> {removing === track.id ? "..." : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {availableTracks.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6cf0ff", marginBottom: 8, marginTop: 4 }}>Add a song:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {availableTracks.map((track) => (
                      <div key={track.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, background: "rgba(108,240,255,.03)" }} data-testid={`available-track-${album.id}-${track.id}`}>
                        <Music size={13} style={{ color: "rgba(108,240,255,.3)", flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "rgba(234,240,255,.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</span>
                        <button
                          onClick={() => addTrack(track.id)}
                          disabled={adding}
                          style={{ background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.2)", borderRadius: 4, padding: "3px 10px", color: "#6cf0ff", fontSize: 11, fontWeight: 600, cursor: adding ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}
                          data-testid={`button-add-track-${album.id}-${track.id}`}
                        >
                          <Plus size={11} /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {error && (
                <div style={{ marginTop: 8, padding: "6px 10px", background: "rgba(255,79,216,.08)", border: "1px solid rgba(255,79,216,.2)", borderRadius: 6, color: "#ff4fd8", fontSize: 12, fontWeight: 600 }} data-testid={`album-error-${album.id}`}>{error}</div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <a
                  href={`/album/${album.id}`}
                  style={{ padding: "6px 14px", background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.2)", borderRadius: 6, color: "#6cf0ff", fontWeight: 600, fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                  data-testid={`button-view-album-${album.id}`}
                >
                  View Album Page
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

type DashboardTrack = DashboardData["tracks"][number];

function TrackManagerRow({ track, userId }: { track: DashboardTrack; userId: number }) {
  const [uploading, setUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState(track.coverUrl);
  const [coverMsg, setCoverMsg] = useState<string | null>(null);
  const fileInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) node.value = "";
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setCoverMsg(null);
    try {
      const formData = new FormData();
      formData.append("cover", file);
      formData.append("userId", String(userId));
      const res = await fetch(`/api/tracks/${track.id}/cover`, { method: "PATCH", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Upload failed");
      }
      const data = await res.json();
      setCoverUrl(data.coverUrl);
      setCoverMsg("Cover updated!");
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home-data"] });
      setTimeout(() => setCoverMsg(null), 3000);
    } catch (err: any) {
      setCoverMsg(err?.message || "Failed to upload cover");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(108,240,255,.06)" }} data-testid={`row-track-${track.id}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", background: "rgba(160,107,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {coverUrl ? (
            <img src={coverUrl} alt={track.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Music size={18} style={{ color: "rgba(160,107,255,.3)" }} />
          )}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</div>
          <div style={{ fontSize: 11, color: "rgba(170,182,232,.4)", display: "flex", gap: 10 }}>
            <span>{track.plays} plays</span>
            <span>{track.likes} likes</span>
            {track.status !== "-" && <span>{track.status}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
        {track.fileUrl && (
          <a
            href={`/api/tracks/${track.id}/download`}
            style={{ padding: "5px 12px", background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.2)", borderRadius: 6, color: "#6cf0ff", fontWeight: 600, fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
            data-testid={`button-download-track-${track.id}`}
          >
            <Download size={12} /> Download
          </a>
        )}
        <label
          style={{ padding: "5px 12px", background: "rgba(160,107,255,.08)", border: "1px solid rgba(160,107,255,.2)", borderRadius: 6, color: "#a06bff", fontWeight: 600, fontSize: 12, cursor: uploading ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
          data-testid={`button-cover-track-${track.id}`}
        >
          <ImagePlus size={12} /> {coverUrl ? "Change Cover" : "Add Cover"}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            ref={fileInputRef}
            style={{ display: "none" }}
            disabled={uploading}
          />
        </label>
        {uploading && <span style={{ fontSize: 11, color: "rgba(170,182,232,.4)" }}>Uploading...</span>}
        {coverMsg && <span style={{ fontSize: 11, color: coverMsg.includes("fail") || coverMsg.includes("Failed") ? "#ff4fd8" : "#4ade80", fontWeight: 600 }}>{coverMsg}</span>}
      </div>
    </div>
  );
}

export default function CreatorDashboard() {
  const [, params] = useRoute("/creator/:id/dashboard");
  const [, navigate] = useLocation();
  const creatorId = params?.id;
  const [user] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("hwm_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isOwner = user?.creatorId === Number(creatorId);
  const [locCity, setLocCity] = useState("");
  const [locState, setLocState] = useState("");
  const [locSaving, setLocSaving] = useState(false);
  const [locSaved, setLocSaved] = useState(false);

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["/api/creators", creatorId, "dashboard"],
    enabled: !!creatorId && isOwner,
  });

  const { data: creatorData } = useQuery<{ creator: any }>({
    queryKey: ["/api/creators", creatorId],
    enabled: !!creatorId,
  });

  useEffect(() => {
    if (creatorData?.creator) {
      setLocCity(creatorData.creator.city || "");
      setLocState(creatorData.creator.state || "");
    }
  }, [creatorData]);

  const { data: myAlbums = [] } = useQuery<AlbumWithCount[]>({
    queryKey: ["/api/creators", creatorId, "albums"],
    enabled: !!creatorId && isOwner,
  });

  const [liveTimer, setLiveTimer] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    function getNextSundayMidnight() {
      const now = new Date();
      const next = new Date(now);
      next.setDate(next.getDate() + (7 - next.getDay()));
      next.setHours(0, 0, 0, 0);
      return next;
    }

    function updateTimer() {
      const now = new Date();
      const target = getNextSundayMidnight();
      const ms = target.getTime() - now.getTime();
      if (ms <= 0) {
        setLiveTimer({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setLiveTimer({
        days: Math.floor(ms / (1000 * 60 * 60 * 24)),
        hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((ms % (1000 * 60)) / 1000),
      });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOwner) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 60, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <section className="panel" style={{ padding: 32 }}>
            <h2 style={{ color: "#ff4fd8", fontSize: 20, fontWeight: 700 }} data-testid="text-dashboard-denied">Access Denied</h2>
            <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, marginTop: 12 }}>You can only view your own dashboard.</p>
            <a href="/" style={{ display: "inline-block", marginTop: 20, padding: "10px 24px", background: "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)", borderRadius: 6, color: "#050615", fontWeight: 700, fontSize: 14, textDecoration: "none" }} data-testid="link-go-home">Go Home</a>
          </section>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 60, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ color: "rgba(170,182,232,.6)", fontSize: 16 }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 60, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <section className="panel" style={{ padding: 32 }}>
            <h2 style={{ color: "#ff4fd8", fontSize: 20, fontWeight: 700 }} data-testid="text-dashboard-error">Failed to load dashboard</h2>
            <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, marginTop: 12 }}>Something went wrong. Please try again.</p>
            <a href={`/creator/${creatorId}/dashboard`} style={{ display: "inline-block", marginTop: 20, padding: "10px 24px", background: "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)", borderRadius: 6, color: "#050615", fontWeight: 700, fontSize: 14, textDecoration: "none" }} data-testid="link-retry-dashboard">Retry</a>
          </section>
        </div>
      </div>
    );
  }

  const statBoxStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 100,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(108,240,255,.12)",
    borderRadius: 8,
    padding: "14px 10px",
    textAlign: "center",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: "rgba(170,182,232,.6)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 800,
    color: "#eaf0ff",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: "#aab6e8",
    marginBottom: 12,
    marginTop: 24,
  };

  function getStatusBadge(status: string) {
    if (status === "Trending") {
      return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: "rgba(255,140,0,.15)", color: "#ff8c00", border: "1px solid rgba(255,140,0,.3)" }} data-testid="badge-trending">Trending</span>;
    }
    if (status === "New") {
      return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: "rgba(108,240,255,.1)", color: "#6cf0ff", border: "1px solid rgba(108,240,255,.25)" }} data-testid="badge-new">New</span>;
    }
    return <span style={{ color: "rgba(170,182,232,.3)" }}>–</span>;
  }

  function getRankIcon(status: string) {
    if (status === "Trending") return <Flame size={18} style={{ color: "#ff8c00" }} />;
    if (status === "Top 25") return <Trophy size={18} style={{ color: "#ffd700" }} />;
    return null;
  }

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: "#eaf0ff", marginBottom: 4 }} data-testid="text-dashboard-title">Creator Dashboard</h1>
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(170,182,232,.5)", marginBottom: 8 }}>{user?.name}</p>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <a href={`/creator/${creatorId}`} style={{ display: "inline-block", padding: "8px 20px", background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.2)", borderRadius: 6, color: "#6cf0ff", fontWeight: 600, fontSize: 13, textDecoration: "none" }} data-testid="link-back-to-profile">Back to Profile</a>
        </div>

        <div style={{ ...statBoxStyle, marginBottom: 20, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <MapPin size={14} style={{ color: "#6cf0ff" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#aab6e8" }}>My Location</span>
            <span style={{ fontSize: 10, color: "rgba(170,182,232,.35)", marginLeft: 4 }}>DJ William Allen uses this when introducing your songs</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              value={locCity}
              onChange={(e) => { setLocCity(e.target.value); setLocSaved(false); }}
              placeholder="City (e.g. Saint George)"
              style={{ flex: 1, minWidth: 120, padding: "8px 12px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(108,240,255,.15)", borderRadius: 8, color: "#eaf0ff", fontSize: 13, outline: "none" }}
              data-testid="input-location-city"
            />
            <input
              type="text"
              value={locState}
              onChange={(e) => { setLocState(e.target.value); setLocSaved(false); }}
              placeholder="State (e.g. UT)"
              style={{ width: 80, padding: "8px 12px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(108,240,255,.15)", borderRadius: 8, color: "#eaf0ff", fontSize: 13, outline: "none" }}
              data-testid="input-location-state"
            />
            <button
              onClick={async () => {
                setLocSaving(true);
                try {
                  await apiRequest("PATCH", `/api/creators/${creatorId}/location`, { city: locCity.trim(), state: locState.trim() });
                  queryClient.invalidateQueries({ queryKey: ["/api/creators", creatorId] });
                  setLocSaved(true);
                  setTimeout(() => setLocSaved(false), 3000);
                } catch (err) {
                  console.error("Failed to save location:", err);
                } finally {
                  setLocSaving(false);
                }
              }}
              disabled={locSaving}
              style={{
                padding: "8px 16px", background: locSaved ? "rgba(74,222,128,.15)" : "rgba(108,240,255,.1)",
                border: locSaved ? "1px solid rgba(74,222,128,.3)" : "1px solid rgba(108,240,255,.2)",
                borderRadius: 8, color: locSaved ? "#4ade80" : "#6cf0ff", fontWeight: 700, fontSize: 12,
                cursor: locSaving ? "wait" : "pointer", whiteSpace: "nowrap" as const,
              }}
              data-testid="button-save-location"
            >
              {locSaving ? "Saving..." : locSaved ? <><Check size={12} /> Saved</> : "Save"}
            </button>
          </div>
        </div>

        <div style={sectionTitleStyle}>This Week:</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={statBoxStyle} data-testid="stat-plays">
            <div style={labelStyle}><Headphones size={13} /> Plays</div>
            <div style={valueStyle}>{data.thisWeek.plays}</div>
          </div>
          <div style={statBoxStyle} data-testid="stat-likes">
            <div style={labelStyle}><Heart size={13} style={{ color: "#ff4fd8" }} /> Likes</div>
            <div style={valueStyle}>{data.thisWeek.likes}</div>
          </div>
          <div style={statBoxStyle} data-testid="stat-followers">
            <div style={labelStyle}><Users size={13} /> Followers</div>
            <div style={valueStyle}>{data.thisWeek.followers}</div>
          </div>
          <div style={statBoxStyle} data-testid="stat-rank">
            <div style={labelStyle}>Rank Status:</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#eaf0ff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {getRankIcon(data.thisWeek.rankStatus)}
              {data.thisWeek.rankStatus}
            </div>
          </div>
        </div>

        <div style={sectionTitleStyle}>Performance Overview:</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ ...statBoxStyle, textAlign: "left", padding: "14px 16px" }} data-testid="stat-most-played">
            <div style={{ fontSize: 11, color: "rgba(170,182,232,.5)", fontWeight: 600, marginBottom: 4 }}>Most Played Track:</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#eaf0ff" }}>{data.performance.mostPlayedTrack.title}</div>
            <div style={{ fontSize: 12, color: "rgba(170,182,232,.4)" }}>({data.performance.mostPlayedTrack.plays} Plays)</div>
          </div>
          <div style={{ ...statBoxStyle, textAlign: "left", padding: "14px 16px" }} data-testid="stat-most-liked">
            <div style={{ fontSize: 11, color: "rgba(170,182,232,.5)", fontWeight: 600, marginBottom: 4 }}>Most Liked Track:</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#eaf0ff" }}>{data.performance.mostLikedTrack.title}</div>
            <div style={{ fontSize: 12, color: "rgba(170,182,232,.4)" }}>({data.performance.mostLikedTrack.likes} Likes)</div>
          </div>
          <div style={{ ...statBoxStyle, textAlign: "center", padding: "14px 16px" }} data-testid="stat-conversion">
            <div style={{ fontSize: 11, color: "rgba(170,182,232,.5)", fontWeight: 600, marginBottom: 4 }}>Like Conversion Rate:</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#6cf0ff" }}>{data.performance.conversionRate}%</div>
          </div>
        </div>

        <div style={sectionTitleStyle}>Your Tracks:</div>
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(108,240,255,.1)", borderRadius: 8, overflow: "hidden" }}>
          {data.tracks.map((track) => (
            <TrackManagerRow key={track.id} track={track} userId={user!.id} />
          ))}
          {data.tracks.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: "rgba(170,182,232,.4)", fontSize: 14 }}>No tracks uploaded yet</div>
          )}
        </div>

        <div style={sectionTitleStyle}>
          <Disc3 size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
          Your Albums
        </div>
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(108,240,255,.1)", borderRadius: 8, padding: "16px 20px", marginBottom: 8 }}>
          {myAlbums.length === 0 ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ color: "rgba(170,182,232,.4)", fontSize: 14, marginBottom: 12 }}>No albums yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {myAlbums.map((album) => (
                <AlbumManagerCard
                  key={album.id}
                  album={album}
                  creatorTracks={data.tracks.map(t => ({ id: t.id, title: t.title }))}
                  userId={user!.id}
                />
              ))}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <a
              href="/create-album"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 20px", background: "linear-gradient(135deg, #a06bff 0%, #ff4fd8 100%)", borderRadius: 20, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
              data-testid="button-create-album"
            >
              <Plus size={14} /> Create New Album
            </a>
          </div>
        </div>

        <div style={{ marginTop: 24, background: "rgba(255,255,255,.03)", border: "1px solid rgba(108,240,255,.1)", borderRadius: 8, padding: "16px 20px" }} data-testid="section-motivation">
          {!data.motivation.inTop25 && data.motivation.likesAwayFromTop25 > 0 && (
            <div style={{ fontSize: 15, fontWeight: 700, color: "#eaf0ff", marginBottom: 8 }}>
              <TrendingUp size={16} style={{ display: "inline", marginRight: 6, color: "#6cf0ff", verticalAlign: "middle" }} />
              You're {data.motivation.likesAwayFromTop25} like{data.motivation.likesAwayFromTop25 !== 1 ? "s" : ""} away from the Top 25!
            </div>
          )}
          {data.motivation.inTop25 && (
            <div style={{ fontSize: 15, fontWeight: 700, color: "#ffd700", marginBottom: 8 }}>
              <Trophy size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              You're in the Top 25! Keep it up!
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: "center", background: "rgba(255,255,255,.04)", border: "1px solid rgba(108,240,255,.12)", borderRadius: 8, padding: "18px 20px" }} data-testid="section-reset-timer">
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(170,182,232,.7)", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Clock size={15} /> Next Top 25 Reset:
          </div>
          <div style={{ fontSize: 11, color: "rgba(170,182,232,.4)", marginBottom: 12 }}>
            Midnight Sunday Night
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <div>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#6cf0ff" }} data-testid="text-timer-days">{liveTimer?.days ?? data.nextReset.days}</span>
              <span style={{ fontSize: 12, color: "rgba(170,182,232,.5)", marginLeft: 4 }}>Days</span>
            </div>
            <div>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#6cf0ff" }} data-testid="text-timer-hours">{liveTimer?.hours ?? data.nextReset.hours}</span>
              <span style={{ fontSize: 12, color: "rgba(170,182,232,.5)", marginLeft: 4 }}>Hrs</span>
            </div>
            <div>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#6cf0ff" }} data-testid="text-timer-minutes">{liveTimer?.minutes ?? data.nextReset.minutes}</span>
              <span style={{ fontSize: 12, color: "rgba(170,182,232,.5)", marginLeft: 4 }}>Min</span>
            </div>
            <div>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#ff4fd8" }} data-testid="text-timer-seconds">{liveTimer?.seconds ?? 0}</span>
              <span style={{ fontSize: 12, color: "rgba(170,182,232,.5)", marginLeft: 4 }}>Sec</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
