import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Creator, type Album } from "@shared/schema";
import { Disc3, Music, User, Play } from "lucide-react";

type AlbumWithCreator = Album & { creator: Creator | null; trackCount: number };

export default function Albums() {
  const [, navigate] = useLocation();
  const { data: albums = [], isLoading } = useQuery<AlbumWithCreator[]>({ queryKey: ["/api/albums"] });

  return (
    <div className="hwm-app mockup-bg">
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 120, maxWidth: 1100, margin: "0 auto", padding: "40px 24px 120px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a06bff", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Hit Wave Media</div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: "#eaf0ff", marginBottom: 8, lineHeight: 1.1 }} data-testid="text-albums-title">
            Albums
          </h1>
          <p style={{ fontSize: 15, color: "rgba(170,182,232,.5)", maxWidth: 500, margin: "0 auto" }}>
            Full-length albums from the best AI music creators on the platform
          </p>
        </div>

        {isLoading && (
          <div style={{ textAlign: "center", color: "rgba(170,182,232,.5)", padding: 60 }}>
            <Disc3 size={40} style={{ color: "rgba(160,107,255,.3)", marginBottom: 12, animation: "spin 2s linear infinite" }} />
            <div>Loading albums...</div>
          </div>
        )}

        {!isLoading && albums.length === 0 && (
          <div style={{ textAlign: "center", padding: 80 }}>
            <Disc3 size={64} style={{ color: "rgba(170,182,232,.15)", marginBottom: 20 }} />
            <p style={{ color: "rgba(170,182,232,.5)", fontSize: 18, fontWeight: 600 }}>No albums yet</p>
            <p style={{ color: "rgba(170,182,232,.3)", fontSize: 14, marginTop: 6 }}>Be the first creator to release one!</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 }}>
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => navigate(`/album/${album.id}`)}
              className="album-card-hover"
              style={{
                background: "rgba(10,8,30,.7)",
                border: "1px solid rgba(108,240,255,.1)",
                borderRadius: 16,
                overflow: "hidden",
                cursor: "pointer",
                transition: "all .3s ease",
              }}
              data-testid={`card-album-${album.id}`}
            >
              <div style={{ width: "100%", aspectRatio: "1/1", position: "relative", overflow: "hidden", background: "rgba(160,107,255,.06)" }}>
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s ease" }} className="album-cover-img" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(160,107,255,.12) 0%, rgba(255,79,216,.08) 100%)" }}>
                    <Disc3 size={80} style={{ color: "rgba(160,107,255,.2)" }} />
                  </div>
                )}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,.85) 100%)",
                  opacity: 0, transition: "opacity .3s",
                }} className="album-overlay" />
                <div style={{
                  position: "absolute", bottom: 16, right: 16,
                  width: 48, height: 48, borderRadius: "50%",
                  background: "linear-gradient(135deg, #a06bff 0%, #ff4fd8 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0, transform: "translateY(8px)", transition: "all .3s ease",
                  boxShadow: "0 4px 20px rgba(160,107,255,.4)",
                }} className="album-play-btn">
                  <Play size={22} fill="#fff" style={{ color: "#fff", marginLeft: 2 }} />
                </div>
              </div>

              <div style={{ padding: "16px 18px 18px" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#eaf0ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 }} data-testid={`text-album-title-${album.id}`}>
                  {album.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, color: "rgba(170,182,232,.6)", display: "flex", alignItems: "center", gap: 5 }}>
                    <User size={13} style={{ color: "#a06bff" }} />
                    {album.creator?.name || "Unknown"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(170,182,232,.35)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Music size={12} />
                    {album.trackCount} track{album.trackCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .album-card-hover:hover {
          border-color: rgba(160,107,255,.35) !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(160,107,255,.15);
        }
        .album-card-hover:hover .album-cover-img {
          transform: scale(1.05);
        }
        .album-card-hover:hover .album-overlay {
          opacity: 1 !important;
        }
        .album-card-hover:hover .album-play-btn {
          opacity: 1 !important;
          transform: translateY(0px) !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
