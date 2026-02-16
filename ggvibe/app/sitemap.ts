import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.ggvibe-chatgpt-ai.org';

  const publicRoutes = ['/', '/privacy', '/terms', '/login'];

  return publicRoutes.map((path, index) => ({
    url: `${baseUrl}${path === '/' ? '' : path}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : 0.5,
  }));
}
