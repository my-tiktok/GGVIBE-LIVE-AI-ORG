/** @type {import('next').NextConfig} */
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const buildAllowedDevOrigins = () => {
  const origins = []
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    origins.push(
      'https://ggvibe-chatgpt-ai.org',
      'https://www.ggvibe-chatgpt-ai.org',
      'https://ggvibe-live-ai-1.replit.app'
    )
  } else {
    origins.push('http://localhost:5000', 'http://127.0.0.1:5000')
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.push(
        process.env.REPLIT_DEV_DOMAIN,
        `https://${process.env.REPLIT_DEV_DOMAIN}`
      )
    }
  }

  return origins
}

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: join(__dirname, '..'),
  allowedDevOrigins: buildAllowedDevOrigins(),
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

export default nextConfig
