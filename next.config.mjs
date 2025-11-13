const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable Next.js image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Image formats in order of preference
    formats: ['image/webp', 'image/avif'],
    // Note: Quality is set per Image component, not globally
  },
  turbopack: {},
}


export default nextConfig;
