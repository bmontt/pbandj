/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable webpack 5 with WebAssembly support for shaders and three.js
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    return config;
  },

  // Image optimization for Vercel
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.blob.vercel-storage.com",
      },
    ],
  },

  // Enable experimental features for optimal Vercel performance
  experimental: {
    esmExternals: true,
  },
};

export default nextConfig;
