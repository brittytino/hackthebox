/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  async rewrites() {
    const apiTarget = process.env.API_INTERNAL_URL || 'http://localhost:43118/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
