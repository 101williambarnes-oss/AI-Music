# Hit Wave Media - The Home of AI Music

## Overview
Hit Wave Media is an AI music discovery platform with a cyberpunk/neon dark theme. It features a 3-column layout with genre browsing, trending tracks, top charts, and creator profiles.

## Recent Changes
- 2026-02-20: Full auth system - signup/signin/signout with session-based auth, upload page with auth gate, header shows logged-in state
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
shared/schema.ts                  - Database schema (tracks, creators, genres, users)
server/routes.ts                  - API endpoints (auth, tracks, creators, genres)
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
- GET /api/tracks/:category - Get tracks by category (trending, new, top25)
- GET /api/creators - Get all creators
- GET /api/creators/:id - Get creator with tracks
- GET /api/genres - Get all genres

## Theme
Dark cyberpunk with neon cyan (#6cf0ff), purple (#a06bff), and pink (#ff4fd8) accent colors on deep dark background (#070a14).

## User Preferences
- None recorded yet
