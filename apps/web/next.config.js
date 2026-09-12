/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.sumosta.com',
      },
      {
        protocol: 'https',
        hostname: 'api.sumosta.com',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: 'sumosta-api.sumosta-dev.workers.dev',
        pathname: '/api/media/**',
      },
    ],
  },
  transpilePackages: ['shared'],
};

module.exports = nextConfig;
