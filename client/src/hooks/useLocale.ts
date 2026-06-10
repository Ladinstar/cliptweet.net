'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n-config';

/**
 * Active locale: the URL prefix when present (explicit choice), otherwise the
 * language i18n auto-detected — so links on "/" point to the displayed language.
 */
export function useLocale(): Locale {
  const pathname = usePathname() || '/';
  const { i18n } = useTranslation();
  const first = pathname.split('/')[1];
  if (isLocale(first)) return first;
  return isLocale(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LOCALE;
}

/** True when the current URL is locale-prefixed (e.g. /fr, /es/about). */
export function useHasLocalePrefix(): boolean {
  const pathname = usePathname() || '/';
  return isLocale(pathname.split('/')[1]);
}

export function localeHref(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path;
  return `/${locale}${clean}`;
}
