/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const apiTarget = process.env.API_INTERNAL_URL || 'http://localhost:43118/api';
    const backendBase = apiTarget.replace(/\/api\/?$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
      {
        source: '/public/challenges/:path*',
        destination: `${backendBase}/public/challenges/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
