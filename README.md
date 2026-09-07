# Cineflix

Cineflix is a React + Vite web application for discovering and browsing movie content.

## Prerequisites

- Node.js 18+
- npm

## Getting Started

1. Install dependencies:
   - `npm install`
2. Start the development server:
   - `npm run dev`

## TMDB proxy

TMDB requests use `/api/tmdb` so the browser does not connect directly to `api.themoviedb.org`.
For local development, put `TMDB_API_KEY=...` in `.env` (the existing `VITE_TMDB_API_KEY` can remain for compatibility) and restart Vite.

For Cloudflare, set the secret before deploying:

```bash
npx wrangler secret put TMDB_API_KEY
npm run deploy:worker
```

The Worker serves the built frontend and proxies `/api/tmdb/*` to TMDB. Do not put the TMDB key in `VITE_*` variables for production.

### Vercel

Vercel uses `api/tmdb/[...path].js` for the same proxy. Import this project into Vercel with the root directory set to `Frontend`, then add the environment variable `TMDB_API_KEY` for Production, Preview, and Development. Deploy normally; Vercel runs `npm run build` and serves `/api/tmdb/*` through the serverless function.

## Available Scripts

- `npm run dev` – Start local development server
- `npm run build` – Build for production
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint checks

