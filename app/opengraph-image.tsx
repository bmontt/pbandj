// The share card for every page: the blackletter mark in the logo cream on the
// site's near-black, the name under it, and the founders' rule (P, B, J in
// their colors). Rendered once at build.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { content } from "@/lib/content";

export const alt = "PB&J Sounds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const mark = `data:image/png;base64,${await readFile(join(process.cwd(), "assets/pbj-mark.png"), "base64")}`;
const neue = await readFile(join(process.cwd(), "public/fonts/NeueHaasDisplayMedium.ttf"));

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080706",
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(181,134,87,0.14), transparent 45%), radial-gradient(circle at 50% 100%, rgba(196,77,88,0.10), transparent 45%), radial-gradient(circle at 82% 30%, rgba(147,91,173,0.14), transparent 45%)",
          fontFamily: "Neue",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mark} width={560} height={285} alt="" />
        <div style={{ display: "flex", marginTop: 44, fontSize: 38, letterSpacing: "-0.02em", color: "rgba(245,235,220,0.78)" }}>
          {content.site.name}
        </div>
        <div style={{ display: "flex", marginTop: 30, width: 300, height: 3 }}>
          <div style={{ flex: 1, background: "#B58657" }} />
          <div style={{ flex: 1, background: "#C44D58" }} />
          <div style={{ flex: 1, background: "#935BAD" }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Neue", data: neue, weight: 500, style: "normal" }] },
  );
}
