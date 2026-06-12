import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/brand';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The API and admin area must never be indexed (any locale).
      disallow: ['/api/', '/*/admin', '/*/admin-login'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
