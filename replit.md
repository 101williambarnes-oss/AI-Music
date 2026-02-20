# Hit Wave Media - The Home of AI Music

## Overview
Hit Wave Media is an AI music discovery platform with a cyberpunk/neon dark theme. It features a 3-column layout with genre browsing, trending tracks, top charts, and creator profiles.

## Recent Changes
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
- Routing: wouter
- State: TanStack React Query

## Project Architecture
```
client/src/pages/home.tsx         - Main landing page with all sections
client/src/pages/sign-up.tsx      - Registration page
client/src/pages/sign-in.tsx      - Login page
client/src/pages/upload.tsx       - Track upload (auth required)
client/src/pages/creator-profile.tsx - Individual creator profiles
client/src/pages/downloads.tsx    - Downloads page with genre sections
client/src/App.tsx                - Router setup
client/src/lib/audioPlayer.tsx     - Shared audio player context for track playback
client/src/components/track-actions.tsx - Shared like/comment component for tracks
shared/schema.ts                  - Database schema (tracks, creators, genres, users, likes, comments)
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

## Theme
Dark cyberpunk with neon cyan (#6cf0ff), purple (#a06bff), and pink (#ff4fd8) accent colors on deep dark background (#070a14).

## User Preferences
- None recorded yet
