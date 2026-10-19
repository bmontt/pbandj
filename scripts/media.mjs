#!/usr/bin/env node
// ── media manifest ────────────────────────────────────────────────────────────
// `npm run media`: reads lib/content.json, checks every media file it names
// exists under public/, and writes lib/media.json with each file's size.
// That lets the pages reserve the right box before anything loads (no layout
// shift). It also writes two kinds of derived files under public/generated/
// (safe to delete; this script rebuilds them):
//   posters/…webp  one still per video, shown until the video is played
//   logos/…webp    support-artist logos cropped to their ink, so they can be
//                  sized to equal visual weight
// Needs ffmpeg/ffprobe on PATH for videos (brew install ffmpeg). Originals in
// public/ are never touched.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";

const root = join(dirname(new URL(import.meta.url).pathname), "..");
const pub = (p) => join(root, "public", decodeURI(p));
const content = JSON.parse(readFileSync(join(root, "lib/content.json"), "utf8"));
const manifestPath = join(root, "lib/media.json");
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};

const images = new Set();
const videos = new Set();
const logos = new Set();
for (const e of content.events) for (const m of e.media) (m.type === "video" ? videos : images).add(m.src);
for (const f of content.founders) images.add(f.image);
for (const m of content.collective.moments) images.add(m.src);
for (const a of content.supportArtists) if (a.logo) logos.add(a.logo);

const missing = [...images, ...videos, ...logos].filter((p) => !existsSync(pub(p)));
if (missing.length) {
  console.error(`✗ missing under public/:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

const out = {};

for (const src of images) {
  const m = await sharp(pub(src)).metadata();
  const rotated = (m.orientation ?? 1) >= 5;
  out[src] = { w: rotated ? m.height : m.width, h: rotated ? m.width : m.height };
}

for (const src of logos) {
  const m = await sharp(pub(src)).metadata();
  const name = src.split("/").pop().replace(/\.[^.]+$/, "");
  const trimmed = `/generated/logos/${name}.webp`;
  mkdirSync(dirname(pub(trimmed)), { recursive: true });
  const info = await sharp(pub(src)).trim().webp({ quality: 90 }).toFile(pub(trimmed));
  out[src] = { w: m.width, h: m.height, trimmed, tw: info.width, th: info.height };
}

const probe = (file) => {
  const json = JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation:format=duration", "-of", "json", file]).toString(),
  );
  const s = json.streams[0];
  const rot = Math.abs(Number(s.side_data_list?.find((d) => "rotation" in d)?.rotation ?? 0));
  const turned = rot === 90 || rot === 270;
  return { w: turned ? s.height : s.width, h: turned ? s.width : s.height, duration: Number(json.format?.duration ?? 0) };
};

const scratch = join(tmpdir(), `pbj-media-${process.pid}`);
mkdirSync(scratch, { recursive: true });
for (const src of videos) {
  const file = pub(src);
  const { w, h, duration } = probe(file);
  const poster = `/generated/posters/${src.replace(/^\//, "").replace(/\.[^.]+$/, "")}.webp`;
  if (!existsSync(pub(poster)) || previous[src]?.poster !== poster) {
    // a frame a little way in (the first is often black), auto-rotated by ffmpeg
    const at = Math.min(1.2, Math.max(0, duration * 0.15)).toFixed(2);
    const png = join(scratch, "frame.png");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", at, "-i", file, "-frames:v", "1", png]);
    mkdirSync(dirname(pub(poster)), { recursive: true });
    await sharp(png).resize({ width: 960, height: 960, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toFile(pub(poster));
  }
  out[src] = { w, h, poster };
}
rmSync(scratch, { recursive: true, force: true });

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + "\n");
console.log(`✓ lib/media.json: ${images.size} images, ${videos.size} videos, ${logos.size} logos`);
