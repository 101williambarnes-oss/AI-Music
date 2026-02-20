import { useRef, useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track } from "@shared/schema";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { TrackActions } from "@/components/track-actions";
import { VideoModal } from "@/components/video-modal";
import { Heart, Play as PlayIcon } from "lucide-react";

function formatPlays(plays: number) {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
}

function getVisitorId(): string {
  let vid = localStorage.getItem("hwm_visitor_id");
  if (!vid) {
    vid = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("hwm_visitor_id", vid);
  }
  return vid;
}

function getHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem("hwm_user");
    if (stored) {
      const u = JSON.parse(stored);
      if (u?.id) return { "x-user-id": String(u.id) };
    }
  } catch {}
  return { "x-visitor-id": getVisitorId() };
}

export function TrackRow({ track, showRank }: { track: Track; showRank?: boolean }) {
  const { currentTrackId, isPlaying, toggle, play } = useAudioPlayer();
  const isCurrentlyPlaying = currentTrackId === track.id && isPlaying;
  const hasAudio = !!track.fileUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = !!track.fileUrl && /\.(mp4|webm|mov)$/i.test(track.fileUrl);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const wantModalRef = useRef(false);

  const { data: likeData } = useQuery<{ count: number; liked: boolean }>({
    queryKey: ["/api/tracks", String(track.id), "likes", "row"],
    queryFn: async () => {
      const res = await fetch(`/api/tracks/${track.id}/likes`, { headers: getHeaders(), credentials: "include" });
      return res.json();
    },
  });

  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    if (isCurrentlyPlaying && !showVideoModal) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isCurrentlyPlaying, isVideo, showVideoModal]);

  useEffect(() => {
    if (wantModalRef.current && isPlaying && currentTrackId === track.id) {
      wantModalRef.current = false;
      setShowVideoModal(true);
    }
  }, [isPlaying, currentTrackId, track.id]);

  const handleRowClick = useCallback(() => {
    if (!hasAudio) return;
    if (isVideo) {
      wantModalRef.current = true;
      play(track.id, track.fileUrl!);
      setShowVideoModal(true);
    } else {
      toggle(track.id, track.fileUrl!);
    }
  }, [hasAudio, isVideo, track.id, track.fileUrl, play, toggle]);

  function handleModalClose() {
    wantModalRef.current = false;
    setShowVideoModal(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }

  return (
    <div data-testid={`track-row-${track.id}`}>
      <div className="row" onClick={handleRowClick} style={{ cursor: hasAudio ? "pointer" : "default" }} data-testid={`button-play-${track.id}`}>
        <div className="thumb" style={{ position: "relative", overflow: "hidden", flexShrink: 0, width: 54, height: 54 }}>
          {isVideo && !showRank ? (
            <video
              ref={videoRef}
              src={track.fileUrl!}
              style={{ width: 54, height: 54, objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
              muted
              loop
              playsInline
              data-testid={`video-thumb-${track.id}`}
            />
          ) : track.fileUrl && !showRank && /\.(jpg|jpeg|png|gif|webp)$/i.test(track.fileUrl) ? (
            <img
              src={track.fileUrl}
              alt={track.title}
              style={{ width: 54, height: 54, objectFit: "cover", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
              data-testid={`img-thumb-${track.id}`}
            />
          ) : null}
          {showRank && track.rank ? (
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {isCurrentlyPlaying ? (
                <span style={{ color: "#ff4fd8", fontSize: "1.2rem" }}>{"\u275A\u275A"}</span>
              ) : (
                <span className="rankBadge" data-testid={`text-rank-${track.rank}`}>#{track.rank}</span>
              )}
            </div>
          ) : (
            <div
              className="play-btn"
              style={{
                opacity: hasAudio ? 1 : 0.4,
                color: isCurrentlyPlaying ? "#ff4fd8" : undefined,
                position: "relative",
                zIndex: 1,
              }}
            >
              {isCurrentlyPlaying ? "\u275A\u275A" : "\u25B6"}
            </div>
          )}
        </div>
        <div className="meta">
          <div className="title" data-testid={`text-track-title-${track.id}`}>{track.title}</div>
          <div className="by" data-testid={`text-track-artist-${track.id}`}>{track.artist}</div>
        </div>
        <div className="row-stats" data-testid={`stats-${track.id}`}>
          <span className="row-stat" data-testid={`text-track-plays-${track.id}`}>
            <PlayIcon style={{ width: 12, height: 12 }} />
            {formatPlays(track.plays)}
          </span>
          <span className="row-stat row-stat-likes" data-testid={`text-row-likes-${track.id}`}>
            <Heart style={{ width: 12, height: 12, fill: (likeData?.count ?? 0) > 0 ? "#ff4fd8" : "none", stroke: (likeData?.count ?? 0) > 0 ? "#ff4fd8" : "currentColor" }} />
            {likeData?.count ?? 0}
          </span>
        </div>
      </div>
      <TrackActions track={track} />
      {showVideoModal && isVideo && (
        <VideoModal track={track} onClose={handleModalClose} />
      )}
    </div>
  );
}
