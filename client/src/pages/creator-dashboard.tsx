import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Headphones, Heart, Users, Flame, Trophy, TrendingUp, Clock } from "lucide-react";
import { PageNav } from "@/components/page-nav";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

type DashboardData = {
  thisWeek: { plays: number; likes: number; followers: number; rankStatus: string };
  performance: { mostPlayedTrack: { title: string; plays: number }; mostLikedTrack: { title: string; likes: number }; conversionRate: number };
  tracks: { id: number; title: string; plays: number; likes: number; status: string }[];
  motivation: { likesAwayFromTop25: number; inTop25: boolean };
  nextReset: { days: number; hours: number; minutes: number };
};

export default function CreatorDashboard() {
  const [, params] = useRoute("/creator/:id/dashboard");
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

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/creators", creatorId, "dashboard"],
    enabled: !!creatorId,
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

  if (!data) return null;

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
      <PageNav />
      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 60, maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: "#eaf0ff", marginBottom: 8 }} data-testid="text-dashboard-title">Creator Dashboard</h1>
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(170,182,232,.5)", marginBottom: 28 }}>{user?.name}</p>

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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 90px", padding: "10px 14px", background: "rgba(108,240,255,.06)", fontSize: 11, fontWeight: 700, color: "rgba(170,182,232,.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            <span>Track Name</span>
            <span style={{ textAlign: "center" }}>Plays</span>
            <span style={{ textAlign: "center" }}>Likes</span>
            <span style={{ textAlign: "center" }}>Status</span>
          </div>
          {data.tracks.map((track) => (
            <div key={track.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 90px", padding: "10px 14px", borderTop: "1px solid rgba(108,240,255,.06)", alignItems: "center" }} data-testid={`row-track-${track.id}`}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</span>
              <span style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: "#eaf0ff" }}>{track.plays}</span>
              <span style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: "#eaf0ff" }}>{track.likes}</span>
              <span style={{ textAlign: "center" }}>{getStatusBadge(track.status)}</span>
            </div>
          ))}
          {data.tracks.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: "rgba(170,182,232,.4)", fontSize: 14 }}>No tracks uploaded yet</div>
          )}
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

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a href={`/creator/${creatorId}`} style={{ display: "inline-block", padding: "10px 28px", background: "rgba(108,240,255,.08)", border: "1px solid rgba(108,240,255,.2)", borderRadius: 6, color: "#6cf0ff", fontWeight: 700, fontSize: 14, textDecoration: "none" }} data-testid="link-back-profile">Back to Profile</a>
        </div>
      </div>
    </div>
  );
}
