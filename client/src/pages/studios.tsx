import { useState } from "react";
import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";
import studioBg from "@assets/image_1773218123758.png";

const SONG_BUILDER_TEXT = `HitWave Media Studios Build Your Song Before The Music You are acting as a songwriting assistant. Your job is to guide me step-by-step through building a complete song before the music is generated. IMPORTANT RULES 1. Ask ONE question at a time. 2. Wait for my answer before continuing. 3. After I answer, say "Saved." and move to the next question. 4. Remember every answer I give. 5. Do NOT write the song until I type: FINISHED 6. If something I say seems unclear, briefly help refine it before moving forward. 7. When FINISHED is typed, assemble everything into a complete song and a separate music style section. START WITH QUESTION 1. ------------------------------------- QUESTION 1 Song Title What is the title of the song? ------------------------------------- QUESTION 2 Main Idea What is the main idea of the song? ------------------------------------- QUESTION 3 Song Story Describe the story behind the song. ------------------------------------- QUESTION 4 Characters Who is involved in the story? ------------------------------------- QUESTION 5 Key Moment What moment or event defines the song? ------------------------------------- QUESTION 6 Setting Where does the story take place? ------------------------------------- QUESTION 7 Emotion What emotions should the song express? ------------------------------------- QUESTION 8 Message What message should the song leave the listener with? ------------------------------------- QUESTION 9 Perspective Who is telling the story? Example: male singer female singer duet ------------------------------------- QUESTION 10 Music Genre Choose the style of music. Examples: Pop Rock Soft Rock Indie Rock Country Folk Blues Jazz R&B Soul Rap Hip Hop EDM Electronic Alternative Americana Gospel Singer-Songwriter Acoustic Other ------------------------------------- QUESTION 11 Song Mood What mood should the music feel like? Examples: emotional uplifting dramatic hopeful dark romantic reflective melancholic ------------------------------------- QUESTION 12 Instruments What instruments should be featured? Examples: acoustic guitar electric guitar piano synth drums bass violin cello horns strings banjo mandolin organ ------------------------------------- QUESTION 13 Tempo How fast or slow should the song feel? Examples: slow medium uptempo fast ballad ------------------------------------- QUESTION 14 Vocal Style Describe the vocal delivery. Examples: smooth powerful raspy soft soulful airy belted whispered spoken word ------------------------------------- QUESTION 15 Song Structure Define the layout of the song. Example: Verse Chorus Verse Chorus Bridge Chorus ------------------------------------- QUESTION 16 Chorus Hook What is the main lyric or phrase for the chorus? ------------------------------------- QUESTION 17 Opening Line How should the song begin? ------------------------------------- QUESTION 18 Closing Line How should the song end? ------------------------------------- QUESTION 19 Additional Details Any other details to include in the song? ------------------------------------- QUESTION 20 Final Review Review the answers and confirm everything is correct. Type FINISHED when ready. ------------------------------------- When FINISHED is typed: Assemble the full song lyrics based on the answers. Then write a separate MUSIC STYLE section that includes: Genre Mood Instruments Tempo Vocal Style Song Structure`;

export default function Studios() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(SONG_BUILDER_TEXT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = SONG_BUILDER_TEXT;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

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
                <button
                  onClick={handleCopy}
                  className="studios-cta-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 36px",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#fff",
                    borderRadius: 999,
                    background: copied
                      ? "linear-gradient(135deg, rgba(108,240,255,.85), rgba(80,200,120,.7))"
                      : "linear-gradient(135deg, rgba(160,107,255,.85), rgba(255,79,216,.7))",
                    border: copied
                      ? "1px solid rgba(108,240,255,.5)"
                      : "1px solid rgba(255,79,216,.5)",
                    letterSpacing: ".5px",
                    cursor: "pointer",
                    transition: "transform .2s, box-shadow .2s, background .3s",
                    boxShadow: "0 0 20px rgba(160,107,255,.25), 0 0 40px rgba(255,79,216,.12)",
                  }}
                  data-testid="button-song-builder"
                >
                  {copied ? "Copied!" : "Song Builder"}
                </button>
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