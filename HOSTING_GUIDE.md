# Hit Wave Media - Hosting Guide

## What You Need on Your New Host

1. **Node.js** version 18 or newer
2. **PostgreSQL** database (version 14 or newer)
3. A server that can run Node.js apps (e.g., Railway, Render, DigitalOcean, Vercel, Fly.io, VPS)

---

## Step-by-Step Setup

### 1. Upload Your Files

Upload all project files to your new host. The important folders/files are:

```
client/          - Frontend code
server/          - Backend code
shared/          - Shared types and database schema
script/          - Build scripts
uploads/         - User-uploaded audio/video/image files
package.json     - Dependencies
drizzle.config.ts - Database config
tsconfig.json    - TypeScript config
vite.config.ts   - Frontend build config
```

### 2. Set Environment Variables

You need to set these on your new host:

| Variable       | Description                              | Example                                          |
|----------------|------------------------------------------|--------------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string             | `postgresql://user:password@host:5432/dbname`    |
| `SESSION_SECRET` | Any random secret string (32+ chars)   | `my-super-secret-key-change-this-to-something-random` |
| `PORT`         | Port to run on (optional, defaults to 5000) | `5000`                                        |
| `NODE_ENV`     | Set to "production"                      | `production`                                     |

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up the Database

This creates all the database tables automatically:

```bash
npm run db:push
```

### 5. Build the App

This builds both the frontend and backend for production:

```bash
npm run build
```

### 6. Start the App

```bash
npm start
```

The app will be available at `http://your-server:5000`

---

## Quick Start Commands (All-in-One)

```bash
npm install
npm run db:push
npm run build
npm start
```

---

## Database Tables

The app automatically creates these tables:

- **users** - User accounts (name, email, password)
- **creators** - Creator profiles (linked to users)
- **tracks** - Music tracks (title, artist, genre, file URLs, play count)
- **genres** - Music genres
- **likes** - Track likes from logged-in users
- **visitor_likes** - Track likes from anonymous visitors
- **track_plays** - Daily play count log for trending
- **comments** - Track comments
- **session** - Login sessions (created automatically)

---

## Uploaded Files

User-uploaded audio, video, and images are stored in the `uploads/` folder. Make sure to:
- Copy the `uploads/` folder to your new host
- Ensure the folder has write permissions so new uploads work

---

## Popular Hosting Options

### Railway (easiest)
1. Connect your GitHub repo or upload files
2. Add a PostgreSQL database from the Railway dashboard
3. Set environment variables in the dashboard
4. Railway auto-detects Node.js and runs `npm run build` then `npm start`

### Render
1. Create a new Web Service
2. Connect your repo
3. Build command: `npm install && npm run db:push && npm run build`
4. Start command: `npm start`
5. Add a PostgreSQL database from the Render dashboard
6. Set environment variables

### DigitalOcean App Platform
1. Create a new app from your repo
2. Add a managed PostgreSQL database
3. Build command: `npm install && npm run build`
4. Run command: `npm start`
5. Set environment variables

### VPS (DigitalOcean Droplet, AWS EC2, etc.)
1. Install Node.js 18+ and PostgreSQL
2. Upload your files
3. Set environment variables in `.env` or shell profile
4. Run the quick start commands above
5. Use PM2 to keep the app running: `npx pm2 start dist/index.cjs`

---

## Troubleshooting

- **App won't start**: Make sure `DATABASE_URL` and `SESSION_SECRET` are set
- **Database errors**: Run `npm run db:push` to create/update tables
- **Uploads not working**: Make sure the `uploads/` folder exists and is writable
- **Build fails**: Make sure you have Node.js 18+ installed
- **Port issues**: Set the `PORT` environment variable to match your host's requirements
