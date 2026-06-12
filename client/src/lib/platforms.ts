import type { IconType } from 'react-icons';
import { SiX, SiTiktok, SiInstagram, SiReddit, SiFacebook, SiYoutube } from 'react-icons/si';
import { BRAND } from '@/config/brand';

export interface Platform {
  id: string;
  name: string;
  icon: IconType;
  /** Official brand color, used to tint the icon. */
  color: string;
  example: string;
}

// Single source of truth for the supported sources. Ids must not collide with
// the static routes (about/privacy/terms/dmca/contact/admin/admin-login).
export const PLATFORMS: Platform[] = [
  { id: 'twitter', name: 'Twitter / X', icon: SiX, color: '#1d9bf0', example: 'https://x.com/user/status/1234567890' },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: SiTiktok,
    color: '#ff0050',
    example: 'https://www.tiktok.com/@user/video/1234567890',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: SiInstagram,
    color: '#e4405f',
    example: 'https://www.instagram.com/reel/Cxyz/',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: SiReddit,
    color: '#ff4500',
    example: 'https://www.reddit.com/r/sub/comments/abc/title/',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: SiFacebook,
    color: '#1877f2',
    example: 'https://www.facebook.com/watch/?v=1234567890',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: SiYoutube,
    color: '#ff0000',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

export const PLATFORM_IDS = PLATFORMS.map((p) => p.id);

/** Platforms shown in navigation (footer, menus): subpages + the brand focus. */
export const NAV_PLATFORMS = PLATFORMS.filter(
  (p) => p.id === BRAND.focusPlatform || BRAND.subpagePlatforms.includes(p.id),
);

/** The path a platform's downloader lives at on this brand's site. */
export function platformPath(id: string): string {
  return id === BRAND.focusPlatform ? '/' : `/${id}`;
}

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export function isPlatform(id: string | undefined): boolean {
  return !!id && PLATFORM_IDS.includes(id);
}
