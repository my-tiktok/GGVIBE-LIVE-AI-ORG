/** @type {import('next').NextConfig} */

const buildAllowedDevOrigins = () => {
  const origins = []
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    origins.push(
      'https://ggvibe-chatgpt-ai.org',
      'https://www.ggvibe-chatgpt-ai.org'
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

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    origins.push(process.env.NEXT_PUBLIC_SITE_URL)
  }

  return origins
}

const nextConfig = {
  reactStrictMode: true,
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
