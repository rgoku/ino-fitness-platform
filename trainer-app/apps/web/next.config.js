/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@trainer-app/types', '@trainer-app/ui', '@trainer-app/api'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
