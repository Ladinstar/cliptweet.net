import type { Metadata } from 'next';
import LegalPage from '@/views/LegalPage';
import { getMessages } from '@/lib/messages';
import { buildBreadcrumb } from '@/lib/jsonLd';
import { altLanguages, isLocale, type Locale } from '@/lib/i18n-config';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  return {
    title: getMessages(locale).pages.privacy.title,
    alternates: { canonical: `/${locale}/privacy`, languages: altLanguages('/privacy') },
  };
}

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  const crumb = buildBreadcrumb(locale, getMessages(locale).pages.privacy.title, '/privacy');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumb) }} />
      <LegalPage baseKey="pages.privacy" />
    </>
  );
}
