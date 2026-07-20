import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mindpulse/shared'],
  experimental: { optimizePackageImports: ['lucide-react'] },
};

export default nextConfig;
