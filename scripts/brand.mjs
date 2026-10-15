#!/usr/bin/env node
// ── brand assets ──────────────────────────────────────────────────────────────
// `node scripts/brand.mjs`: builds the favicon set and the page mark from the
// blackletter logo (public/pbj_logo_transparent.optimized.webp, cream on
// transparent; the only master there is, a 1024px raster, no SVG):
//   assets/pbj-mark.webp   the mark cropped to its ink (nav, landing)
//   assets/pbj-mark.png    the same as PNG (the OG image renderer can't read WebP)
//   app/icon.png           512px, cream mark on the site's near-black
//   app/apple-icon.png     180px
//   app/favicon.ico        16 + 32 + 48px PNG-in-ICO
// Re-run if the logo changes. Outputs are committed.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(new URL(import.meta.url).pathname), "..");
const src = join(root, "public/pbj_logo_transparent.optimized.webp");
const BG = { r: 8, g: 7, b: 6, alpha: 1 }; // oklch(0.13 0.003 70)

const mark = await sharp(src).trim().toBuffer();
await sharp(mark).webp({ quality: 92, alphaQuality: 100 }).toFile(join(root, "assets/pbj-mark.webp"));
await sharp(mark).png().toFile(join(root, "assets/pbj-mark.png"));

/** the mark centered on the background, `fill` of the square's width */
async function square(size, fill) {
  const w = Math.round(size * fill);
  const inner = await sharp(mark).resize({ width: w, kernel: "lanczos3" }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: inner, gravity: "center" }])
    .png()
    .toBuffer();
}

writeFileSync(join(root, "app/icon.png"), await square(512, 0.8));
writeFileSync(join(root, "app/apple-icon.png"), await square(180, 0.78));

// ICO: a 6-byte header, a 16-byte entry per size, then the PNGs themselves
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => square(s, 0.94)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync(join(root, "app/favicon.ico"), Buffer.concat([header, ...pngs]));
console.log("✓ assets/pbj-mark.{webp,png}, app/icon.png, app/apple-icon.png, app/favicon.ico");
