/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
