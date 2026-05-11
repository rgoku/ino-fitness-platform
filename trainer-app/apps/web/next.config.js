/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@trainer-app/types', '@trainer-app/ui', '@trainer-app/api'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
