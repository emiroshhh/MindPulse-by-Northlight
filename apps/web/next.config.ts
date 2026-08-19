import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mindpulse/shared'],
  experimental: { optimizePackageImports: ['lucide-react'] },
  async redirects() {
    return [
      { source: '/', destination: '/en', permanent: true },
      { source: '/why', destination: '/en/why', permanent: true },
      { source: '/beta', destination: '/en/beta', permanent: true },
      { source: '/case-study', destination: '/en/case-study', permanent: true },
      { source: '/impact', destination: '/en/impact', permanent: true },
      { source: '/privacy', destination: '/en/privacy', permanent: true },
      {
        source: '/ai-study-planner',
        destination: '/en/ai-study-planner',
        permanent: true,
      },
      {
        source: '/catch-up-on-schoolwork',
        destination: '/en/catch-up-on-schoolwork',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
