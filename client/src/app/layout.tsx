import type { Metadata, Viewport } from 'next';
import Providers from './providers';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://twitter-video-downloader.example';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Twitter Video Downloader — Télécharge des vidéos Twitter / X en MP4',
    template: '%s · Twitter Video Downloader',
  },
  description:
    "Télécharge gratuitement des vidéos Twitter / X en MP4, en haute qualité, à partir d'un simple lien. Choisis la résolution et récupère le fichier en un clic.",
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'TVD', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
