import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlatformView from '@/views/PlatformView';
import { getMessages } from '@/lib/messages';
import { buildPlatformJsonLd } from '@/lib/jsonLd';
import { altLanguages, isLocale, LOCALES, type Locale } from '@/lib/i18n-config';
import { PLATFORM_IDS, getPlatform, isPlatform } from '@/lib/platforms';

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PLATFORM_IDS.map((platform) => ({ locale, platform })));
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
  if (!isPlatform(params.platform)) notFound();
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
