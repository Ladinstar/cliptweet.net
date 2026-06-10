import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n-config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://twitter-video-downloader.example';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/about', '/privacy', '/terms', '/contact'];
  const entries: MetadataRoute.Sitemap = [{ url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 }];
  for (const locale of LOCALES) {
    for (const path of paths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 0.9 : 0.5,
      });
    }
  }
  return entries;
}
