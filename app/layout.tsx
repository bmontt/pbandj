import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// Neue Haas Grotesk Display Medium: a lossless WOFF2 of the TTF in
// public/fonts (¼ the bytes). Licence for web use unverified (Commercial Type).
const neueHaas = localFont({
  src: "./fonts/NeueHaasDisplayMedium.woff2",
  weight: "500",
  display: "swap",
  variable: "--font-neue",
});

export const metadata: Metadata = {
  title: "PB&J Sounds",
  description:
    "East coast-based music collective and record label focused on bringing underground uk/minimal house to the forefront of electronic music.",
};

export const viewport: Viewport = {
  themeColor: "#121110",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistMono.variable} ${neueHaas.variable} antialiased`}>
      <body>
        <div aria-hidden="true" className="stage-box stage-fallback" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
