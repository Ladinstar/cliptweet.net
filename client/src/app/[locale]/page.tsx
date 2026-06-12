import type { Metadata } from 'next';
import HomeView from '@/views/HomeView';
import { getMessages } from '@/lib/messages';
import { buildHomeJsonLd } from '@/lib/jsonLd';
import { altLanguages, isLocale, type Locale } from '@/lib/i18n-config';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const m = getMessages(locale, { homePage: true });
  return {
    title: { absolute: m.meta.siteTitle },
    description: m.meta.siteDesc,
    alternates: { canonical: `/${locale}`, languages: altLanguages('/') },
    openGraph: { title: m.home.heroTitle, description: m.home.heroDesc, url: `/${locale}` },
  };
}

export default function LocaleHomePage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  return (
    <>
      {buildHomeJsonLd(locale, `/${locale}`).map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <HomeView />
    </>
  );
}
