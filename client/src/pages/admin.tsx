import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Music, Headphones, Heart, MessageCircle, UserPlus, Eye, BarChart3, Crown, TrendingUp } from "lucide-react";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

type AdminStats = {
  overview: {
    totalUsers: number;
    totalCreators: number;
    totalTracks: number;
    totalPlays: number;
    totalPlayEvents: number;
    totalLikes: number;
    totalComments: number;
    totalFollows: number;
    uniqueVisitors: number;
  };
  topTracksByPlays: { id: number; title: string; artist: string; plays: number }[];
  topTracksByLikes: { id: number; title: string; artist: string; likes: number; plays: number }[];
  creatorStats: { id: number; name: string; trackCount: number; totalPlays: number; totalLikes: number; followers: number }[];
  recentUsers: { id: number; name: string; email: string; creatorId: number | null }[];
};

function getUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem("hwm_user");
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function getHeaders(): Record<string, string> {
  const u = getUser();
  if (u) return { "x-user-id": String(u.id) };
  return {};
}

export default function Admin() {
  const [user] = useState<AuthUser | null>(getUser);

  const { data, isLoading, isError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { headers: getHeaders(), credentials: "include" });
      if (!res.ok) throw new Error("Access denied");
      return res.json();
    },
    enabled: !!user,
    retry: false,
  });

  if (!user) {
    return (
      <div className="hwm-app">
        <div className="bg-lines" />
        <div className="wrap" style={{ paddingTop: 60, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <section className="panel" style={{ padding: 32 }}>
            <h2 style={{ color: "#ff4fd8", fontSize: 20, fontWeight: 700 }} data-testid="text-admin-denied">Access Denied</h2>
            <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, marginTop: 12 }}>You must be signed in to access this page.</p>
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
        <div className="wrap" style={{ paddingTop: 60, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ color: "rgba(170,182,232,.6)", fontSize: 16 }}>Loading admin dashboard...</div>
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
            <h2 style={{ color: "#ff4fd8", fontSize: 20, fontWeight: 700 }} data-testid="text-admin-error">Access Denied</h2>
            <p style={{ color: "rgba(170,182,232,.6)", fontSize: 14, marginTop: 12 }}>You don't have permission to view this page.</p>
            <a href="/" style={{ display: "inline-block", marginTop: 20, padding: "10px 24px", background: "linear-gradient(135deg, #6cf0ff 0%, #a06bff 100%)", borderRadius: 6, color: "#050615", fontWeight: 700, fontSize: 14, textDecoration: "none" }} data-testid="link-go-home">Go Home</a>
          </section>
        </div>
      </div>
    );
  }

  const { overview } = data;

  const statBoxStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 130,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(108,240,255,.12)",
    borderRadius: 8,
    padding: "16px 12px",
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
    marginTop: 28,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const tableHeaderStyle: React.CSSProperties = {
    padding: "10px 14px",
    background: "rgba(108,240,255,.06)",
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(170,182,232,.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  };

  const cellStyle: React.CSSProperties = {
    padding: "10px 14px",
    borderTop: "1px solid rgba(108,240,255,.06)",
    fontSize: 14,
    color: "#eaf0ff",
  };

  return (
    <div className="hwm-app">
      <div className="bg-lines" />
      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#eaf0ff", display: "flex", alignItems: "center", gap: 10 }} data-testid="text-admin-title">
            <BarChart3 size={28} style={{ color: "#6cf0ff" }} />
            Admin Dashboard
          </h1>
          <a href="/" style={{ padding: "8px 16px", background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.2)", borderRadius: 6, color: "#6cf0ff", fontWeight: 600, fontSize: 13, textDecoration: "none" }} data-testid="link-admin-home">Home</a>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={statBoxStyle} data-testid="stat-total-users">
            <div style={labelStyle}><Users size={13} /> Users</div>
            <div style={valueStyle}>{overview.totalUsers}</div>
          </div>
          <div style={statBoxStyle} data-testid="stat-total-creators">
            <div style={labelStyle}><Crown size={13} /> Creators</div>
            <div style={valueStyle}>{overview.totalCreators}</div>
          </div>
          <div style={statBoxStyle} data-testid="stat-total-tracks">
            <div style={labelStyle}><Music size={13} /> Tracks</div>
            <div style={valueStyle}>{overview.totalTracks}</div>
          </div>
          <div style={statBoxStyle} data-testid="stat-unique-visitors">
            <div style={labelStyle}><Eye size={13} /> Visitors</div>
            <div style={valueStyle}>{overview.uniqueVisitors}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <div style={statBoxStyle} data-testid="stat-total-plays">
            <div style={labelStyle}><Headphones size={13} /> Total Plays</div>
            <div style={valueStyle}>{overview.totalPlays.toLocaleString()}</div>
          </div>
          <div style={statBoxStyle} data-testid="stat-total-likes">
            <div style={labelStyle}><Heart size={13} style={{ color: "#ff4fd8" }} /> Total Likes</div>
            <div style={valueStyle}>{overview.totalLikes}</div>
          </div>
          <div style={statBoxStyle} data-testid="stat-total-comments">
            <div style={labelStyle}><MessageCircle size={13} /> Comments</div>
            <div style={valueStyle}>{overview.totalComments}</div>
          </div>
          <div style={statBoxStyle} data-testid="stat-total-follows">
            <div style={labelStyle}><UserPlus size={13} /> Follows</div>
            <div style={valueStyle}>{overview.totalFollows}</div>
          </div>
        </div>

        <div style={sectionTitleStyle}>
          <TrendingUp size={18} style={{ color: "#6cf0ff" }} />
          Top Tracks by Plays
        </div>
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(108,240,255,.1)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 80px", ...tableHeaderStyle }}>
            <span>#</span>
            <span>Track</span>
            <span style={{ textAlign: "center" }}>Artist</span>
            <span style={{ textAlign: "right" }}>Plays</span>
          </div>
          {data.topTracksByPlays.map((track, i) => (
            <div key={track.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 80px", ...cellStyle }} data-testid={`row-top-plays-${track.id}`}>
              <span style={{ fontWeight: 700, color: i < 3 ? "#ffd700" : "rgba(170,182,232,.5)" }}>{i + 1}</span>
              <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</span>
              <span style={{ textAlign: "center", fontSize: 13, color: "rgba(170,182,232,.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.artist}</span>
              <span style={{ textAlign: "right", fontWeight: 700, color: "#6cf0ff" }}>{track.plays.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div style={sectionTitleStyle}>
          <Heart size={18} style={{ color: "#ff4fd8" }} />
          Top Tracks by Likes
        </div>
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(108,240,255,.1)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 80px", ...tableHeaderStyle }}>
            <span>#</span>
            <span>Track</span>
            <span style={{ textAlign: "center" }}>Artist</span>
            <span style={{ textAlign: "right" }}>Likes</span>
          </div>
          {data.topTracksByLikes.map((track, i) => (
            <div key={track.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 80px", ...cellStyle }} data-testid={`row-top-likes-${track.id}`}>
              <span style={{ fontWeight: 700, color: i < 3 ? "#ff4fd8" : "rgba(170,182,232,.5)" }}>{i + 1}</span>
              <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</span>
              <span style={{ textAlign: "center", fontSize: 13, color: "rgba(170,182,232,.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.artist}</span>
              <span style={{ textAlign: "right", fontWeight: 700, color: "#ff4fd8" }}>{track.likes}</span>
            </div>
          ))}
        </div>

        <div style={sectionTitleStyle}>
          <Crown size={18} style={{ color: "#a06bff" }} />
          Creator Stats
        </div>
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(108,240,255,.1)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px 60px 70px", ...tableHeaderStyle }}>
            <span>Creator</span>
            <span style={{ textAlign: "center" }}>Tracks</span>
            <span style={{ textAlign: "center" }}>Plays</span>
            <span style={{ textAlign: "center" }}>Likes</span>
            <span style={{ textAlign: "center" }}>Followers</span>
          </div>
          {data.creatorStats.map((c) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px 60px 70px", ...cellStyle }} data-testid={`row-creator-${c.id}`}>
              <a href={`/creator/${c.id}`} style={{ fontWeight: 600, color: "#eaf0ff", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</a>
              <span style={{ textAlign: "center" }}>{c.trackCount}</span>
              <span style={{ textAlign: "center", fontWeight: 700, color: "#6cf0ff" }}>{c.totalPlays.toLocaleString()}</span>
              <span style={{ textAlign: "center", fontWeight: 700, color: "#ff4fd8" }}>{c.totalLikes}</span>
              <span style={{ textAlign: "center" }}>{c.followers}</span>
            </div>
          ))}
        </div>

        <div style={sectionTitleStyle}>
          <Users size={18} style={{ color: "#6cf0ff" }} />
          Recent Sign-Ups
        </div>
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(108,240,255,.1)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", ...tableHeaderStyle }}>
            <span>ID</span>
            <span>Name</span>
            <span>Email</span>
          </div>
          {data.recentUsers.map((u) => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", ...cellStyle }} data-testid={`row-user-${u.id}`}>
              <span style={{ color: "rgba(170,182,232,.5)" }}>{u.id}</span>
              <span style={{ fontWeight: 600 }}>{u.name}</span>
              <span style={{ fontSize: 13, color: "rgba(170,182,232,.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <a href="/" style={{ display: "inline-block", padding: "10px 28px", background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.2)", borderRadius: 6, color: "#6cf0ff", fontWeight: 700, fontSize: 14, textDecoration: "none" }} data-testid="link-admin-back">Back to Home</a>
        </div>
      </div>
    </div>
  );
}
