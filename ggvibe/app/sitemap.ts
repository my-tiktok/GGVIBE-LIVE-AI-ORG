import { MetadataRoute } from 'next';

const CANONICAL_FALLBACK = 'https://www.ggvibe-chatgpt-ai.org';

function getSitemapBaseUrl() {
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  if (!nextAuthUrl) {
    return CANONICAL_FALLBACK;
  }

  try {
    return new URL(nextAuthUrl).toString().replace(/\/$/, '');
  } catch {
    return CANONICAL_FALLBACK;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSitemapBaseUrl();
  const publicRoutes = ['/', '/privacy', '/terms'];

  return publicRoutes.map((path, index) => ({
    url: `${baseUrl}${path === '/' ? '' : path}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : 0.5,
  }));
}
