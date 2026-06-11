'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useLocale, localeHref } from '@/hooks/useLocale';
import { PLATFORMS } from '@/lib/platforms';

export default function Footer() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const locale = useLocale();
  const border = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const link = 'text-sm text-slate-500 transition hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400';
  const heading = 'text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white';

  const legalLinks = [
    { href: localeHref(locale, '/about'), label: t('pages.about.title') },
    { href: localeHref(locale, '/privacy'), label: t('pages.privacy.title') },
    { href: localeHref(locale, '/terms'), label: t('pages.terms.title') },
    { href: localeHref(locale, '/contact'), label: t('pages.contact.title') },
  ];

  return (
    <footer className={`mt-16 border-t ${border}`}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{t('header.title')}</p>
          <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">{t('footer.tagline')}</p>
          <p className="mt-4 max-w-md text-xs text-slate-500">{t('footer.disclaimer')}</p>
        </div>

        <div>
          <p className={heading}>{t('footer.tools')}</p>
          <ul className="mt-4 space-y-2.5">
            {PLATFORMS.map((p) => (
              <li key={p.id}>
                <Link href={localeHref(locale, `/${p.id}`)} className={link}>
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={heading}>{t('footer.legal')}</p>
          <ul className="mt-4 space-y-2.5">
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`border-t ${border}`}>
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          © 2024–2026 · {t('header.title')} · {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
