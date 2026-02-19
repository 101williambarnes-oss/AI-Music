import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Track, type Creator } from "@shared/schema";
import { Menu } from "lucide-react";
import heroBg from "@assets/ChatGPT_Image_Feb_18,_2026,_05_26_22_PM_1771460797070.png";

const GENRE_GROUPS = [
  {
    name: "Pop",
    genres: ["Pop", "Dance Pop", "Indie Pop", "Electro Pop"],
  },
  {
    name: "Hip Hop",
    genres: ["Hip Hop", "Rap", "Trap"],
  },
  {
    name: "EDM",
    genres: ["EDM", "House", "Techno", "Trance", "Drum & Bass", "Dubstep", "Future Bass"],
  },
  {
    name: "Rock",
    genres: ["Rock", "Alt Rock", "Metal", "Industrial"],
  },
  {
    name: "Country",
    genres: ["Country", "Blues", "Americana"],
  },
  {
    name: "Cinematic",
    genres: ["Cinematic", "Orchestral", "Epic", "Soundtrack"],
  },
  {
    name: "Lo-Fi",
    genres: ["Lo-Fi", "Chillhop", "Study Beats"],
  },
  {
    name: "R&B",
    genres: ["R&B", "Neo-Soul", "Soul"],
  },
  {
    name: "Experimental",
    genres: ["Experimental", "Ambient", "Glitch", "Synthwave"],
  },
];

function formatPlays(plays: number) {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
}

function TrackRow({ track, showRank }: { track: Track; showRank?: boolean }) {
  return (
    <div
      className="row"
      data-testid={`track-row-${track.id}`}
    >
      <div className="thumb">
        {showRank && track.rank ? (
          <span className="rankBadge" data-testid={`text-rank-${track.rank}`}>#{track.rank}</span>
        ) : (
          <div className="play-btn">&#9654;</div>
        )}
      </div>
      <div className="meta">
        <div className="title" data-testid={`text-track-title-${track.id}`}>{track.title}</div>
        <div className="by" data-testid={`text-track-artist-${track.id}`}>{track.artist}</div>
      </div>
      <div className="stat" data-testid={`text-track-plays-${track.id}`}>{formatPlays(track.plays)}</div>
    </div>
  );
}

function TrackList({
  title,
  subtitle,
  tracks,
  showRank,
  tall,
  isLoading,
  testId,
}: {
  title: string;
  subtitle?: string;
  tracks: Track[];
  showRank?: boolean;
  tall?: boolean;
  isLoading?: boolean;
  testId?: string;
}) {
  return (
    <section className="panel">
      <div className={`list${tall ? " tall" : ""}`} data-testid={`list-${testId}`}>
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="row"
              style={{ height: 74, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
              data-testid={`skeleton-track-${i}`}
            />
          ))
        ) : tracks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(170,182,232,.6)" }} data-testid={`empty-${testId}`}>
            No tracks found
          </div>
        ) : (
          tracks.map((track) => (
            <TrackRow key={track.id} track={track} showRank={showRank} />
          ))
        )}
      </div>
    </section>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div className="creator" data-testid={`creator-card-${creator.id}`}>
      <div className="avatar" />
      <div>
        <div className="cname" data-testid={`text-creator-name-${creator.id}`}>{creator.name}</div>
        <div className="ctext" data-testid={`text-creator-tracks-${creator.id}`}>
          {creator.trackCount} New Track{creator.trackCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeGenre, setActiveGenre] = useState("EDM");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: trending = [], isLoading: trendingLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "trending"],
  });

  const { data: newSongs = [], isLoading: newSongsLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "new"],
  });

  const { data: topTracks = [], isLoading: topLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks", "top25"],
  });

  const { data: creators = [], isLoading: creatorsLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  const filteredTrending = searchQuery
    ? trending.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : trending;

  const filteredNew = searchQuery
    ? newSongs.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : newSongs;

  return (
    <div className="hwm-app">
      <div className="bg-lines" />

      <section className="hero" data-testid="section-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="topbar" data-testid="header-main" style={{ visibility: "hidden" }}>
          <div className="topbar-left">
            <button className="topbar-menu" data-testid="button-menu" aria-label="Menu">
              <Menu size={22} />
            </button>
            <div className="logo" data-testid="text-brand-name">HIT WAVE MEDIA</div>
          </div>
          <div className="topbar-actions">
            <button className="topbar-login" data-testid="link-creators-login">Creators Login</button>
            <button className="topbar-signup" data-testid="button-sign-up">Sign Up</button>
          </div>
        </div>

        <div className="heroContent" aria-hidden="true">
          <h1 className="heroTitle sr-only" data-testid="text-hero-title">HIT WAVE MEDIA</h1>
          <div className="heroSubtitle sr-only" data-testid="text-hero-subtitle">The Home of AI Music</div>
        </div>

        <div className="heroNav sr-only" aria-hidden="true" data-testid="nav-hero">
          <span data-testid="link-trending">Trending Now</span>
          <span data-testid="link-new-songs">New Songs of the Week</span>
          <span data-testid="link-top25">Top 25 This Week</span>
        </div>
      </section>

      <div className="wrap" data-testid="section-content">
        <div className="grid-layout">
          <aside className="explore-sounds" data-testid="sidebar-genres">
            <h3 className="explore-title" data-testid="panel-header-genres">Explore Sounds</h3>
            <nav aria-label="Genre navigation" data-testid="nav-genres">
              {GENRE_GROUPS.map((group) => (
                <div
                  key={group.name}
                  className="genre-group"
                  data-testid={`genre-group-${group.name.toLowerCase().replace(/[^a-z]/g, "-")}`}
                >
                  <div className="group-title">{group.name}</div>
                  <ul>
                    {group.genres.map((genre) => (
                      <li
                        key={genre}
                        className={activeGenre === genre ? "active" : ""}
                        onClick={() => setActiveGenre(genre)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={activeGenre === genre}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveGenre(genre); }}
                        data-testid={`button-genre-${genre.toLowerCase().replace(/[^a-z]/g, "-")}`}
                      >
                        {genre}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          <main className="stack" data-testid="section-main">
            <TrackList
              title="Trending Now"
              subtitle="scroll"
              tracks={filteredTrending}
              tall
              isLoading={trendingLoading}
              testId="trending"
            />
            <TrackList
              title="New Songs of the Week"
              subtitle="scroll"
              tracks={filteredNew}
              isLoading={newSongsLoading}
              testId="new-songs"
            />
          </main>

          <aside className="stack" data-testid="sidebar-right">
            <TrackList
              title="Top 25 This Week"
              subtitle="scroll"
              tracks={topTracks}
              showRank
              tall
              isLoading={topLoading}
              testId="top25"
            />
            <section className="panel">
              <div className="ph">
                <h3 data-testid="panel-header-creators">New Creators of the Week</h3>
                <div className="mini">scroll</div>
              </div>
              <div className="creators-grid" data-testid="list-creators">
                {creatorsLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="creator"
                      style={{ height: 62, opacity: 0.3, animation: "pulse 1.5s ease-in-out infinite" }}
                      data-testid={`skeleton-creator-${i}`}
                    />
                  ))
                ) : creators.length === 0 ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "32px 0", color: "rgba(170,182,232,.6)" }} data-testid="empty-creators">
                    No creators yet
                  </div>
                ) : (
                  creators.map((creator) => <CreatorCard key={creator.id} creator={creator} />)
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
