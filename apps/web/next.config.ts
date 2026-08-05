import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  turbopack: {},
  poweredByHeader: false,
  images: { remotePatterns: [] },
};

export default nextConfig;
