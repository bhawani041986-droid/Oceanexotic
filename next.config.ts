import type { NextConfig } from "next";

process.env.NEXT_TELEMETRY_DISABLED = "1";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
  },
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  async rewrites() {
    // Rewrite all PHP endpoints to their Next.js TypeScript API route handlers.
    return [
      {
        source: '/api/:path*.php',
        destination: '/api/:path*',
      },
    ];
  },

};

export default nextConfig;
