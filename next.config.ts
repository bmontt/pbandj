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
    // track artwork on /releases and the founder pages (lib/tracks.ts): Spotify and SoundCloud CDNs
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "*.sndcdn.com" },
    ],
  },
  async redirects() {
    // the v0 site's artist pages, and /sounds from before the section took
    // its original name back ("Latest Releases")
    return [
      { source: "/sounds", destination: "/releases", permanent: true },
      { source: "/artists/p", destination: "/collective/peter", permanent: true },
      { source: "/artists/b", destination: "/collective/brody", permanent: true },
      { source: "/artists/j", destination: "/collective/jack", permanent: true },
      { source: "/artists", destination: "/collective", permanent: true },
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
