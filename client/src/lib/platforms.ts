export interface Platform {
  id: string;
  name: string;
  icon: string;
  example: string;
}

// Single source of truth for the supported sources. Ids must not collide with
// the static routes (about/privacy/terms/contact/admin/admin-login).
export const PLATFORMS: Platform[] = [
  { id: 'twitter', name: 'Twitter / X', icon: '𝕏', example: 'https://x.com/user/status/1234567890' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', example: 'https://www.tiktok.com/@user/video/1234567890' },
  { id: 'instagram', name: 'Instagram', icon: '📸', example: 'https://www.instagram.com/reel/Cxyz/' },
  { id: 'reddit', name: 'Reddit', icon: '👽', example: 'https://www.reddit.com/r/sub/comments/abc/title/' },
  { id: 'facebook', name: 'Facebook', icon: '📘', example: 'https://www.facebook.com/watch/?v=1234567890' },
];

export const PLATFORM_IDS = PLATFORMS.map((p) => p.id);

export function getPlatform(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

export function isPlatform(id: string | undefined): boolean {
  return !!id && PLATFORM_IDS.includes(id);
}
