import type { NextConfig } from "next";

// Security headers on every response. No CSP yet: Vercel Analytics and the
// SoundCloud/Spotify links would each need an allowance, and a wrong policy
// breaks the page silently. frame-ancestors is covered by X-Frame-Options.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

// Jack's media folders change only when someone commits new files, so a day
// of caching plus a week of stale-while-revalidate is safe.
const mediaCache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    // track artwork from the music page (lib/tracks.ts): Spotify and SoundCloud CDNs
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "*.sndcdn.com" },
    ],
  },
  async redirects() {
    return [
      // the v0 site's artist pages
      { source: "/artists/p", destination: "/about/peter", permanent: true },
      { source: "/artists/b", destination: "/about/brody", permanent: true },
      { source: "/artists/j", destination: "/about/jack", permanent: true },
      { source: "/artists", destination: "/about", permanent: true },
      // the sections' earlier names
      { source: "/sounds", destination: "/music", permanent: true },
      { source: "/collective", destination: "/about", permanent: true },
      { source: "/collective/:slug", destination: "/about/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/BrodyEvents/:path*", headers: mediaCache },
      { source: "/JackEvents/:path*", headers: mediaCache },
      { source: "/artistLogos/:path*", headers: mediaCache },
    ];
  },
};

export default nextConfig;
