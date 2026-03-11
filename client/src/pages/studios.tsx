import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";
import studioBg from "@assets/image_1773218123758.png";

export default function Studios() {
  return (
    <div className="studios-page" style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #070a14 0%, #0a0e22 25%, #0d1030 50%, #110a2a 75%, #070a14 100%)",
      color: "#eaf0ff",
      fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    }}>
      <div style={{
        minHeight: "100vh",
        background: "rgba(7,10,20,.55)",
        backdropFilter: "blur(2px)",
      }}>
        <header className="studios-header" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid rgba(108,240,255,.12)",
          background: "rgba(5,6,21,.7)",
          backdropFilter: "blur(12px)",
        }}>
          <a href="/" style={{ textDecoration: "none" }} data-testid="link-studios-logo">
            <img src={siteLogo} alt="Hit Wave Media" className="studios-logo" style={{ height: 60, width: "auto", objectFit: "contain" }} />
          </a>
          <a
            href="/"
            className="studios-home-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(108,240,255,.12)",
              border: "1px solid rgba(108,240,255,.35)",
              color: "#6cf0ff",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              transition: "background .2s, border-color .2s",
            }}
            data-testid="button-studios-home"
          >
            Home
          </a>
        </header>

        <main className="studios-main" style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 60px", textAlign: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{
              fontSize: "clamp(22px, 4vw, 38px)",
              fontWeight: 900,
              fontStyle: "italic",
              color: "#fff",
              marginBottom: 28,
              lineHeight: 1.2,
              textShadow: "0 0 20px rgba(160,107,255,.4)",
            }} data-testid="text-how-it-works-title">
              How HitWave Studio Works
            </h2>

            <div style={{ fontSize: "clamp(14px, 1.8vw, 16px)", lineHeight: 1.75, color: "rgba(234,240,255,.85)" }}>
              <p style={{ marginBottom: 16 }}>
                Creating great AI music is not about typing random prompts.
              </p>
              <p style={{ marginBottom: 16 }}>
                The best songs start with a <strong style={{ color: "#fff" }}>clear idea</strong>, a <strong style={{ color: "#fff" }}>strong story</strong>, and a <strong style={{ color: "#fff" }}>defined emotional direction</strong>.
              </p>
              <p style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                fontWeight: 700,
                color: "#c9a0ff",
                marginBottom: 32,
                lineHeight: 1.5,
              }}>
                HitWave Studio was designed to guide creators through that process.
              </p>

              <div style={{ textAlign: "left", maxWidth: 640, margin: "0 auto" }}>
                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    fontWeight: 800,
                    color: "#6cf0ff",
                    marginBottom: 6,
                  }}>
                    Step 1 — Copy the Song Builder
                  </p>
                  <p style={{ color: "rgba(234,240,255,.75)" }}>
                    Click the Copy Song Builder button. This copies the HitWave Studio songwriting system to your clipboard.
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    fontWeight: 800,
                    color: "#6cf0ff",
                    marginBottom: 6,
                  }}>
                    Step 2 — Paste Into AI
                  </p>
                  <p style={{ color: "rgba(234,240,255,.75)" }}>
                    Open your preferred AI assistant and paste the system into the chat. The AI will immediately begin guiding you through the songwriting process step by step.
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    fontWeight: 800,
                    color: "#6cf0ff",
                    marginBottom: 6,
                  }}>
                    Step 3 — Build the Song Foundation
                  </p>
                  <p style={{ color: "rgba(234,240,255,.75)" }}>
                    The AI will ask structured questions that help define the key elements of your song, including the story, characters, emotional tone, chorus message, musical style, instruments, tempo, and vocal direction.
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    fontWeight: 800,
                    color: "#6cf0ff",
                    marginBottom: 6,
                  }}>
                    Step 4 — Generate Your Song Blueprint
                  </p>
                  <p style={{ color: "rgba(234,240,255,.75)" }}>
                    Once all questions are complete, the AI assembles your answers into a complete song blueprint — including lyrics and detailed music style instructions.
                  </p>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <p style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    fontWeight: 800,
                    color: "#6cf0ff",
                    marginBottom: 6,
                  }}>
                    Step 5 — Bring the Music to Life
                  </p>
                  <p style={{ color: "rgba(234,240,255,.75)" }}>
                    Copy the finished lyrics and style instructions and paste them into your AI music generator to create the final song.
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: 24,
                padding: "28px 20px",
                background: "rgba(15,20,40,.5)",
                border: "1px solid rgba(108,240,255,.1)",
                borderRadius: 16,
              }}>
                <p style={{
                  fontSize: "clamp(16px, 2vw, 20px)",
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: 12,
                }}>
                  The Difference
                </p>
                <p style={{ marginBottom: 16, color: "rgba(234,240,255,.8)" }}>
                  Instead of relying on random prompts, HitWave Studio helps you <strong style={{ color: "#fff" }}>build the song first</strong>.
                </p>
                <p style={{
                  fontWeight: 700,
                  color: "#6cf0ff",
                  fontStyle: "italic",
                }}>
                  Because when the foundation is clear, the music follows.
                </p>
              </div>

              <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
                <a
                  href="/studios/form"
                  className="studios-cta-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 36px",
                    fontSize: 16,
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
                  data-testid="button-song-builder"
                >
                  Song Builder
                </a>
              </div>

              <div style={{ marginTop: 36, textAlign: "center" }}>
                <p style={{
                  fontSize: "clamp(18px, 2.5vw, 24px)",
                  fontWeight: 900,
                  color: "#c9a0ff",
                  marginBottom: 4,
                }}>
                  HitWave Studio
                </p>
                <p style={{
                  fontSize: "clamp(13px, 1.5vw, 16px)",
                  fontStyle: "italic",
                  color: "rgba(170,182,232,.6)",
                }}>
                  Build the song before the music.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer style={{ textAlign: "center", padding: "20px 16px", borderTop: "1px solid rgba(108,240,255,.06)" }}>
          <div style={{ fontSize: 12, color: "rgba(170,182,232,.35)" }}>
            &copy; {new Date().getFullYear()} Hit Wave Media
          </div>
        </footer>
      </div>
    </div>
  );
}