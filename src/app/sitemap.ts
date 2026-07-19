import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://oceanexotic.com';
  
  // Base routes
  const routes = [
    '',
    '/customer/products',
    '/customer/recipes',
    '/customer/orders',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...routes];
}
