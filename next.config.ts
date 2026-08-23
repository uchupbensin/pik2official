import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // or 'DENY' based on needs, SAMEORIGIN is usually safer if they frame their own content
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self';", // 'none' is stricter, 'self' allows same origin
          }
        ],
      },
    ];
  },
};

export default nextConfig;
