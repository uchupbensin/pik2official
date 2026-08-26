import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  middlewareClientMaxBodySize: '50mb',
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
