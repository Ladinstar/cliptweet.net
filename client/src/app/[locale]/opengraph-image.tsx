import { ImageResponse } from 'next/og';
import { getMessages } from '@/lib/messages';
import { LOCALES, isLocale, isRtl, type Locale } from '@/lib/i18n-config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Twitter Video Downloader';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleOpengraphImage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  // The default OG font can't render non-Latin scripts (e.g. Arabic) — use English there.
  const m = getMessages(isRtl(locale) ? 'en' : locale);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #0c4a6e 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: 80,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 110, marginBottom: 16 }}>⬇️</div>
      <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>{m.home.heroTitle}</div>
      <div style={{ fontSize: 30, marginTop: 24, color: '#7dd3fc' }}>{m.home.heroTag}</div>
    </div>,
    { ...size },
  );
}
