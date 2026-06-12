import { ImageResponse } from 'next/og';
import { BRAND } from '@/config/brand';
import { getMessages } from '@/lib/messages';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = BRAND.siteName;

export default function OpengraphImage() {
  const m = getMessages('en');
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND.og.background,
        color: 'white',
        fontFamily: 'sans-serif',
        padding: 80,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 120, marginBottom: 20 }}>{BRAND.og.emoji}</div>
      <div style={{ fontSize: 64, fontWeight: 800 }}>{BRAND.siteName}</div>
      <div style={{ fontSize: 34, marginTop: 24, color: BRAND.og.accent }}>{m.home.heroTitle}</div>
    </div>,
    { ...size },
  );
}
