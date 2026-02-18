import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'GGVIBE LIVE AI - Your AI-Powered Chat Assistant',
  description: 'Experience the next generation of AI-powered conversations with GGVIBE LIVE AI. Chat, create, and collaborate with intelligent AI assistance.',
  metadataBase: new URL('https://www.ggvibe-chatgpt-ai.org'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'google9f42a96e5d7ac88a',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.ggvibe-chatgpt-ai.org',
    siteName: 'GGVIBE LIVE AI',
    title: 'GGVIBE LIVE AI - Your AI-Powered Chat Assistant',
    description: 'Experience the next generation of AI-powered conversations with GGVIBE LIVE AI.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
