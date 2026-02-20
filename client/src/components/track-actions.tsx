import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Track, type Comment } from "@shared/schema";
import { Heart, MessageCircle, Send, Play, Share2, X, Copy, Check } from "lucide-react";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

function getUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem("hwm_user");
    return stored ? JSON.parse(stored) as AuthUser : null;
  } catch { return null; }
}

function getVisitorId(): string {
  let vid = localStorage.getItem("hwm_visitor_id");
  if (!vid) {
    vid = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("hwm_visitor_id", vid);
  }
  return vid;
}

function getVisitorName(): string {
  return localStorage.getItem("hwm_visitor_name") || "";
}

function setVisitorName(name: string) {
  localStorage.setItem("hwm_visitor_name", name);
}

function getHeaders(): Record<string, string> {
  const u = getUser();
  const headers: Record<string, string> = {};
  if (u) {
    headers["x-user-id"] = String(u.id);
  } else {
    headers["x-visitor-id"] = getVisitorId();
  }
  return headers;
}

function formatPlays(plays: number) {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
}

export function TrackActions({ track, hideComments }: { track: Track; hideComments?: boolean }) {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [nameText, setNameText] = useState(getVisitorName());
  const [user, setUser] = useState<AuthUser | null>(getUser);
  const qc = useQueryClient();

  useEffect(() => {
    const check = () => setUser(getUser());
    window.addEventListener("storage", check);
    const interval = setInterval(check, 1000);
    return () => {
      window.removeEventListener("storage", check);
      clearInterval(interval);
    };
  }, []);

  const identKey = user ? `u${user.id}` : getVisitorId();

  const { data: likeData } = useQuery<{ count: number; liked: boolean }>({
    queryKey: ["/api/tracks", String(track.id), "likes", identKey],
    queryFn: async () => {
      const res = await fetch(`/api/tracks/${track.id}/likes`, { headers: getHeaders(), credentials: "include" });
      return res.json();
    },
  });

  const { data: commentCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/tracks", String(track.id), "comments", "count"],
    queryFn: async () => {
      const res = await fetch(`/api/tracks/${track.id}/comments/count`, { credentials: "include" });
      return res.json();
    },
  });

  const { data: commentsData = [] } = useQuery<Comment[]>({
    queryKey: ["/api/tracks", String(track.id), "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/tracks/${track.id}/comments`, { credentials: "include" });
      return res.json();
    },
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const headers: Record<string, string> = { "Content-Type": "application/json", ...getHeaders() };
      const res = await fetch(`/api/tracks/${track.id}/likes`, { method: "POST", headers, credentials: "include" });
      if (!res.ok) throw new Error("Failed to toggle like");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as string[];
          if (key[0] === "/api/tracks" && key[1] === String(track.id) && key[2] === "likes") return true;
          if (key[0] === "/api/tracks" && key[1] === "top25") return true;
          return false;
        },
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      const headers: Record<string, string> = { "Content-Type": "application/json", ...getHeaders() };
      const body: any = { text };
      if (!user && nameText.trim()) {
        body.visitorName = nameText.trim();
        setVisitorName(nameText.trim());
      }
      const res = await fetch(`/api/tracks/${track.id}/comments`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      qc.invalidateQueries({ queryKey: ["/api/tracks", String(track.id), "comments"] });
      qc.invalidateQueries({ queryKey: ["/api/tracks", String(track.id), "comments", "count"] });
    },
  });

  return (
    <div className="track-actions-wrap">
      <div className="track-actions" data-testid={`track-actions-${track.id}`}>
        <span className="action-stat" title="Plays" data-testid={`text-track-plays-${track.id}`}>
          <Play style={{ width: 13, height: 13, fill: "currentColor" }} />
          {formatPlays(track.plays)}
        </span>
        <button
          className={`action-btn like-btn hover-elevate${likeData?.liked ? " liked" : ""}`}
          onClick={() => likeMutation.mutate()}
          title={likeData?.liked ? "Unlike" : "Like"}
          data-testid={`button-like-${track.id}`}
        >
          <Heart style={{ width: 14, height: 14, fill: likeData?.liked ? "#ff4fd8" : "none", stroke: likeData?.liked ? "#ff4fd8" : "currentColor" }} />
          <span data-testid={`text-like-count-${track.id}`}>{likeData?.count ?? 0}</span>
        </button>
        {!hideComments && (
          <button
            className={`action-btn comment-btn hover-elevate${showComments ? " active" : ""}`}
            onClick={() => setShowComments(!showComments)}
            title="Comments"
            data-testid={`button-comments-${track.id}`}
          >
            <MessageCircle style={{ width: 14, height: 14 }} />
            <span data-testid={`text-comment-count-${track.id}`}>{commentCountData?.count ?? 0}</span>
          </button>
        )}
        <button
          className={`action-btn share-btn hover-elevate${showShare ? " active" : ""}`}
          onClick={() => { setShowShare(!showShare); setCopied(false); }}
          title="Share"
          data-testid={`button-share-${track.id}`}
        >
          <Share2 style={{ width: 14, height: 14 }} />
        </button>
      </div>
      {showShare && (
        <ShareDropdown track={track} onClose={() => setShowShare(false)} copied={copied} setCopied={setCopied} />
      )}
      {!hideComments && showComments && (
        <div className="comments-section" data-testid={`comments-section-${track.id}`}>
          <div className="comment-input-row" data-testid={`comment-input-row-${track.id}`}>
            {!user && (
              <input
                type="text"
                placeholder="Your name (optional)"
                value={nameText}
                onChange={(e) => setNameText(e.target.value)}
                style={{ maxWidth: 120 }}
                data-testid={`input-visitor-name-${track.id}`}
              />
            )}
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && commentText.trim()) {
                  commentMutation.mutate(commentText.trim());
                }
              }}
              data-testid={`input-comment-${track.id}`}
            />
            <button
              onClick={() => commentText.trim() && commentMutation.mutate(commentText.trim())}
              disabled={!commentText.trim() || commentMutation.isPending}
              data-testid={`button-submit-comment-${track.id}`}
            >
              <Send style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div className="comments-list" data-testid={`comments-list-${track.id}`}>
            {commentsData.length === 0 ? (
              <div className="no-comments" data-testid={`text-no-comments-${track.id}`}>No comments yet</div>
            ) : (
              commentsData.map((c) => (
                <div key={c.id} className="comment-item" data-testid={`comment-item-${c.id}`}>
                  <div className="comment-header">
                    <span className="comment-author" data-testid={`text-comment-author-${c.id}`}>{c.userName}</span>
                    <span className="comment-time" data-testid={`text-comment-time-${c.id}`}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="comment-text" data-testid={`text-comment-text-${c.id}`}>{c.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ShareDropdown({ track, onClose, copied, setCopied }: { track: Track; onClose: () => void; copied: boolean; setCopied: (v: boolean) => void }) {
  const shareUrl = track.creatorId
    ? `${window.location.origin}/creator/${track.creatorId}`
    : window.location.origin;
  const shareText = `Check out "${track.title}" by ${track.artist} on Hit Wave Media!`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const socials = [
    {
      name: "X (Twitter)",
      color: "#1da1f2",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      testId: "twitter",
    },
    {
      name: "Facebook",
      color: "#1877f2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      testId: "facebook",
    },
    {
      name: "WhatsApp",
      color: "#25d366",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      testId: "whatsapp",
    },
    {
      name: "TikTok",
      color: "#fe2c55",
      url: `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      testId: "tiktok",
    },
    {
      name: "Reddit",
      color: "#ff4500",
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      testId: "reddit",
    },
    {
      name: "Email",
      color: "#6cf0ff",
      url: `mailto:?subject=${encodeURIComponent(`Check out ${track.title} on Hit Wave Media`)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
      testId: "email",
    },
  ];

  return (
    <div className="share-dropdown" data-testid={`share-dropdown-${track.id}`}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6cf0ff", letterSpacing: 0.5 }}>Share this track</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "rgba(170,182,232,.5)", cursor: "pointer", padding: 2, display: "flex" }}
          data-testid={`button-close-share-${track.id}`}
        >
          <X size={14} />
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {socials.map((s) => (
          <a
            key={s.testId}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 10px",
              borderRadius: 6,
              background: "rgba(108,240,255,.06)",
              border: "1px solid rgba(108,240,255,.12)",
              color: s.color,
              textDecoration: "none",
              fontSize: "0.75rem",
              fontWeight: 600,
              transition: "background .2s",
            }}
            data-testid={`button-share-${s.testId}-${track.id}`}
          >
            {s.name}
          </a>
        ))}
      </div>
      <button
        onClick={copyLink}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "7px 10px",
          borderRadius: 6,
          background: copied ? "rgba(108,240,255,.15)" : "rgba(108,240,255,.06)",
          border: `1px solid ${copied ? "rgba(108,240,255,.3)" : "rgba(108,240,255,.12)"}`,
          color: copied ? "#6cf0ff" : "rgba(170,182,232,.8)",
          cursor: "pointer",
          fontSize: "0.75rem",
          fontWeight: 600,
          transition: "all .2s",
        }}
        data-testid={`button-copy-link-${track.id}`}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Link copied!" : "Copy link"}
      </button>
    </div>
  );
}
