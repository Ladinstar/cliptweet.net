import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n-config';
import { PLATFORM_IDS } from '@/lib/platforms';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://twitter-video-downloader.example';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const platformPaths = PLATFORM_IDS.map((id) => `/${id}`);
  const paths = ['', ...platformPaths, '/about', '/privacy', '/terms', '/contact'];
  const entries: MetadataRoute.Sitemap = [{ url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 }];
  for (const locale of LOCALES) {
    for (const path of paths) {
      const isHome = path === '';
      const isPlatform = platformPaths.includes(path);
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        changeFrequency: isHome || isPlatform ? 'weekly' : 'monthly',
        priority: isHome ? 0.9 : isPlatform ? 0.8 : 0.5,
      });
    }
  }
  return entries;
}
