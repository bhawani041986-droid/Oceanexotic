import type { NextConfig } from "next";

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
    ],
  },
  async rewrites() {
    // If DATABASE_URL is set, we are running online with Supabase.
    // Rewrite all PHP endpoints to their Next.js TypeScript API route handlers.
    const isOnline = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
    
    if (isOnline) {
      return [
        {
          source: '/api/:path*.php',
          destination: '/api/:path*',
        },
      ];
    }

    // Local development fallback to XAMPP PHP server
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8081/FISH_MARKET/api/:path*',
      },
    ];
  },

};

export default nextConfig;
