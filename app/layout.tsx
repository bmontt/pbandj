import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import SmoothScroll from "@/components/smooth-scroll";
import Motion from "@/components/motion";
import JsonLd from "@/components/json-ld";
import { content, ORIGIN } from "@/lib/content";
import { musicGroupLd } from "@/lib/schema";
import "./globals.css";

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Neue Haas Grotesk Display Medium: a lossless WOFF2 of public/fonts/*.ttf
// (¼ the bytes). Commercial Type font; web licence unverified.
const neueHaas = localFont({
  src: "./fonts/NeueHaasDisplayMedium.woff2",
  weight: "500",
  display: "swap",
  variable: "--font-neue",
});

const { site } = content;

export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  // the original site's title was "PB&J"
  title: { default: site.short, template: `%s · ${site.short}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { siteName: site.name, type: "website", locale: "en_US", url: ORIGIN },
  twitter: { card: "summary_large_image" },
  // the machine-readable face (app/llms.txt)
  alternates: { types: { "text/plain": "/llms.txt" } },
};

export const viewport: Viewport = {
  themeColor: "#080706",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistMono.variable} ${neueHaas.variable} antialiased`}>
      <body>
        {/* ── stage slot ─────────────────────────────────────────────────────
            The ASCII background (revamp-stage) mounts here as <StageRoot />,
            replacing this plain CSS fallback. It reads data-stage-scene on each
            page's <main>, data-stage-artist on founder pages, and dims behind
            every [data-stage-anchor]. */}
        <div aria-hidden="true" className="stage-box stage-fallback" />
        {children}
        <SmoothScroll />
        <Motion />
        <JsonLd data={musicGroupLd()} />
        {/* only on Vercel: elsewhere its script 404s */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
