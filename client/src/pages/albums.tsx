import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Creator, type Album } from "@shared/schema";
import { Disc3, Music, User } from "lucide-react";

type AlbumWithCreator = Album & { creator: Creator | null; trackCount: number };

export default function Albums() {
  const [, navigate] = useLocation();
  const { data: albums = [], isLoading } = useQuery<AlbumWithCreator[]>({ queryKey: ["/api/albums"] });

  return (
    <div className="hwm-app mockup-bg">
      <div className="wrap" style={{ paddingTop: 32, paddingBottom: 100, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: "#eaf0ff", marginBottom: 6 }} data-testid="text-albums-title">
          <Disc3 size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: 10, color: "#a06bff" }} />
          Creator Albums
        </h1>
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(170,182,232,.5)", marginBottom: 32 }}>
          Full albums from Hit Wave Media creators
        </p>

        {isLoading && (
          <div style={{ textAlign: "center", color: "rgba(170,182,232,.5)", padding: 40 }}>Loading albums...</div>
        )}

        {!isLoading && albums.length === 0 && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Disc3 size={48} style={{ color: "rgba(170,182,232,.2)", marginBottom: 16 }} />
            <p style={{ color: "rgba(170,182,232,.5)", fontSize: 16 }}>No albums yet. Be the first creator to release one!</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => navigate(`/album/${album.id}`)}
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(108,240,255,.12)",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform .2s, border-color .2s",
              }}
              className="album-card-hover"
              data-testid={`card-album-${album.id}`}
            >
              <div style={{ width: "100%", aspectRatio: "1/1", background: "rgba(160,107,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Disc3 size={64} style={{ color: "rgba(160,107,255,.3)" }} />
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} data-testid={`text-album-title-${album.id}`}>
                  {album.title}
                </div>
                <div style={{ fontSize: 12, color: "rgba(170,182,232,.5)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <User size={11} />
                  {album.creator?.name || "Unknown"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(170,182,232,.35)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <Music size={11} />
                  {album.trackCount} track{album.trackCount !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
