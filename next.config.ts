import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'marcconrad.com' },
    ],
  },
};

export default nextConfig;
