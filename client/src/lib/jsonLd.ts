import { getMessages } from '@/lib/messages';
import type { Locale } from '@/lib/i18n-config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://twitter-video-downloader.example';

export function buildHomeJsonLd(locale: Locale, path: string) {
  const m = getMessages(locale);
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Twitter Video Downloader',
    url: `${SITE_URL}${path}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    description: m.home.heroDesc,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      [m.faq.q1, m.faq.a1],
      [m.faq.q2, m.faq.a2],
      [m.faq.q3, m.faq.a3],
      [m.faq.q4, m.faq.a4],
      [m.faq.q5, m.faq.a5],
      [m.faq.q6, m.faq.a6],
    ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: m.steps.title,
    step: [
      [m.steps.step1Title, m.steps.step1Desc],
      [m.steps.step2Title, m.steps.step2Desc],
      [m.steps.step3Title, m.steps.step3Desc],
    ].map(([name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text })),
  };
  return [app, faq, howTo];
}

export function buildPlatformJsonLd(locale: Locale, platformId: string, name: string) {
  const m = getMessages(locale);
  const fill = (s: string) => s.replace(/\{\{platform\}\}/g, name);
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${name} Video Downloader`,
    url: `${SITE_URL}/${locale}/${platformId}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    description: fill(m.faq.a4),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      [m.faq.q1, m.faq.a1],
      [m.faq.q2, m.faq.a2],
      [m.faq.q3, m.faq.a3],
      [m.faq.q4, fill(m.faq.a4)],
      [m.faq.q5, m.faq.a5],
      [m.faq.q6, m.faq.a6],
    ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: m.steps.title,
    step: [
      [m.steps.step1Title, fill(m.steps.step1Desc)],
      [m.steps.step2Title, m.steps.step2Desc],
      [m.steps.step3Title, m.steps.step3Desc],
    ].map(([n, text], i) => ({ '@type': 'HowToStep', position: i + 1, name: n, text })),
  };
  const breadcrumb = buildBreadcrumb(locale, name, `/${platformId}`);
  return [app, faq, howTo, breadcrumb];
}

export function buildBreadcrumb(locale: Locale, name: string, subpath: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}/${locale}${subpath}` },
    ],
  };
}
