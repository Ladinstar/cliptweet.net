import { getMessages } from '@/lib/messages';
import { BRAND, SITE_URL } from '@/config/brand';
import type { Locale } from '@/lib/i18n-config';

type Messages = ReturnType<typeof getMessages>;

function fillPlatform(s: string, name: string): string {
  return s.replace(/\{\{platform\}\}/g, name);
}

function faqEntries(m: Messages, platformName: string, brandSlots: boolean) {
  const pairs = [
    [m.faq.q1, m.faq.a1],
    [m.faq.q2, m.faq.a2],
    [m.faq.q3, m.faq.a3],
    [m.faq.q4, fillPlatform(m.faq.a4, platformName)],
    [m.faq.q5, m.faq.a5],
    [m.faq.q6, m.faq.a6],
    // Brand-specific slots: only relevant on the focused home page (and empty
    // strings on the multi-platform site anyway).
    ...(brandSlots
      ? [
          [m.faq.q7, m.faq.a7],
          [m.faq.q8, m.faq.a8],
        ]
      : []),
  ].filter(([q, a]) => q && a);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

function howToEntry(m: Messages, platformName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: m.steps.title,
    step: [
      [m.steps.step1Title, fillPlatform(m.steps.step1Desc, platformName)],
      [m.steps.step2Title, m.steps.step2Desc],
      [m.steps.step3Title, m.steps.step3Desc],
    ].map(([name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text })),
  };
}

function webAppEntry(name: string, url: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
}

export function buildHomeJsonLd(locale: Locale, path: string) {
  const m = getMessages(locale, { homePage: true });
  const platformName = m.platform.defaultName;
  return [
    webAppEntry(BRAND.siteName, `${SITE_URL}${path}`, m.meta.siteDesc),
    faqEntries(m, platformName, true),
    howToEntry(m, platformName),
  ];
}

export function buildPlatformJsonLd(locale: Locale, platformId: string, name: string) {
  const m = getMessages(locale);
  return [
    webAppEntry(`${name} Video Downloader`, `${SITE_URL}/${locale}/${platformId}`, fillPlatform(m.faq.a4, name)),
    faqEntries(m, name, false),
    howToEntry(m, name),
    buildBreadcrumb(locale, name, `/${platformId}`),
  ];
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
