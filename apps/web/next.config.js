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
    ],
  },
  transpilePackages: ['shared'],
};

module.exports = nextConfig;
