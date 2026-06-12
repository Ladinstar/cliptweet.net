import type { MetadataRoute } from 'next';
import { BRAND } from '@/config/brand';
import { getMessages } from '@/lib/messages';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const m = getMessages('en');
  return {
    name: BRAND.siteName,
    short_name: BRAND.shortName,
    description: m.meta.siteDesc,
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: BRAND.themeColor,
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }],
  };
}
