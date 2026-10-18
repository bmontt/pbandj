# PB&J Sounds

pbandjsounds.com: the site of PB&J Sounds, an east coast collective and label
for underground house. Peter Gomes (Peter Jacob), Brody Montag (Monty) and
Jack Humphreys.

Vercel deploys `main`.

## Editing content

All copy, events and media references live in **`lib/content.json`**.
[CONTENT.md](CONTENT.md) explains step by step how to add an event, photos or
videos.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the build
npm run e2e        # Playwright: builds and starts a production server on :3200
npm run media      # after adding media: sizes, video posters, trimmed logos
```

One lockfile: `package-lock.json` (npm).

## How it's built

- **Next.js 16 (App Router).** Pages are server components, rendered at build
  and re-rendered hourly where "next up" depends on the date.
  - Client code is limited to small islands: the nav's active state, smooth
    scroll, the motion controller, the countdown and the SoundCloud player.
- **Design system:** `app/globals.css`.
  - oklch tokens: the logo cream on near-black, with one accent color per
    founder (P = Peter #B58657, B = Brody #C44D58, J = Jack #935BAD).
  - A reading-size type scale, a clamp() display scale, a text halo, and
    reduced-motion rules.
  - Fonts: Neue Haas Grotesk Display Medium (`app/fonts`, WOFF2) and Geist Mono.
- **Motion:**
  - [Lenis](https://lenis.dev) smooth scroll, driven by GSAP's ticker.
  - GSAP ScrollTrigger is the only scroll-driven writer (`components/motion.tsx`).
  - Under `prefers-reduced-motion` nothing moves and every word is visible.
- **Background:**
  - The root layout has a slot for the ASCII stage (`<StageRoot />`).
  - Pages tell it where they are with `data-stage-scene`, `data-stage-artist`
    and `data-stage-anchor`.
- **SEO:**
  - Per-page metadata (`lib/meta.ts`).
  - A share card (`app/opengraph-image.tsx`).
  - Icons (`scripts/brand.mjs`), the sitemap, robots, JSON-LD (`lib/schema.ts`)
    and `/llms.txt` (`lib/machine.ts`), all generated from `content.json`.
- **Backend (`app/api/*`):**
  - The demo submission, newsletter and latest-tracks routes.
  - Uses Supabase, Resend and Vercel Blob.

## Environment variables

Set these in Vercel. They are never committed.

| name | used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | submissions, newsletter |
| `RESEND_API_KEY`, `EMAIL_FROM`, `DEMO_RECIPIENT_EMAIL` | submission and newsletter emails |
| `BLOB_READ_WRITE_TOKEN` | submission attachments |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | releases on /sounds |
| `NEXT_PUBLIC_SOUNDCLOUD_PLAYLIST_URL` | the mix playlist on /sounds (optional) |
