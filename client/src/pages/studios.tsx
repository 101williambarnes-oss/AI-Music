import { useState } from "react";
import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";

const SONG_BUILDER_TEXT = `HITWAVE MEDIA STUDIOS
STEP-BY-STEP SONG CREATOR

You are a professional AI songwriting assistant and creative guide.

Your job is to help me create a complete song by going step-by-step, one question at a time.

IMPORTANT RULES
1. Ask only ONE question at a time.
2. Wait for my answer before asking the next question.
3. After each answer, say: Saved.
4. Remember every answer I give.
5. If an answer is too short, weak, unclear, or off-track, briefly help me improve it before moving on.
6. If I seem unsure, give me 2 or 3 strong options to choose from.
7. Keep the story, emotion, lyrics, voice, and music all fitting together naturally.
8. Do NOT write the song until I type: BUILD SONG
9. When I type BUILD SONG, create:
SECTION 1 \u2014 SONG LYRICS
SECTION 2 \u2014 MUSIC STYLE FOR GENERATOR
10. In the final song, make the lyrics feel human, emotional, and singable.
11. Keep the STYLE section separate from the lyrics.

SMART GUIDANCE RULES
- If the title is weak, help improve it.
- If the story is vague, ask for stronger detail.
- If the chorus idea is weak, help make it more memorable.
- If the genre does not fit the story, suggest a better one.
- If the vocal description is too simple, ask follow-up questions.
- If the creator's answer is already strong, just say "Saved." and continue.

Start with Question 1.

--------------------------------------------------
QUESTION 1
What is the title of your song?

--------------------------------------------------
QUESTION 2
What is the main idea of the song?

--------------------------------------------------
QUESTION 3
Describe the story behind the song.

--------------------------------------------------
QUESTION 4
Who are the main characters?

--------------------------------------------------
QUESTION 5
What moment defines the song?

--------------------------------------------------
QUESTION 6
Where does the story take place?

Examples:
small town
city
front porch
bar
mountains
river
desert
coastline

--------------------------------------------------
QUESTION 7
What emotions should the song express?

Examples:
heartbreak
hope
love
regret
nostalgia
grief
healing

--------------------------------------------------
QUESTION 8
What message should the listener take away?

--------------------------------------------------
QUESTION 9
Who is telling the story?

Options:
Male singer
Female singer
Male & Female duet

--------------------------------------------------
QUESTION 10
What style of music fits best?

Options:
Pop
Rock
Soft Rock
Indie Rock
Alternative Rock
Country
Folk
Blues
Jazz
R&B
Soul
Rap
Hip Hop
EDM
Electronic
Americana
Singer-Songwriter
Acoustic
Gospel

--------------------------------------------------
QUESTION 11
What should the music feel like?

Examples:
emotional
uplifting
dramatic
hopeful
dark
romantic
melancholic

--------------------------------------------------
QUESTION 12
What tempo should it be?

Options:
Slow Ballad
Medium Tempo
Radio Pop Tempo
Upbeat Fast

--------------------------------------------------
QUESTION 13
What instruments should carry the song?

Examples:
acoustic guitar
electric guitar
piano
bass
light drums
violin
strings
synth

--------------------------------------------------
QUESTION 14
Describe the vocal style.

Examples:
clear emotional vocal
powerful vocal
soft intimate vocal
raspy rock vocal

If needed, ask follow-up questions about:
- voice type
- texture
- strength
- delivery
- emotional feel
- age or life feel
- what to avoid

--------------------------------------------------
QUESTION 15
What is the main line or idea of the chorus?

--------------------------------------------------
QUESTION 16
What structure should the song use?

Example:
Verse
Chorus
Verse
Chorus
Bridge
Final Chorus

--------------------------------------------------
QUESTION 17
Are there any styles the music should exclude?

Examples:
avoid country
avoid rap
avoid heavy metal
avoid glossy pop

--------------------------------------------------
QUESTION 18
What should the listener feel at the end?

--------------------------------------------------
QUESTION 19
Would you like to improve or clarify anything before writing the song?

At this step, review everything and strengthen anything weak.

--------------------------------------------------
QUESTION 20
When ready, type:
BUILD SONG

When BUILD SONG is typed, create:

----------------------------------
SECTION 1 \u2014 SONG LYRICS
----------------------------------

Write a complete song using all collected answers.

Format:
Verse 1
Chorus
Verse 2
Chorus
Bridge
Final Chorus

Rules:
- Make the story flow naturally
- Make the chorus strong and memorable
- Keep the lyrics emotionally clear and singable
- Do not add random ideas that were not discussed
- Match the genre, emotion, and vocal style chosen earlier

----------------------------------
SECTION 2 \u2014 MUSIC STYLE FOR GENERATOR
----------------------------------

Provide a detailed style block formatted exactly like this:

Genre:
Subgenre / Influence:
Tempo:
Mood:
Energy Level:
Instruments:
Beat / Rhythm Style:
Vocal Type:
Voice Age / Character:
Voice Texture:
Voice Strength:
Vocal Tone:
Vocal Delivery:
Voice Emotion:
Chorus Vocal Lift:
Song Atmosphere:
Production Style:
Song Structure:
Dynamic Build:
Style References:
Excluded Styles:
Style Description:`;

export default function Studios() {
  const [copied, setCopied] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const fromCreator = params.get("from") === "creator";
  const creatorId = params.get("id");

  function copyToClipboard(text: string, setCb: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setCb(true);
      setTimeout(() => setCb(false), 3000);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCb(true);
      setTimeout(() => setCb(false), 3000);
    });
  }

  function handleCopy() { copyToClipboard(SONG_BUILDER_TEXT, setCopied); }

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
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {fromCreator && creatorId && (
              <a
                href={`/creator/${creatorId}`}
                className="studios-home-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, rgba(160,107,255,.15), rgba(255,79,216,.1))",
                  border: "1px solid rgba(255,79,216,.35)",
                  color: "#ff4fd8",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "background .2s, border-color .2s",
                }}
                data-testid="button-back-to-library"
              >
                Back to Library
              </a>
            )}
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
          </div>
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
                    Step 1 — Copy the Song Builder & Paste Into AI
                  </p>
                  <p style={{ color: "rgba(234,240,255,.75)" }}>
                    Click the Song Builder button to copy the HitWave Studio songwriting system to your clipboard. Then open your preferred AI assistant and paste it into the chat. The AI will immediately begin guiding you through the songwriting process step by step.
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    fontWeight: 800,
                    color: "#6cf0ff",
                    marginBottom: 6,
                  }}>
                    Step 2 — Build the Song Foundation
                  </p>
                  <p style={{ color: "rgba(234,240,255,.75)" }}>
                    The AI walks you through 20+ structured questions covering your story, characters, emotions, genre, tempo, instruments, and an in-depth vocal direction system. It doesn't just collect answers — it helps you refine weak ideas into stronger ones.
                  </p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    fontWeight: 800,
                    color: "#6cf0ff",
                    marginBottom: 6,
                  }}>
                    Step 3 — Deep Vocal Design
                  </p>
                  <p style={{ color: "rgba(234,240,255,.75)" }}>
                    Our vocal section goes beyond simple labels. You'll define voice type, texture, strength, delivery, emotion, age feel, chorus lift, and what to avoid — like a producer describing a singer in the studio. This gives AI generators like Suno the detail they need.
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
                    Once all questions are complete, type BUILD SONG. The AI assembles your answers into a complete song blueprint — full lyrics plus a detailed, generator-ready music style block you can paste directly into Suno, Udio, or any AI music tool.
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
                    Copy the finished lyrics and the music style section separately. Paste them into your AI music generator. The style block includes genre, subgenre, tempo, mood, instruments, vocal direction, production style, dynamic build, and more.
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
                  Instead of relying on random prompts, HitWave Studio helps you <strong style={{ color: "#fff" }}>build the song first</strong>. The AI doesn't just take orders — it actively guides, challenges, and strengthens your ideas.
                </p>
                <p style={{
                  fontWeight: 700,
                  color: "#6cf0ff",
                  fontStyle: "italic",
                }}>
                  Because when the foundation is clear, the music follows.
                </p>
              </div>

              <div style={{
                marginTop: 28,
                padding: "20px",
                background: "rgba(160,107,255,.06)",
                border: "1px solid rgba(160,107,255,.15)",
                borderRadius: 12,
                textAlign: "left",
              }}>
                <p style={{ fontWeight: 700, color: "#c9a0ff", marginBottom: 10, fontSize: "0.95rem" }}>
                  What's Inside the Song Builder:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: "0.85rem", color: "rgba(234,240,255,.7)" }}>
                  <span>Song Title & Core Idea</span>
                  <span>Story & Characters</span>
                  <span>Key Moment & Setting</span>
                  <span>Emotional Direction</span>
                  <span>Song Perspective & Message</span>
                  <span>Genre & Mood</span>
                  <span>Tempo & Instruments</span>
                  <span>Chorus Hook & Structure</span>
                  <span>Voice Type & Texture</span>
                  <span>Voice Strength & Delivery</span>
                  <span>Voice Emotion & Age Feel</span>
                  <span>Chorus Voice Lift</span>
                  <span>What to Avoid</span>
                  <span>Song Refinement Review</span>
                </div>
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
              <p style={{ textAlign: "center", marginTop: 12, fontSize: "0.8rem", color: "rgba(170,182,232,.5)" }}>
                20 questions
              </p>

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
