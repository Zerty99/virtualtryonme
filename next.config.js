/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  },
  images: {
    domains: ['via.placeholder.com'],
    unoptimized: true
  },
  // Отключаем SWC для совместимости с Vercel
  swcMinify: false,
}

module.exports = nextConfig
