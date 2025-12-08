import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Completely disable turbopack
  experimental: {
    turbo: false,
  },
};

export default nextConfig;