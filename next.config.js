/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
})

const nextConfig = {
  reactStrictMode: true,
  // Empty turbopack config to acknowledge Turbopack usage
  turbopack: {},
}

module.exports = withPWA(nextConfig)
