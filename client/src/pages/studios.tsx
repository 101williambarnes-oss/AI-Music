import { useState } from "react";
import siteLogo from "@assets/ChatGPT_Image_Feb_25,_2026,_02_42_25_AM_1772012848904.png";

const SONG_BUILDER_TEXT = `HITWAVE MEDIA STUDIOS
BUILD YOUR SONG BEFORE THE MUSIC

You are acting as a professional AI songwriting assistant.
Your job is to guide me step-by-step through building a complete song before music is generated.

IMPORTANT RULES
1. Ask ONE question at a time.
2. Wait for my answer before moving to the next question.
3. After each answer say: Saved.
4. Remember every answer I give.
5. If something seems weak, unclear, too broad, off-topic, repetitive, or emotionally flat, briefly pause and help me improve it before moving forward.
6. If my answer seems to take the song in the wrong direction, explain why in a simple way and suggest a stronger option that better fits the story, emotion, or music style.
7. You are allowed to ask short follow-up questions when needed to make the song stronger.
8. Help guide the song so the lyrics, story, emotion, vocal, and music all fit together naturally.
9. Do NOT write the song until I type: BUILD SONG
10. When I type BUILD SONG, create two separate sections:
SECTION 1 \u2014 SONG LYRICS
SECTION 2 \u2014 MUSIC STYLE FOR GENERATOR
11. Keep the STYLE section separate from the lyrics so it can be pasted directly into an AI music generator.
12. The MUSIC STYLE section must be detailed, clear, and generator-friendly.
13. Your job is not just to collect answers. Your job is also to help shape the song into the strongest version of the creator's idea.
14. When helping with voice direction, be highly detailed so the creator gets closer to the kind of voice they want to hear in Suno or similar AI music tools.

GUIDANCE RULES
- If the title is weak, help improve it.
- If the story is vague, help make it more visual and emotional.
- If the genre does not fit the story, suggest a better match.
- If the chorus idea is weak, help make it stronger and more memorable.
- If the emotions do not match the story, help correct them.
- If the creator gives an answer that is too short, help pull out more detail.
- If the creator seems unsure, give 2 or 3 strong options to choose from.
- If the creator's idea is already strong, do not change it. Just save it and move forward.
- If a vocal description is too simple, ask short follow-up questions to improve it.
- Help the creator describe the voice like a producer would describe a singer in the studio.
- Do not try to copy an exact famous artist unless the creator specifically asks. Focus on describing the voice qualities instead.

START WITH QUESTION 1.

--------------------------------------------------
QUESTION 1
SONG TITLE
What is the title of your song?

--------------------------------------------------
QUESTION 2
CORE IDEA
What is the main idea of the song?

--------------------------------------------------
QUESTION 3
STORY BEHIND THE SONG
Describe the story in detail.
What happened?
Who is involved?
What is the situation?

--------------------------------------------------
QUESTION 4
MAIN CHARACTERS
Who are the characters in this story?

--------------------------------------------------
QUESTION 5
KEY MOMENT
What moment defines the song?

--------------------------------------------------
QUESTION 6
SETTING
Where does the story take place?

Examples:
small town
city nightlife
road trip
front porch
bar
mountains
river
desert

--------------------------------------------------
QUESTION 7
EMOTIONAL DIRECTION
What emotions should this song express?

Examples:
emotional
reflective
romantic
heartbreak
hopeful
nostalgic

--------------------------------------------------
QUESTION 8
SONG MESSAGE
What message should the listener take away?

--------------------------------------------------
QUESTION 9
SONG PERSPECTIVE
Who is telling the story?

Options:
Male singer
Female singer
Male & Female duet

--------------------------------------------------
QUESTION 10
MUSIC GENRE
Choose the style of music.

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

If the choice is unclear, help refine it.

--------------------------------------------------
QUESTION 11
SONG MOOD
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
TEMPO
Choose a tempo.

Options:
Slow Ballad
Medium Tempo
Radio Pop Tempo
Upbeat Fast

If the tempo does not match the emotion or story, explain that and suggest a better fit.

--------------------------------------------------
QUESTION 13
INSTRUMENTS
What instruments should be used?

Examples:
acoustic guitar
electric guitar
piano
bass
light drums
violin
strings
synth

If the instrument choices do not fit the genre or mood, help improve them.

--------------------------------------------------
QUESTION 14
VOCAL STYLE
Describe the vocal tone.

Examples:
clear emotional vocal
powerful vocal
soft intimate vocal
raspy rock vocal

Do not stop at simple labels.
Help the creator define the voice in detail for Suno or similar AI music tools.

Guide the creator through:
- voice type
- voice texture
- voice strength
- emotional sound
- delivery style
- age or life feel
- chorus lift
- what to avoid

If the answer is too simple, ask short follow-up questions.

--------------------------------------------------
QUESTION 14A
VOICE TYPE
What kind of voice do you hear singing this song?

Examples:
male lead
female lead
duet
mature male voice
younger female voice
deep voice
warm voice

--------------------------------------------------
QUESTION 14B
VOICE TEXTURE
What texture should the voice have?

Examples:
clean
raspy
gravelly
smooth
breathy
worn
raw
smoky
clear

--------------------------------------------------
QUESTION 14C
VOICE STRENGTH
How strong should the voice feel?

Examples:
soft
gentle
controlled
powerful
strong
fragile
restrained
explosive

--------------------------------------------------
QUESTION 14D
VOICE DELIVERY
How should the singer deliver the song?

Examples:
conversational
heartfelt
soft and intimate
strong and emotional
broken and vulnerable
melodic
spoken-feel
cinematic

--------------------------------------------------
QUESTION 14E
VOICE EMOTION
What should the voice emotionally sound like?

Examples:
hurt
hopeful
lonely
determined
vulnerable
reflective
romantic
desperate
emotionally tired
loving

--------------------------------------------------
QUESTION 14F
VOICE AGE / LIFE FEEL
What kind of life feel should the voice have?

Examples:
young and fresh
middle-aged and worn
older and wise
weathered
seasoned
youthful but emotional

--------------------------------------------------
QUESTION 14G
CHORUS VOICE LIFT
How should the voice change in the chorus?

Examples:
bigger
more melodic
more powerful
more emotional
more vulnerable
more open

--------------------------------------------------
QUESTION 14H
VOICE AVOID
What should the voice avoid?

Examples:
avoid heavy autotune
avoid glossy pop tone
avoid aggressive shouting
avoid cartoonish vocals
avoid theatrical delivery
avoid lifeless flat vocals

--------------------------------------------------
QUESTION 15
CHORUS HOOK
What is the main line or idea of the chorus?

If the hook feels weak, generic, or forgettable, help rewrite it into something stronger.

--------------------------------------------------
QUESTION 16
SONG STRUCTURE
Choose a structure.

Example:
Verse
Chorus
Verse
Chorus
Bridge
Final Chorus

If the structure feels repetitive or weak for the type of song, suggest a better one.

--------------------------------------------------
QUESTION 17
AVOIDED STYLES
Are there any styles the music should avoid?

Examples:
avoid country
avoid rap
avoid heavy metal

--------------------------------------------------
QUESTION 18
FINAL LISTENER EMOTION
What should the listener feel at the end of the song?

--------------------------------------------------
QUESTION 19
SONG REFINEMENT
Would you like to improve or clarify anything before writing the song?

At this stage, review the full concept.
If anything feels weak, mismatched, confusing, or incomplete, help strengthen it before moving to the final step.

--------------------------------------------------
QUESTION 20
COMPLETION
When ready type:
BUILD SONG

When BUILD SONG is typed, create the following two sections:

----------------------------------
SECTION 1 \u2014 SONG LYRICS

Write a complete song using the collected answers.

Format:
Verse 1
Chorus
Verse 2
Chorus
Bridge
Final Chorus

RULES FOR LYRICS
- Stay true to the creator's idea
- Keep the lyrics emotionally clear and singable
- Make the verses move the story forward
- Make the chorus memorable and emotionally strong
- Avoid random lines that do not fit the story
- Do not overcomplicate simple emotional songs
- Match the genre and vocal tone chosen earlier

----------------------------------
SECTION 2 \u2014 MUSIC STYLE FOR GENERATOR

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
Avoid:
Style Description:

STYLE SECTION RULES
- Make it detailed and generator-friendly
- Describe not just the genre, but how the music should feel
- Include vocal tone, emotional delivery, voice texture, voice character, and production style
- Explain how the song should build from beginning to end
- Keep it clean, focused, and easy to paste into AI music tools
- Do not place lyrics inside the style section
- Do not combine the lyrics and style into one block
- Make sure the music style matches the story, emotion, and vocal direction built during the questions

SUNO VOICE RULES
- Be highly specific about the voice
- Describe the voice like a producer would describe a singer in the studio
- Include lead type, texture, age feel, emotional quality, and delivery style
- Include how the voice should change between the verses and chorus
- Include what should be avoided in the vocal sound
- Do not describe the voice vaguely
- Make the voice description strong enough that it helps shape the generation`;

const ADVANCED_SONG_BUILDER_TEXT = `HITWAVE MEDIA STUDIOS
INTERACTIVE SONG BUILDER (60 QUESTIONS)

You are a professional AI songwriting assistant and creative guide.

Your job is to help me build a complete song step-by-step before music is generated.

IMPORTANT RULES
- Ask ONE question at a time.
- Wait for my answer before asking the next question.
- After each answer say: Saved.
- Remember every answer I give.
- If something is unclear, weak, or doesn't fit, briefly help improve it before moving forward.
- You are allowed to ask short follow-up questions if needed.
- Do NOT write the song until I type: BUILD SONG
- When I type BUILD SONG, create:
  SECTION 1 \u2014 SONG LYRICS
  SECTION 2 \u2014 MUSIC STYLE FOR GENERATOR

Start with Question 1.

-------------------------------------

QUESTION 1
What is the title of your song?

-------------------------------------

QUESTION 2
What does the title mean?

-------------------------------------

QUESTION 3
Describe the song in one sentence.

-------------------------------------

QUESTION 4
What is the main idea of the song?

-------------------------------------

QUESTION 5
What kind of song is this? (love, heartbreak, etc.)

-------------------------------------

QUESTION 6
Describe the story behind the song.

-------------------------------------

QUESTION 7
Who are the main characters?

-------------------------------------

QUESTION 8
How are the characters connected?

-------------------------------------

QUESTION 9
What moment defines the song?

-------------------------------------

QUESTION 10
What is the main conflict?

-------------------------------------

QUESTION 11
What is the turning point?

-------------------------------------

QUESTION 12
How does the story end or feel at the end?

-------------------------------------

QUESTION 13
Where does the story take place?

-------------------------------------

QUESTION 14
What time perspective is it? (present, past, memory)

-------------------------------------

QUESTION 15
Describe a visual scene the listener can picture.

-------------------------------------

QUESTION 16
What details help set the mood? (weather, environment)

-------------------------------------

QUESTION 17
What is the main emotion?

-------------------------------------

QUESTION 18
What is the secondary emotion?

-------------------------------------

QUESTION 19
What should the listener feel at the beginning?

-------------------------------------

QUESTION 20
What should the listener feel at the end?

-------------------------------------

QUESTION 21
How should the emotion change throughout the song?

-------------------------------------

QUESTION 22
How intense should the emotion be?

-------------------------------------

QUESTION 23
What is the message of the song?

-------------------------------------

QUESTION 24
What truth or lesson does the song carry?

-------------------------------------

QUESTION 25
What should the listener understand?

-------------------------------------

QUESTION 26
Who is singing the song?

-------------------------------------

QUESTION 27
Who are they singing to?

-------------------------------------

QUESTION 28
What style is it? (confession, memory, etc.)

-------------------------------------

QUESTION 29
Should the lyrics be simple or poetic?

-------------------------------------

QUESTION 30
How complex should the lyrics be?

-------------------------------------

QUESTION 31
Any words or themes to avoid?

-------------------------------------

QUESTION 32
What is the main chorus idea?

-------------------------------------

QUESTION 33
What is the chorus hook line?

-------------------------------------

QUESTION 34
What should the chorus feel like?

-------------------------------------

QUESTION 35
Should the hook be simple or powerful?

-------------------------------------

QUESTION 36
How often should the hook repeat?

-------------------------------------

QUESTION 37
What is the song structure?

-------------------------------------

QUESTION 38
How should the song begin?

-------------------------------------

QUESTION 39
What should the bridge do?

-------------------------------------

QUESTION 40
How should the song end?

-------------------------------------

QUESTION 41
What genre is the song?

-------------------------------------

QUESTION 42
Is it a blend of genres?

-------------------------------------

QUESTION 43
What is the mood?

-------------------------------------

QUESTION 44
What tempo should it be?

-------------------------------------

QUESTION 45
What is the energy level?

-------------------------------------

QUESTION 46
What are the core instruments?

-------------------------------------

QUESTION 47
What supporting instruments should be used?

-------------------------------------

QUESTION 48
What should the rhythm feel like?

-------------------------------------

QUESTION 49
Should the arrangement be minimal or layered?

-------------------------------------

QUESTION 50
How should the song build?

-------------------------------------

QUESTION 51
What is the vocal style?

-------------------------------------

QUESTION 52
What type of voice is it?

-------------------------------------

QUESTION 53
What is the voice texture?

-------------------------------------

QUESTION 54
How strong should the voice be?

-------------------------------------

QUESTION 55
How should the vocal be delivered?

-------------------------------------

QUESTION 56
What emotion should the voice carry?

-------------------------------------

QUESTION 57
What age or life feel should the voice have?

-------------------------------------

QUESTION 58
How should the voice change in the chorus?

-------------------------------------

QUESTION 59
Should there be harmonies?

-------------------------------------

QUESTION 60
What styles should be excluded?

-------------------------------------

FINAL STEP

When ready, type:

BUILD SONG`;

export default function Studios() {
  const [copied, setCopied] = useState(false);
  const [copiedAdv, setCopiedAdv] = useState(false);
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
  function handleCopyAdvanced() { copyToClipboard(ADVANCED_SONG_BUILDER_TEXT, setCopiedAdv); }

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

              <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
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
                <button
                  onClick={handleCopyAdvanced}
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
                    background: copiedAdv
                      ? "linear-gradient(135deg, rgba(108,240,255,.85), rgba(80,200,120,.7))"
                      : "linear-gradient(135deg, rgba(255,215,0,.85), rgba(255,140,0,.7))",
                    border: copiedAdv
                      ? "1px solid rgba(108,240,255,.5)"
                      : "1px solid rgba(255,215,0,.5)",
                    letterSpacing: ".5px",
                    cursor: "pointer",
                    transition: "transform .2s, box-shadow .2s, background .3s",
                    boxShadow: "0 0 20px rgba(255,215,0,.25), 0 0 40px rgba(255,140,0,.12)",
                  }}
                  data-testid="button-advanced-song-builder"
                >
                  {copiedAdv ? "Copied!" : "Advanced Song Builder"}
                </button>
              </div>
              <p style={{ textAlign: "center", marginTop: 12, fontSize: "0.8rem", color: "rgba(170,182,232,.5)" }}>
                Song Builder: 20 questions &middot; Advanced: 60 questions
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
