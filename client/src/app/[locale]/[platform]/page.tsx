import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlatformView from '@/views/PlatformView';
import { getMessages } from '@/lib/messages';
import { buildPlatformJsonLd } from '@/lib/jsonLd';
import { altLanguages, isLocale, LOCALES, type Locale } from '@/lib/i18n-config';
import { getPlatform, isPlatform } from '@/lib/platforms';
import { BRAND } from '@/config/brand';

export const dynamicParams = false;

// Only the brand's subpage platforms are built — on a focused brand the focus
// platform's downloader IS the home page.
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => BRAND.subpagePlatforms.map((platform) => ({ locale, platform })));
}

export function generateMetadata({ params }: { params: { locale: string; platform: string } }): Metadata {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const m = getMessages(locale) as unknown as { platform: Record<string, { title?: string; heroDesc?: string }> };
  const p = m.platform?.[params.platform];
  const name = getPlatform(params.platform)?.name || params.platform;
  return {
    title: p?.title || `${name} Video Downloader`,
    description: p?.heroDesc,
    alternates: { canonical: `/${locale}/${params.platform}`, languages: altLanguages(`/${params.platform}`) },
  };
}

export default function PlatformPage({ params }: { params: { locale: string; platform: string } }) {
  if (!isPlatform(params.platform) || !BRAND.subpagePlatforms.includes(params.platform)) notFound();
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const name = getPlatform(params.platform)?.name || params.platform;

  return (
    <>
      {buildPlatformJsonLd(locale, params.platform, name).map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <PlatformView platformId={params.platform} />
    </>
  );
}
