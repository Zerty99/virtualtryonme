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
  // Увеличиваем лимит размера тела запроса для загрузки изображений
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
