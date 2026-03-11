import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";
import studioBg from "@assets/image_1773218123758.png";

export default function Studios() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url(${studioBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundRepeat: "no-repeat",
      color: "#eaf0ff",
      fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    }}>
      <div style={{
        minHeight: "100vh",
        background: "rgba(7,10,20,.55)",
        backdropFilter: "blur(2px)",
      }}>
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(108,240,255,.12)",
          background: "rgba(5,6,21,.7)",
          backdropFilter: "blur(12px)",
        }}>
          <a href="/" style={{ textDecoration: "none" }} data-testid="link-studios-logo">
            <img src={siteLogo} alt="Hit Wave Media" style={{ height: 60, width: "auto", objectFit: "contain" }} />
          </a>
        </header>

        <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 60px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 900,
            fontStyle: "italic",
            color: "#fff",
            marginBottom: 40,
            lineHeight: 1.2,
            textShadow: "0 0 20px rgba(160,107,255,.4)",
          }} data-testid="text-studios-title">
            Why HitWave Studio Was Created
          </h1>

          <div style={{ fontSize: "clamp(14px, 1.8vw, 17px)", lineHeight: 1.8, color: "rgba(234,240,255,.85)", textAlign: "center" }}>
            <p style={{ marginBottom: 28 }}>
              <strong style={{ color: "#fff" }}>Artificial intelligence</strong> has made music creation more accessible than ever before. Anyone with an idea can now generate a full song in minutes using modern AI music platforms. However, many creators quickly discover that <strong style={{ color: "#fff" }}>simply prompting a music generator</strong> does not always produce the results they expect.
            </p>

            <p style={{
              fontSize: "clamp(18px, 2.5vw, 24px)",
              fontWeight: 800,
              color: "#6cf0ff",
              marginBottom: 28,
              lineHeight: 1.4,
              textShadow: "0 0 12px rgba(108,240,255,.3)",
            }}>
              The challenge is not the technology.<br />
              The challenge is the structure behind the song.
            </p>

            <p style={{ marginBottom: 28 }}>
              <strong style={{ color: "#fff" }}>Traditional songwriting</strong> follows a clear creative process. Professional songwriters typically begin with the foundation of the song before any music is produced. They define the <strong style={{ color: "#fff" }}>story</strong>, the emotional direction, the message, the chorus hook, and the perspective of the singer. Only after these elements are established does the music take shape around them. AI music generators work best when they are given that same structure.
            </p>

            <p style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              fontWeight: 700,
              color: "#c9a0ff",
              marginBottom: 28,
              lineHeight: 1.5,
            }}>
              HitWave Studio was created to provide creators with a <strong style={{ color: "#fff" }}>simple and guided way</strong> to build that <strong style={{ color: "#fff" }}>foundation</strong> before generating the music.
            </p>

            <p style={{ marginBottom: 28 }}>
              Instead of relying on a single prompt, the system walks creators through a <strong style={{ color: "#fff" }}>structured songwriting process step by step.</strong> Each question helps clarify a different element of the song, including the story, the characters, the emotional tone, the chorus message, and the musical direction.
            </p>

            <p style={{ marginBottom: 36 }}>
              <strong style={{ color: "#6cf0ff" }}>In the time</strong> the process is complete, the creator has developed a <strong style={{ color: "#fff" }}>complete song blueprint.</strong> This blueprint can then be used with any AI music platform to generate a song that is far more focused, intentional, and professional.
            </p>

            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <a
                href="/studios/form"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 40px",
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, rgba(160,107,255,.85), rgba(255,79,216,.7))",
                  border: "1px solid rgba(255,79,216,.5)",
                  letterSpacing: ".5px",
                  transition: "transform .2s, box-shadow .2s",
                  boxShadow: "0 0 20px rgba(160,107,255,.25), 0 0 40px rgba(255,79,216,.12)",
                }}
                data-testid="button-start-blueprint"
              >
                Start Your Song Blueprint
              </a>
              <a
                href="/"
                style={{
                  fontSize: 13,
                  color: "rgba(170,182,232,.6)",
                  textDecoration: "none",
                }}
                data-testid="link-back-home"
              >
                Back to Hit Wave Media
              </a>
            </div>
          </div>
        </main>

        <footer style={{ textAlign: "center", padding: "24px 16px", borderTop: "1px solid rgba(108,240,255,.06)" }}>
          <div style={{ fontSize: 12, color: "rgba(170,182,232,.35)" }}>
            &copy; {new Date().getFullYear()} Hit Wave Media
          </div>
        </footer>
      </div>
    </div>
  );
}