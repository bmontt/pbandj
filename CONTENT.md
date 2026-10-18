# Editing the site's content

Everything you read on pbandjsounds.com comes from one file: **`lib/content.json`**.
That covers events, bios, gear, the collective blurb, the join copy, and also the
sitemap, the search-engine data and `/llms.txt`.

Edit that file, drop your media into `public/`, and open a pull request.
Brody reviews and merges it. Vercel deploys `main` on its own.

You never need to touch a component to add content.

---

## Add an event

### 1. Drop the media into `public/`

- Put Jack's events in `public/JackEvents/compressed/` and Brody's in `public/BrodyEvents/`.
- Use short file names with no spaces, like `waterfront4.webp` or `bb3.mp4`.
- **Photos:** they must be WebP, because `.gitignore` leaves JPG and PNG files
  out of the repo.
  - Drop JPG/PNG files in, then run `npm run optimize-images`. It writes a
    `name.optimized.webp` next to each one. Use that file in `content.json`.
  - The site resizes and converts every photo for each screen, but keep each
    one under about 3 MB anyway.
- **Videos:** MP4 (H.264) plays everywhere. A `.MOV` from an iPhone often won't
  play in Chrome, so export or convert it to MP4. Keep each video under about
  20 MB if you can.
  - Videos never autoplay. They show a still frame (the poster) until someone
    presses play, and they start muted.

### 2. Add an entry to `"events"` in `lib/content.json`

Copy an existing entry and change it.

Order doesn't matter, because the site sorts events by date. Here is one
written out in full:

```json
{
  "slug": "waterfront-hotel-2026-03",
  "title": "Waterfront Hotel",
  "date": "2026-03-14",
  "crew": ["j"],
  "description": "Jack provided the lighting design for a show at the Waterfront with Offstage.",
  "media": [
    { "type": "image", "src": "/JackEvents/compressed/waterfront4.webp" },
    { "type": "video", "src": "/JackEvents/compressed/wf4.mp4" }
  ],
  "links": [{ "label": "tickets", "href": "https://…" }]
}
```

| field | what to put |
|---|---|
| `slug` | The page address: `pbandjsounds.com/events/<slug>`. Use lowercase words joined by hyphens, and end it with the date so it is unique, e.g. `bass-barn-2026-02`. **Don't change it once it is live,** because links to it would break. |
| `title` | The venue or the name of the night, as you would write it on a flyer. Brody's sets add the city in parentheses, e.g. `"Soundcheck (DC)"`. |
| `date` | An ISO date at the precision you know (see the next table). |
| `crew` | Who was involved: `"p"` for Peter, `"b"` for Brody, `"j"` for Jack. Use one or more. |
| `description` | One or two sentences, or `""` if there is nothing to say yet. |
| `media` | Photos and videos in the order you want them shown. The first photo becomes the event's cover in lists. |
| `links` | Optional, e.g. tickets or a recap. |

These are the date formats:

| you know | write | what the site does |
|---|---|---|
| the month | `"2026-03"` | It shows "march 2026". The event is listed as upcoming only while March is still ahead. |
| the day | `"2026-03-14"` | It shows "march 14, 2026". The event stays upcoming through that day (Eastern time). |
| doors | `"2026-03-14T22:00-04:00"` | The countdown becomes exact to the hour. Use `-05:00` in winter and `-04:00` in summer. |

For an upcoming show, give at least the day. That puts it at the top of
`/events` as "next up", with a countdown. It also appears on the home page.
The site checks the date every hour and moves the show to the archive on its own.

### 3. Run the media script

```bash
npm run media
```

This step:

- checks that every file named in `content.json` exists;
- records each file's size, so the page doesn't jump while things load;
- makes a poster frame for each video in `public/generated/posters/`.

It needs ffmpeg, which you can install with `brew install ffmpeg`.

Commit `lib/media.json` and `public/generated/` along with your media.

If you forget this step, the site still works. New videos just show a plain
tile until they are played.

### 4. Check it, then open the pull request

```bash
npm run dev
```

Open `http://localhost:3000/events` and check your event. If an entry is broken
(a bad date, a duplicate slug, an unknown crew letter), the site refuses to build
and names the entry. Fix what it says.

---

## Other things you can edit

All of these are in `lib/content.json`:

- **Bios, quotes, gear, socials:** under `"founders"`. Each paragraph of a bio
  is its own string in the `"bio"` list.
- **Support logos:** under `"supportArtists"`. Put the image in
  `public/artistLogos/`, add `{ "name": …, "logo": … }`, and run `npm run media`.
- **The six photos at the top of /events (the original "Highlights"):** under
  `"highlights" › "photos"`. Each one needs `src` and `alt`. The `alt` is a
  short description of what the photo shows, for people using screen readers.
- **Section labels and headings, the collective blurb, the join copy:**
  `"collective"`, `"highlights"`, `"releases"`, `"join"` and `"founderLabels"`.
  They are the original site's words. Change them only if Brody asks.

## Please don't

- Delete or rename files in `public/` that an event already uses. Search
  `content.json` for the file name first.
- Edit `public/generated/`. The media script rebuilds it.
- Touch `app/api/` or the submission form. Those belong to the backend.
