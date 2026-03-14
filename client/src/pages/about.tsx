import { Music, Users, Globe, Megaphone, Palette, MessageCircle } from "lucide-react";

export default function About() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#070a14",
      color: "#eaf0ff",
      padding: "60px 16px 80px",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{
          fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
          fontWeight: 800,
          textAlign: "center",
          marginBottom: 8,
          background: "linear-gradient(90deg, #6cf0ff, #a06bff, #ff4fd8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }} data-testid="heading-about-title">
          Make Waves with Your Music
        </h1>
        <h2 style={{
          fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
          fontWeight: 600,
          textAlign: "center",
          color: "#6cf0ff",
          marginBottom: 40,
        }} data-testid="heading-about-subtitle">
          The Hit Wave Media Revolution
        </h2>

        <section style={{
          background: "rgba(108,240,255,.04)",
          border: "1px solid rgba(108,240,255,.1)",
          borderRadius: 16,
          padding: "28px 24px",
          marginBottom: 24,
        }} data-testid="section-about-intro">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Music style={{ color: "#6cf0ff", flexShrink: 0 }} size={22} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#eaf0ff", margin: 0 }}>Our Mission</h3>
          </div>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(234,240,255,.8)", margin: 0 }}>
            Stop uploading your art into the void. At Hit Wave Media, we believe every creator deserves a stage. As the premier AI music creator community, we've built more than just a platform—we've built a movement. Our mission is simple: to provide elite AI music promotion and a home for the most innovative sounds of 2026.
          </p>
        </section>

        <section style={{
          background: "rgba(160,107,255,.04)",
          border: "1px solid rgba(160,107,255,.1)",
          borderRadius: 16,
          padding: "28px 24px",
          marginBottom: 24,
        }} data-testid="section-about-listening">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Globe style={{ color: "#a06bff", flexShrink: 0 }} size={22} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#eaf0ff", margin: 0 }}>Why the World is Listening to Hit Wave</h3>
          </div>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(234,240,255,.8)", margin: 0 }}>
            In an era of endless automation, we bring back the human touch. We specialize in human-curated AI music playlists, ensuring that quality, emotion, and soul are at the forefront of every stream. Whether you're looking to listen to trending AI tracks or find your next favorite artist, our community is where the "next big thing" starts.
          </p>
        </section>

        <section style={{
          background: "rgba(255,79,216,.04)",
          border: "1px solid rgba(255,79,216,.1)",
          borderRadius: 16,
          padding: "28px 24px",
          marginBottom: 24,
        }} data-testid="section-about-creators">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Users style={{ color: "#ff4fd8", flexShrink: 0 }} size={22} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#eaf0ff", margin: 0 }}>Empowering Independent Creators</h3>
          </div>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(234,240,255,.8)", marginBottom: 20 }}>
            We know the struggle of the AI music production workflow. That's why we've tailored our services to support AI music distribution for independent creators. We don't just host your files; we help you get your AI music on playlists and provide the visibility that giant corporations ignore.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 10,
              background: "rgba(108,240,255,.04)",
              border: "1px solid rgba(108,240,255,.06)",
            }}>
              <Megaphone style={{ color: "#6cf0ff", flexShrink: 0, marginTop: 2 }} size={18} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#6cf0ff", marginBottom: 4 }}>Promote Your Sound</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(234,240,255,.7)" }}>Optimized strategies for AI music promotion in 2026.</div>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 10,
              background: "rgba(160,107,255,.04)",
              border: "1px solid rgba(160,107,255,.06)",
            }}>
              <Palette style={{ color: "#a06bff", flexShrink: 0, marginTop: 2 }} size={18} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#a06bff", marginBottom: 4 }}>Global Discovery</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(234,240,255,.7)" }}>A prompt-to-song community gallery that showcases the best of the best.</div>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 10,
              background: "rgba(255,79,216,.04)",
              border: "1px solid rgba(255,79,216,.06)",
            }}>
              <MessageCircle style={{ color: "#ff4fd8", flexShrink: 0, marginTop: 2 }} size={18} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#ff4fd8", marginBottom: 4 }}>Direct Connection</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(234,240,255,.7)" }}>Join our active AI music collab groups and start making history.</div>
              </div>
            </div>
          </div>
        </section>

        <section style={{
          background: "linear-gradient(135deg, rgba(108,240,255,.06), rgba(160,107,255,.06), rgba(255,79,216,.06))",
          border: "1px solid rgba(108,240,255,.15)",
          borderRadius: 16,
          padding: "32px 24px",
          textAlign: "center",
        }} data-testid="section-about-join">
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#eaf0ff", marginBottom: 12 }}>Join the Community</h3>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(234,240,255,.8)", marginBottom: 8 }}>
            From our vibrant Facebook Group to our global streaming site, Hit Wave Media is the definitive AI music platform for the future. Don't just generate music—launch it.
          </p>
          <p style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            marginTop: 20,
            marginBottom: 20,
            background: "linear-gradient(90deg, #6cf0ff, #ff4fd8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Join the Wave Today and let's redefine the industry together.
          </p>
          <a
            href="/sign-up"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "linear-gradient(90deg, #2b7cff, #38e0ff)",
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 10,
              fontSize: "0.95rem",
              transition: "opacity .2s",
            }}
            data-testid="link-about-signup"
          >
            Creator Sign Up
          </a>
        </section>
      </div>
    </div>
  );
}
