import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Track, type Comment } from "@shared/schema";
import { Heart, MessageCircle, Send } from "lucide-react";

type AuthUser = { id: number; name: string; email: string; creatorId: number | null };

function getUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem("hwm_user");
    return stored ? JSON.parse(stored) as AuthUser : null;
  } catch { return null; }
}

export function TrackActions({ track }: { track: Track }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const qc = useQueryClient();
  const user = getUser();

  const { data: likeData } = useQuery<{ count: number; liked: boolean }>({
    queryKey: ["/api/tracks", String(track.id), "likes"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (user) headers["x-user-id"] = String(user.id);
      const res = await fetch(`/api/tracks/${track.id}/likes`, { headers, credentials: "include" });
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
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["x-user-id"] = String(user.id);
      const res = await fetch(`/api/tracks/${track.id}/likes`, { method: "POST", headers, credentials: "include" });
      if (!res.ok) throw new Error("Failed to toggle like");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tracks", String(track.id), "likes"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["x-user-id"] = String(user.id);
      const res = await fetch(`/api/tracks/${track.id}/comments`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      qc.invalidateQueries({ queryKey: ["/api/tracks", String(track.id), "comments"] });
    },
  });

  return (
    <div className="track-actions-wrap">
      <div className="track-actions" data-testid={`track-actions-${track.id}`}>
        <button
          className={`action-btn like-btn hover-elevate${likeData?.liked ? " liked" : ""}`}
          onClick={() => user && likeMutation.mutate()}
          disabled={!user}
          title={user ? (likeData?.liked ? "Unlike" : "Like") : "Sign in to like"}
          data-testid={`button-like-${track.id}`}
        >
          <Heart style={{ width: 14, height: 14, fill: likeData?.liked ? "#ff4fd8" : "none", stroke: likeData?.liked ? "#ff4fd8" : "currentColor" }} />
          <span data-testid={`text-like-count-${track.id}`}>{likeData?.count ?? 0}</span>
        </button>
        <button
          className={`action-btn comment-btn hover-elevate${showComments ? " active" : ""}`}
          onClick={() => setShowComments(!showComments)}
          title="Comments"
          data-testid={`button-comments-${track.id}`}
        >
          <MessageCircle style={{ width: 14, height: 14 }} />
          <span data-testid={`text-comment-count-${track.id}`}>{showComments ? commentsData.length : ""}</span>
        </button>
      </div>
      {showComments && (
        <div className="comments-section" data-testid={`comments-section-${track.id}`}>
          {user && (
            <div className="comment-input-row" data-testid={`comment-input-row-${track.id}`}>
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
          )}
          {!user && (
            <div className="comment-signin-hint" data-testid={`text-signin-hint-${track.id}`}>
              <a href="/sign-in">Sign in</a> to leave a comment
            </div>
          )}
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
