/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['p16-sign-va.tiktokcdn.com', 'p16-sign.tiktokcdn-us.com'],
  },
  env: {
    TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY,
    TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET,
    TIKTOK_REDIRECT_URI: process.env.TIKTOK_REDIRECT_URI,
    NEXT_PUBLIC_TIKTOK_CLIENT_KEY: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY,
    NEXT_PUBLIC_TIKTOK_REDIRECT_URI: process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI,
  }
}

module.exports = nextConfig
