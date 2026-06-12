// White-label brand registry. The brand is fixed at build time via
// NEXT_PUBLIC_BRAND (inlined by Next), so one codebase produces N sites:
//   next build                              -> multi-platform site (default)
//   NEXT_PUBLIC_BRAND=tiktok  next build    -> TokSaver  (TikTok-focused)
//   NEXT_PUBLIC_BRAND=twitter next build    -> TweetSaver (Twitter/X-focused)
// Brand texts live in src/locales/*.json under the `brands.<id>` key and are
// deep-merged over the base translations (see lib/messages.ts and i18n.ts).

export type BrandId = 'multi' | 'tiktok' | 'twitter';

export interface Brand {
  id: BrandId;
  /** Public site name (header, footer, OG image, manifest, title template). */
  siteName: string;
  /** Short name for the PWA manifest / home-screen icon. */
  shortName: string;
  /** Platform whose downloader IS the home page (null = generic multi-platform home). */
  focusPlatform: string | null;
  /** Fallback when NEXT_PUBLIC_SITE_URL is not provided at build time. */
  defaultSiteUrl: string;
  themeColor: string;
  og: { background: string; accent: string; emoji: string };
  /** Platform ids that get their own /<locale>/<platform>/ subpage on this site. */
  subpagePlatforms: string[];
}

// YouTube is deliberately excluded from the niche brands: Google reviews
// AdSense applications and a YouTube downloader page is the #1 rejection cause.
const BRANDS: Record<BrandId, Brand> = {
  multi: {
    id: 'multi',
    siteName: 'Twitter Video Downloader',
    shortName: 'TVD',
    focusPlatform: null,
    defaultSiteUrl: 'https://twitter-video-downloader.example',
    themeColor: '#0ea5e9',
    og: { background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #0c4a6e 100%)', accent: '#7dd3fc', emoji: '⬇️' },
    subpagePlatforms: ['twitter', 'tiktok', 'instagram', 'reddit', 'facebook', 'youtube'],
  },
  tiktok: {
    id: 'tiktok',
    siteName: 'TokSaver',
    shortName: 'TokSaver',
    focusPlatform: 'tiktok',
    defaultSiteUrl: 'https://toksaver.example',
    themeColor: '#fe2c55',
    og: { background: 'linear-gradient(135deg, #010101 0%, #161823 55%, #3b0a1e 100%)', accent: '#25f4ee', emoji: '🎵' },
    subpagePlatforms: ['twitter', 'instagram', 'reddit', 'facebook'],
  },
  twitter: {
    id: 'twitter',
    siteName: 'TweetSaver',
    shortName: 'TweetSaver',
    focusPlatform: 'twitter',
    defaultSiteUrl: 'https://tweetsaver.example',
    themeColor: '#1d9bf0',
    og: { background: 'linear-gradient(135deg, #020617 0%, #0f1419 55%, #0c3a5e 100%)', accent: '#7dd3fc', emoji: '🐦' },
    subpagePlatforms: ['tiktok', 'instagram', 'reddit', 'facebook'],
  },
};

function resolveBrand(): Brand {
  const id = process.env.NEXT_PUBLIC_BRAND as BrandId | undefined;
  return (id && BRANDS[id]) || BRANDS.multi;
}

export const BRAND: Brand = resolveBrand();

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || BRAND.defaultSiteUrl;
