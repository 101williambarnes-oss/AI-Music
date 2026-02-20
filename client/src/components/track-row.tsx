import { type Track } from "@shared/schema";
import { useAudioPlayer } from "@/lib/audioPlayer";
import { TrackActions } from "@/components/track-actions";

function formatPlays(plays: number) {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
}

export function TrackRow({ track, showRank }: { track: Track; showRank?: boolean }) {
  const { currentTrackId, isPlaying, toggle } = useAudioPlayer();
  const isCurrentlyPlaying = currentTrackId === track.id && isPlaying;
  const hasAudio = !!track.fileUrl;

  return (
    <div data-testid={`track-row-${track.id}`}>
      <div className="row">
        <div className="thumb" style={{ position: "relative", overflow: "hidden" }}>
          {track.fileUrl && !showRank && track.fileUrl.match(/\.(mp4|webm|mov)$/i) ? (
            <video
              src={track.fileUrl}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
              muted
              loop
              autoPlay
              playsInline
              data-testid={`video-thumb-${track.id}`}
            />
          ) : track.fileUrl && !showRank && track.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img
              src={track.fileUrl}
              alt={track.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
              data-testid={`img-thumb-${track.id}`}
            />
          ) : null}
          {showRank && track.rank ? (
            <span className="rankBadge" data-testid={`text-rank-${track.rank}`}>#{track.rank}</span>
          ) : (
            <div
              className="play-btn"
              onClick={hasAudio ? () => toggle(track.id, track.fileUrl!) : undefined}
              style={{
                cursor: hasAudio ? "pointer" : "default",
                opacity: hasAudio ? 1 : 0.4,
                color: isCurrentlyPlaying ? "#ff4fd8" : undefined,
                position: "relative",
                zIndex: 1,
              }}
              data-testid={`button-play-${track.id}`}
            >
              {isCurrentlyPlaying ? "\u275A\u275A" : "\u25B6"}
            </div>
          )}
        </div>
        <div className="meta">
          <div className="title" data-testid={`text-track-title-${track.id}`}>{track.title}</div>
          <div className="by" data-testid={`text-track-artist-${track.id}`}>{track.artist}</div>
        </div>
        <div className="stat" data-testid={`text-track-plays-${track.id}`}>{formatPlays(track.plays)}</div>
      </div>
      <TrackActions track={track} />
    </div>
  );
}
