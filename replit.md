# Hit Wave Media - The Home of AI Music

## Overview
Hit Wave Media is an AI music discovery platform with a cyberpunk/neon dark theme. It features a 3-column layout with genre browsing, trending tracks, top charts, and creator profiles.

## Recent Changes
- 2026-03-05: Admin Dashboard - `/admin` page with platform stats (users, creators, tracks, plays, likes, comments, follows, unique visitors); top tracks by plays and likes; creator leaderboard; recent sign-ups; locked to admin userId 2 only
- 2026-03-05: Terms of Service - full TOS page at /terms; sign-up form requires checking TOS checkbox with updated terms content; "(View Terms)" link opens modal with full terms
- 2026-03-05: Track page sharing fix - storage.getCreator renamed to storage.getCreatorById in /api/track/:id endpoint; Facebook/social crawler handler added for /track/:id with OG meta tags
- 2026-03-05: Dashboard error handling - shows "Failed to load dashboard" with Retry button instead of black screen when data fails to load
- 2026-03-05: Dashboard hooks fix - moved useState/useEffect for live timer before early returns to fix React hooks violation crash
- 2026-03-04: Page navigation header - every sub-page (Top 25, Trending, New Songs, Creator Profile, Track, Sign In, Sign Up, Upload, New Creators) now has a nav bar with Home button + logo at the top; no more getting stuck on a page with no way back
- 2026-03-04: Share button moved to track row - share button (purple icon) now sits next to download button, completely outside the clickable play area; tapping share no longer triggers song playback; uses Web Share API on mobile, clipboard copy on desktop
- 2026-03-03: Individual track pages - each track has its own page at /track/:id; share links now point to track pages instead of creator profiles; GET /api/track/:id endpoint returns track + creator data
- 2026-03-03: Service worker removed - SW now self-destructs and clears all caches; main.tsx unregisters all SWs on load; prevents stale cache issues permanently
- 2026-03-03: Share dropdown improved - native share via Web Share API on mobile, bigger tap targets, tap-outside-to-close overlay, stopPropagation prevents modal from opening when clicking share/like/comment
- 2026-03-03: Creator Dashboard - private stats page for each creator with plays/likes/followers, performance overview, track table with status badges, Top 25 countdown timer, and motivational messages; accessible via button on own profile
- 2026-03-02: Rate limiting - bot/spam protection on signup (5/hr), signin (10/15min), upload (10/hr), plays (60/min), likes (30/min), comments (15/min), follows (30/min)
- 2026-03-02: Service worker fix - HTML/JS/CSS bundles no longer cached by PWA; cache bumped to v3; prevents stale code issues on deploy
- 2026-03-01: AI tool display - "Created with Suno" (or whichever tool) shown under artist name on every track; aiTool column added to tracks table; saved from upload form
- 2026-03-01: Media Session API - car/Bluetooth displays now show song title, artist, and "Hit Wave Media" as album instead of page title
- 2026-03-01: Library button hidden inside creator profile pages (already in the library)
- 2026-02-28: Weekly Top 25 winner system - #1 song each week is crowned, logged in weekly_winners table, and retired from Top 25; Hall of Fame section shows past champions; creators must bring new songs to compete
- 2026-02-28: Embedded artwork extraction - MP3 uploads auto-extract ID3 cover art via music-metadata; uploaded to Cloudinary as coverUrl
- 2026-02-28: Creators can't like own songs - like button hidden for track creators, only shows like count
- 2026-02-28: Share platforms trimmed to Facebook, X, Reddit, LinkedIn, Pinterest only
- 2026-02-28: AI tools list expanded - Suno, Udio, Beatoven.ai, Soundraw, Stable Audio, Mubert, Riffusion, Uberduck AI, MusicGen, Producer AI, Boomy, Ecrett Music, Soundful, Other
- 2026-02-28: Pause button removed from thumbnail/modal during playback
- 2026-02-28: Tagline changed to "AI-Only Music Platform"
- 2026-02-27: Cloudinary integration - uploads now stored in Cloudinary cloud storage instead of local disk; files persist across Render redeploys; env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- 2026-02-27: Audio player mobile fix - wait for canplay event before playing on new tracks; playsinline attribute for iOS
- 2026-02-25: Visitor follows - visitors can follow/unfollow creators without signing in (visitor_follows table); follower count includes both user and visitor follows
- 2026-02-24: Follow system - users can follow/unfollow creators; follower count displayed on creator profiles; follows table in DB
- 2026-02-21: PWA support - manifest.json, service worker, app icons; site is installable on phones as a home screen app
- 2026-02-21: New Songs 7-day rotation - tracks auto-expire from New Songs page after 7 days; tracks table now has created_at column; getNewTracks filters by date
- 2026-02-20: Trending Today dynamic ranking - tracks ranked by today's likes + plays, not a static list; track_plays log table tracks daily play events
- 2026-02-20: Play counter & dynamic Top 25 - play count increments when a new song starts, Top 25 ranked dynamically by like count (ties broken by plays), songs move up/down as likes change
- 2026-02-20: Video pause fix - video thumbnails now pause when audio pauses, removed autoPlay
- 2026-02-20: Likes & comments - every track has like button and independent comment section, shared TrackActions component
- 2026-02-20: Cover image/video upload - tracks can have cover art (image or video) uploaded alongside audio, displayed as thumbnail
- 2026-02-20: Audio player - functional play/pause on tracks with uploaded files, shared audio context across pages
- 2026-02-20: Track delete - creators can delete their own tracks from their profile
- 2026-02-20: File upload - audio file upload via multer, download buttons on creator profiles
- 2026-02-20: Full auth system - signup/signin/signout with localStorage-based auth, upload page with auth gate
- 2026-02-18: Initial build - dark cyberpunk theme, PostgreSQL database with tracks/creators/genres, 3-column responsive layout

## Tech Stack
- Frontend: React + Vite + TailwindCSS + shadcn/ui
- Backend: Express.js
- Database: PostgreSQL with Drizzle ORM
- File Storage: Cloudinary (cloud-based, persists across deploys)
- Routing: wouter
- State: TanStack React Query

## Project Architecture
```
client/src/pages/home.tsx         - Main landing page with all sections
client/src/pages/sign-up.tsx      - Registration page
client/src/pages/sign-in.tsx      - Login page
client/src/pages/upload.tsx       - Track upload (auth required)
client/src/pages/creator-profile.tsx - Individual creator profiles
client/src/pages/track.tsx        - Individual track page (/track/:id) for sharing
client/src/pages/downloads.tsx    - Downloads page with genre sections
client/src/App.tsx                - Router setup
client/src/lib/audioPlayer.tsx     - Shared audio player context for track playback
client/src/components/track-actions.tsx - Shared like/comment component for tracks
shared/schema.ts                  - Database schema (tracks, creators, genres, users, likes, comments, follows, weeklyWinners)
server/routes.ts                  - API endpoints (auth, tracks, creators, genres, likes, comments)
server/storage.ts                 - Database storage layer
server/db.ts                      - Database connection
server/index.ts                   - Express app with session middleware
server/seed.ts                    - Seed data for initial content
```

## API Endpoints
- POST /api/auth/signup - Create account (name, email, password)
- POST /api/auth/signin - Login (email, password)
- POST /api/auth/signout - Logout
- GET /api/auth/me - Get current user
- GET /api/track/:id - Get individual track with creator info (for track pages)
- POST /api/tracks/upload - Upload track (auth required)
- POST /api/tracks/:id/play - Increment play count for a track
- GET /api/tracks/:category - Get tracks by category (trending, new, top25 - top25 is dynamic by likes)
- GET /api/creators - Get all creators
- GET /api/creators/:id - Get creator with tracks
- GET /api/genres - Get all genres
- GET /api/tracks/:id/likes - Get like count and user's like status
- POST /api/tracks/:id/likes - Toggle like (auth required)
- GET /api/tracks/:id/comments - Get comments for a track
- POST /api/tracks/:id/comments - Add comment (auth required)
- DELETE /api/comments/:id - Delete comment (auth required)
- GET /api/creators/:id/followers - Get follower count and user's follow status
- POST /api/creators/:id/follow - Toggle follow (auth required)
- GET /api/users/:id/following - Get count of creators a user follows

## Theme
Dark cyberpunk with neon cyan (#6cf0ff), purple (#a06bff), and pink (#ff4fd8) accent colors on deep dark background (#070a14).

## User Preferences
- None recorded yet
