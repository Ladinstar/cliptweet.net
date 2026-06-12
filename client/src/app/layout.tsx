import type { Metadata, Viewport } from 'next';
import Providers from './providers';
import { BRAND, SITE_URL } from '@/config/brand';
import { getMessages } from '@/lib/messages';
import './globals.css';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const en = getMessages('en');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: en.meta.siteTitle,
    template: `%s · ${BRAND.siteName}`,
  },
  description: en.meta.siteDesc,
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: BRAND.shortName, statusBarStyle: 'black-translucent' },
  other: {
    // Modern, non-deprecated counterpart of apple-mobile-web-app-capable.
    'mobile-web-app-capable': 'yes',
    // Static AdSense verification (works even without JS execution).
    ...(ADSENSE_CLIENT ? { 'google-adsense-account': ADSENSE_CLIENT } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: BRAND.themeColor,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) inject
          attributes like `cz-shortcut-listen` on <body> before hydration. */}
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
