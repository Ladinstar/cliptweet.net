import type { Metadata } from 'next';
import LegalPage from '@/views/LegalPage';
import { getMessages } from '@/lib/messages';
import { buildBreadcrumb } from '@/lib/jsonLd';
import { altLanguages, isLocale, type Locale } from '@/lib/i18n-config';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  return {
    title: getMessages(locale).pages.dmca.title,
    alternates: { canonical: `/${locale}/dmca`, languages: altLanguages('/dmca') },
  };
}

export default function DmcaPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const crumb = buildBreadcrumb(locale, getMessages(locale).pages.dmca.title, '/dmca');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumb) }} />
      <LegalPage baseKey="pages.dmca" />
    </>
  );
}
