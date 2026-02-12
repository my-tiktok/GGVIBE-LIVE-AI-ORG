import type { Metadata } from 'next'
import { Providers } from '@/components/auth/providers'

export const metadata: Metadata = {
  title: 'GGVIBE LIVE AI - Your AI-Powered Chat Assistant',
  description: 'Experience the next generation of AI-powered conversations with GGVIBE LIVE AI. Chat, create, and collaborate with intelligent AI assistance.',
  metadataBase: new URL('https://ggvibe-chatgpt-ai.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ggvibe-chatgpt-ai.org',
    siteName: 'GGVIBE LIVE AI',
    title: 'GGVIBE LIVE AI - Your AI-Powered Chat Assistant',
    description: 'Experience the next generation of AI-powered conversations with GGVIBE LIVE AI.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
