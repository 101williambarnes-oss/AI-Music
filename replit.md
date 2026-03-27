# Hit Wave Media - The Home of AI Music

## Overview
Hit Wave Media is an AI music discovery platform designed for music creators. It features a cyberpunk/neon dark theme and allows users to discover, upload, and manage AI-generated music. The platform aims to be the go-to destination for AI-only music, offering a visual landing page with trending songs, new releases, new creators, and a persistent bottom player bar for seamless playback. Key capabilities include album creation, personalized AI DJ intros, and robust social features like liking, commenting, sharing, and following creators. The project's ambition is to build a vibrant community around AI music and provide creators with tools to showcase and monetize their work.

## User Preferences
- None recorded yet

## System Architecture
The platform is built with a React, Vite, TailwindCSS, and shadcn/ui frontend, an Express.js backend, and a PostgreSQL database utilizing Drizzle ORM. Cloudinary is used for cloud-based file storage, ensuring persistence across deployments. Wouter handles client-side routing, and TanStack React Query manages state.

**Key Features and Design Decisions:**
*   **User Interface (UI/UX):**
    *   Dark cyberpunk theme with neon cyan, purple, and pink accent colors on a deep dark background.
    *   Responsive design for desktop, tablet, and mobile, adapting layouts and components.
    *   Persistent bottom player bar for continuous music playback across pages.
    *   Visual landing page with a 3-column layout (Top 25, New Songs, New Creators + Trending) which adapts responsively.
    *   Dedicated individual pages for tracks and albums with shareable links and social metadata.
    *   "Clean Mode" toggle to filter explicit content.
    *   Installable as a Progressive Web App (PWA) with manifest and service worker.
    *   Jukebox page for public display, featuring a scrollable grid of tracks with minimal UI.
*   **Music Playback & Management:**
    *   Integrated audio/video player supporting both audio-only and M4V/MP4 files, using a hidden `<video>` element for versatility.
    *   Direct-to-Cloudinary uploads for audio/video files (up to 200MB) bypassing server size limits, with signed uploads and progress status.
    *   AI DJ William Allen provides personalized voice intros for each song using OpenAI Assistant and ElevenLabs TTS, cached for performance.
    *   Creators can create albums, adding existing tracks or uploading new ones during album creation, with a live preview.
    *   Dynamic ranking systems for "Trending" (by plays/likes) and "Top 25" (by likes, ties by plays), with a weekly winner system retiring #1 songs to a "Hall of Fame."
    *   Media Session API integration for enhanced control and display on external devices (car, Bluetooth).
    *   Embedded artwork extraction from MP3s on upload.
*   **Creator & User Features:**
    *   Comprehensive authentication system with sign-up, sign-in, sign-out, and password reset flows, including improved error messaging.
    *   Creator Dashboard providing private stats (plays, likes, followers), track management, and motivational messages.
    *   Visitor tracking for analytics, logging unique visitors and page views.
    *   Social features: liking, commenting, sharing (Web Share API on mobile, clipboard on desktop), and following creators (both logged-in users and anonymous visitors).
    *   Rate limiting implemented across various endpoints to prevent spam and abuse.
    *   Admin Dashboard for platform oversight, displaying statistics, top content, and user management.
*   **Technical Implementation:**
    *   API endpoints for authentication, track management (upload, play, like, comment, delete), creator profiles, genres, and platform data.
    *   Database schema includes tables for tracks, creators, genres, users, likes, comments, follows, albums, albumTracks, weeklyWinners, site_visits, and visitor_follows.
    *   Sitemap and robots.txt for SEO, dynamically listing pages and tracks.

## External Dependencies
*   **Cloudinary:** Cloud-based storage and media management for audio, video, and cover art uploads.
*   **PostgreSQL:** Relational database for all application data.
*   **Drizzle ORM:** Object-Relational Mapper for database interactions.
*   **OpenAI Assistant API:** Used by AI DJ William Allen for generating song intro scripts.
*   **ElevenLabs TTS:** Text-to-speech service for generating AI DJ voice intros.
*   **Resend:** Email API for password reset and welcome emails.
*   **music-metadata:** Library for extracting ID3 tags and cover art from MP3 files.
*   **Suno, Udio, Beatoven.ai, Soundraw, Stable Audio, Mubert, Riffusion, Uberduck AI, MusicGen, Producer AI, Boomy, Ecrett Music, Soundful, Other:** Various AI music generation tools; names displayed for attribution.