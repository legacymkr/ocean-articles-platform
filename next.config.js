/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed standalone output to fix static asset serving
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:locale(ar|zh|ru|de|fr|hi)/:path*',
        destination: '/:locale/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip database-dependent route handlers during build
  outputFileTracingExcludes: {
    '/api/**': ['./node_modules/@prisma/engines/**'],
  },
};

module.exports = nextConfig;
