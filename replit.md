# Hit Wave Media - The Home of AI Music

## Overview
Hit Wave Media is an AI music discovery platform with a cyberpunk/neon dark theme. It features a 3-column layout with genre browsing, trending tracks, top charts, and creator profiles.

## Recent Changes
- 2026-02-18: Initial build - dark cyberpunk theme, PostgreSQL database with tracks/creators/genres, 3-column responsive layout

## Tech Stack
- Frontend: React + Vite + TailwindCSS + shadcn/ui
- Backend: Express.js
- Database: PostgreSQL with Drizzle ORM
- Routing: wouter
- State: TanStack React Query

## Project Architecture
```
client/src/pages/home.tsx    - Main landing page with all sections
client/src/App.tsx           - Router setup
shared/schema.ts             - Database schema (tracks, creators, genres)
server/routes.ts             - API endpoints (/api/tracks/:category, /api/creators, /api/genres)
server/storage.ts            - Database storage layer
server/db.ts                 - Database connection
server/seed.ts               - Seed data for initial content
```

## API Endpoints
- GET /api/tracks/:category - Get tracks by category (trending, new, top25)
- GET /api/creators - Get all creators
- GET /api/genres - Get all genres

## Theme
Dark cyberpunk with neon cyan (#6cf0ff), purple (#a06bff), and pink (#ff4fd8) accent colors on deep dark background (#070a14).

## User Preferences
- None recorded yet
