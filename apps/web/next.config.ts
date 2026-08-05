import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  output: 'standalone',
  poweredByHeader: false,
  images: { remotePatterns: [] },
};

export default nextConfig;
