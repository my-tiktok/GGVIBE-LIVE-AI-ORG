import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GGVIBE LIVE AI - Your AI-Powered Chat Assistant',
  description: 'Experience the next generation of AI-powered conversations with GGVIBE LIVE AI. Chat, create, and collaborate with intelligent AI assistance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
