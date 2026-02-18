import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Play, ChevronDown, ChevronUp, Music, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Track, type Creator } from "@shared/schema";

const GENRE_GROUPS = [
  {
    name: "Electronic",
    genres: ["EDM", "House", "Techno", "Trance", "Drum & Bass", "Dubstep", "Future Bass", "Synthwave", "Chillstep"],
  },
  {
    name: "Hip Hop & R&B",
    genres: ["Hip Hop", "Rap", "Trap", "R&B", "Neo-Soul"],
  },
  {
    name: "Pop & More",
    genres: ["Pop", "Dance Pop", "Indie Pop", "Electro Pop"],
  },
  {
    name: "Rock & Metal",
    genres: ["Rock", "Alt Rock", "Metal", "Industrial"],
  },
  {
    name: "Chill & Instrumental",
    genres: ["Lo-Fi", "Ambient", "Instrumental", "Cinematic", "Piano"],
  },
  {
    name: "Roots & Other",
    genres: ["Country", "Blues", "Jazz", "Reggae", "Experimental"],
  },
];

function TrackThumb({ trackId }: { trackId: number }) {
  const gradients = [
    "radial-gradient(circle at 30% 30%, rgba(108,240,255,.8), rgba(160,107,255,.35) 55%, rgba(255,79,216,.25))",
    "radial-gradient(circle at 40% 25%, rgba(255,79,216,.7), rgba(108,240,255,.35) 55%, rgba(160,107,255,.25))",
    "radial-gradient(circle at 35% 35%, rgba(160,107,255,.8), rgba(255,79,216,.35) 55%, rgba(108,240,255,.25))",
  ];
  return (
    <div
      className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0"
      style={{
        background: gradients[trackId % gradients.length],
        border: "1px solid rgba(162,106,255,.18)",
        boxShadow: "0 0 18px rgba(108,240,255,.10)",
      }}
    >
      <div
        className="w-[26px] h-[26px] rounded-full flex items-center justify-center"
        style={{
          background: "rgba(7,10,20,.55)",
          border: "1px solid rgba(234,240,255,.18)",
        }}
      >
        <Play className="w-3 h-3 fill-current ml-0.5" style={{ color: "rgba(234,240,255,.9)" }} />
      </div>
    </div>
  );
}

function RankThumb({ rank }: { rank: number }) {
  return (
    <div
      className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center shrink-0"
      style={{
        background: "radial-gradient(circle at 30% 30%, rgba(108,240,255,.8), rgba(160,107,255,.35) 55%, rgba(255,79,216,.25))",
        border: "1px solid rgba(162,106,255,.18)",
        boxShadow: "0 0 18px rgba(108,240,255,.10)",
      }}
    >
      <span className="font-black text-sm" style={{ color: "rgba(234,240,255,.95)" }} data-testid={`text-rank-${rank}`}>
        #{rank}
      </span>
    </div>
  );
}

function PanelHeader({ title, subtitle, testId }: { title: string; subtitle?: string; testId?: string }) {
  return (
    <div
      className="px-3.5 py-3 flex items-center justify-between gap-2 flex-wrap"
      style={{
        borderBottom: "1px solid rgba(108,240,255,.10)",
        background: "rgba(15,20,40,.35)",
      }}
      data-testid={testId}
    >
      <h3 className="text-base font-semibold tracking-wide" style={{ color: "rgba(234,240,255,.92)" }}>
        {title}
      </h3>
      {subtitle && (
        <span className="text-xs" style={{ color: "rgba(170,182,232,.75)" }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[16px] overflow-hidden ${className || ""}`}
      style={{
        background: "rgba(15,20,40,.72)",
        border: "1px solid rgba(162,106,255,.18)",
        boxShadow: "0 0 30px rgba(108,240,255,.06)",
      }}
    >
      {children}
    </div>
  );
}

function GenreSidebar({ activeGenre, onGenreSelect }: { activeGenre: string; onGenreSelect: (g: string) => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (name: string) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <Panel>
      <PanelHeader title="Explore Sounds" subtitle="Genres" testId="panel-header-genres" />
      <ScrollArea className="max-h-[610px]">
        <nav className="p-2.5" aria-label="Genre navigation" data-testid="nav-genres">
          {GENRE_GROUPS.map((group) => (
            <div
              key={group.name}
              className="my-2.5 rounded-[14px] overflow-hidden"
              style={{
                border: "1px solid rgba(108,240,255,.10)",
                background: "rgba(15,20,40,.35)",
              }}
              data-testid={`genre-group-${group.name.toLowerCase().replace(/[^a-z]/g, "-")}`}
            >
              <button
                onClick={() => toggleGroup(group.name)}
                aria-expanded={!collapsed[group.name]}
                aria-label={`Toggle ${group.name} genres`}
                className="w-full px-3 py-2.5 font-black flex items-center justify-between text-left"
                style={{
                  color: "rgba(108,240,255,.95)",
                  borderBottom: collapsed[group.name] ? "none" : "1px solid rgba(108,240,255,.08)",
                }}
                data-testid={`button-toggle-${group.name.toLowerCase().replace(/[^a-z]/g, "-")}`}
              >
                <span>{group.name}</span>
                {collapsed[group.name] ? (
                  <ChevronDown className="w-4 h-4 opacity-70" />
                ) : (
                  <ChevronUp className="w-4 h-4 opacity-70" />
                )}
              </button>
              {!collapsed[group.name] && (
                <div className="px-2 py-2 flex flex-col gap-1.5" role="list">
                  {group.genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => onGenreSelect(genre)}
                      role="listitem"
                      aria-pressed={activeGenre === genre}
                      className="px-2.5 py-2 rounded-[12px] text-left text-sm transition-all duration-150"
                      style={{
                        color: "rgba(234,240,255,.90)",
                        border:
                          activeGenre === genre
                            ? "1px solid rgba(255,79,216,.35)"
                            : "1px solid transparent",
                        background:
                          activeGenre === genre
                            ? "linear-gradient(135deg, rgba(160,107,255,.20), rgba(255,79,216,.12))"
                            : "rgba(255,255,255,.02)",
                        boxShadow:
                          activeGenre === genre
                            ? "0 0 18px rgba(255,79,216,.10)"
                            : "none",
                      }}
                      data-testid={`button-genre-${genre.toLowerCase().replace(/[^a-z]/g, "-")}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </Panel>
  );
}

function TrackRow({ track, showRank }: { track: Track; showRank?: boolean }) {
  const formatPlays = (plays: number) => {
    if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
    return plays.toString();
  };

  return (
    <div
      className="grid gap-3 items-center p-2.5 rounded-[14px] mb-2.5 last:mb-0 hover-elevate cursor-pointer"
      style={{
        gridTemplateColumns: "54px 1fr auto",
        border: "1px solid rgba(108,240,255,.08)",
        background: "rgba(15,20,40,.28)",
      }}
      role="listitem"
      tabIndex={0}
      aria-label={`${track.title} by ${track.artist}, ${formatPlays(track.plays)} plays`}
      data-testid={`track-row-${track.id}`}
    >
      {showRank && track.rank ? (
        <RankThumb rank={track.rank} />
      ) : (
        <TrackThumb trackId={track.id} />
      )}
      <div className="min-w-0">
        <div className="font-black tracking-wide text-sm truncate" style={{ color: "rgba(234,240,255,.95)" }} data-testid={`text-track-title-${track.id}`}>
          {track.title}
        </div>
        <div className="mt-0.5 text-[13px] truncate" style={{ color: "rgba(170,182,232,.85)" }} data-testid={`text-track-artist-${track.id}`}>
          {track.artist}
        </div>
      </div>
      <div
        className="font-extrabold tracking-wide text-sm text-right min-w-[64px]"
        style={{ color: "rgba(234,240,255,.88)" }}
        data-testid={`text-track-plays-${track.id}`}
      >
        {formatPlays(track.plays)}
      </div>
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
    <Panel>
      <PanelHeader title={title} subtitle={subtitle} testId={`panel-header-${testId}`} />
      <ScrollArea className={tall ? "max-h-[320px]" : "max-h-[265px]"}>
        <div className="p-2.5" role="list" aria-label={title} data-testid={`list-${testId}`}>
          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[74px] rounded-[14px] animate-pulse"
                  style={{ background: "rgba(15,20,40,.5)" }}
                  data-testid={`skeleton-track-${i}`}
                />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2" data-testid={`empty-${testId}`}>
              <Music className="w-8 h-8 opacity-30" style={{ color: "rgba(108,240,255,.5)" }} />
              <span className="text-sm" style={{ color: "rgba(170,182,232,.6)" }}>No tracks found</span>
            </div>
          ) : (
            tracks.map((track) => (
              <TrackRow key={track.id} track={track} showRank={showRank} />
            ))
          )}
        </div>
      </ScrollArea>
    </Panel>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div
      className="p-2.5 rounded-[14px] flex gap-2.5 items-center hover-elevate cursor-pointer"
      style={{
        border: "1px solid rgba(108,240,255,.08)",
        background: "rgba(15,20,40,.28)",
      }}
      role="listitem"
      tabIndex={0}
      aria-label={`${creator.name}, ${creator.trackCount} new tracks`}
      data-testid={`creator-card-${creator.id}`}
    >
      <Avatar className="w-[42px] h-[42px] rounded-[14px] shrink-0">
        <AvatarFallback
          className="rounded-[14px] text-xs font-bold"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,79,216,.65), rgba(160,107,255,.35) 55%, rgba(108,240,255,.20))",
            border: "1px solid rgba(255,79,216,.20)",
            color: "rgba(234,240,255,.9)",
          }}
        >
          {creator.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="font-black text-[13.5px] leading-tight truncate" style={{ color: "rgba(234,240,255,.92)" }} data-testid={`text-creator-name-${creator.id}`}>
          {creator.name}
        </div>
        <div className="mt-0.5 text-xs" style={{ color: "rgba(170,182,232,.85)" }} data-testid={`text-creator-tracks-${creator.id}`}>
          {creator.trackCount} New Track{creator.trackCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

function CreatorsList({ creators, isLoading }: { creators: Creator[]; isLoading?: boolean }) {
  return (
    <Panel>
      <PanelHeader title="New Creators of the Week" subtitle="scroll" testId="panel-header-creators" />
      <ScrollArea className="max-h-[240px]">
        <div className="p-2.5 grid grid-cols-2 gap-2.5" role="list" aria-label="New creators" data-testid="list-creators">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[62px] rounded-[14px] animate-pulse"
                  style={{ background: "rgba(15,20,40,.5)" }}
                  data-testid={`skeleton-creator-${i}`}
                />
              ))}
            </>
          ) : creators.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-8 gap-2" data-testid="empty-creators">
              <Users className="w-8 h-8 opacity-30" style={{ color: "rgba(255,79,216,.5)" }} />
              <span className="text-sm" style={{ color: "rgba(170,182,232,.6)" }}>No creators yet</span>
            </div>
          ) : (
            creators.map((creator) => <CreatorCard key={creator.id} creator={creator} />)
          )}
        </div>
      </ScrollArea>
    </Panel>
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
    <div
      className="min-h-screen relative"
      style={{
        background: `
          radial-gradient(1200px 600px at 15% 0%, rgba(160,107,255,.28), transparent 55%),
          radial-gradient(1000px 500px at 85% 0%, rgba(108,240,255,.20), transparent 55%),
          radial-gradient(900px 500px at 50% 40%, rgba(255,79,216,.10), transparent 60%),
          linear-gradient(180deg, #070a14, #060818 55%, #070a14)
        `,
      }}
    >
      <div className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.95 }}>
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(closest-side at 50% 55%, rgba(255,79,216,.22), transparent 55%),
              radial-gradient(closest-side at 50% 60%, rgba(108,240,255,.20), transparent 60%),
              conic-gradient(from 200deg at 30% 55%, transparent 0deg, rgba(255,79,216,.28) 25deg, transparent 60deg, rgba(108,240,255,.20) 95deg, transparent 140deg),
              conic-gradient(from -20deg at 70% 55%, transparent 0deg, rgba(255,79,216,.26) 22deg, transparent 58deg, rgba(108,240,255,.18) 92deg, transparent 140deg)
            `,
            mixBlendMode: "screen",
          }}
        />
      </div>

      <header
        className="sticky top-0 z-50 backdrop-blur-[10px]"
        style={{
          background: "rgba(7,10,20,.55)",
          borderBottom: "1px solid rgba(162,106,255,.18)",
        }}
        data-testid="header-main"
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 md:gap-4 items-center px-5 py-3.5">
          <div className="flex flex-col items-center md:items-start leading-tight">
            <div
              className="font-black text-xl tracking-wider"
              style={{
                color: "#6cf0ff",
                textShadow: "0 0 18px rgba(108,240,255,.45)",
              }}
              data-testid="text-brand-name"
            >
              HIT WAVE MEDIA
            </div>
            <div className="mt-0.5 text-xs tracking-wide" style={{ color: "rgba(234,240,255,.78)" }} data-testid="text-brand-tagline">
              The Home of AI Music
            </div>
          </div>

          <div className="flex justify-center">
            <label
              className="w-full max-w-[720px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-full cursor-text"
              style={{
                background: "rgba(15,20,40,.55)",
                border: "1px solid rgba(108,240,255,.18)",
                boxShadow: "0 0 22px rgba(160,107,255,.08)",
              }}
            >
              <Search className="w-[18px] h-[18px] opacity-75 shrink-0" style={{ color: "rgba(234,240,255,.8)" }} />
              <input
                type="search"
                placeholder="Search tracks, creators, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tracks, creators, and genres"
                className="w-full bg-transparent border-none outline-none text-sm"
                style={{ color: "rgba(234,240,255,.9)" }}
                data-testid="input-search"
              />
            </label>
          </div>

          <div className="flex justify-center md:justify-end items-center gap-2.5">
            <Button
              variant="ghost"
              className="text-sm font-semibold no-default-hover-elevate no-default-active-elevate"
              style={{ color: "rgba(234,240,255,.85)" }}
              data-testid="link-creators-login"
            >
              Creators Login
            </Button>
            <Button
              className="font-black text-sm tracking-wide border-none no-default-hover-elevate no-default-active-elevate"
              style={{
                background: "linear-gradient(135deg, #a06bff, #ff4fd8)",
                color: "#070a14",
                boxShadow: "0 0 22px rgba(255,79,216,.22)",
              }}
              data-testid="button-sign-up"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 max-w-[1200px] mx-auto px-5 pt-6 pb-2.5 text-center" data-testid="section-hero">
        <h1
          className="text-3xl sm:text-4xl md:text-[44px] font-black tracking-wider uppercase leading-tight"
          style={{
            color: "rgba(234,240,255,.95)",
            textShadow: "0 0 25px rgba(160,107,255,.22)",
          }}
          data-testid="text-hero-title"
        >
          HIT WAVE MEDIA
        </h1>
        <h2
          className="mt-2.5 text-lg sm:text-xl md:text-[22px] font-bold"
          style={{ color: "rgba(234,240,255,.88)" }}
          data-testid="text-hero-subtitle"
        >
          The Home of AI Music
        </h2>
        <p
          className="mt-2.5 mx-auto max-w-[820px] text-[15px]"
          style={{ color: "rgba(170,182,232,.88)" }}
          data-testid="text-hero-description"
        >
          Built Exclusively for AI Music Creators
        </p>
      </section>

      <div className="relative z-10 max-w-[1200px] mx-auto px-5 pb-10" data-testid="section-content">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_360px] gap-4 items-start">
          <aside className="hidden lg:block" data-testid="sidebar-genres">
            <GenreSidebar activeGenre={activeGenre} onGenreSelect={setActiveGenre} />
          </aside>

          <main className="flex flex-col gap-4" data-testid="section-main">
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

          <aside className="flex flex-col gap-4" data-testid="sidebar-right">
            <TrackList
              title="Top 25 This Week"
              subtitle="scroll"
              tracks={topTracks}
              showRank
              tall
              isLoading={topLoading}
              testId="top25"
            />
            <CreatorsList creators={creators} isLoading={creatorsLoading} />
          </aside>
        </div>

        <div className="lg:hidden mt-4" data-testid="sidebar-genres-mobile">
          <GenreSidebar activeGenre={activeGenre} onGenreSelect={setActiveGenre} />
        </div>
      </div>
    </div>
  );
}
