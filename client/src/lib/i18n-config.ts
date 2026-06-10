export const LOCALES = ['en', 'fr', 'es', 'de', 'it', 'pt', 'nl', 'pl', 'ar'] as const;
export const DEFAULT_LOCALE: Locale = 'en';
export type Locale = (typeof LOCALES)[number];

const RTL_LOCALES: readonly Locale[] = ['ar'];

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function isRtl(locale: string | undefined): boolean {
  return isLocale(locale) && RTL_LOCALES.includes(locale);
}

/** Pick the best supported locale from a browser language list. */
export function resolveLocale(candidates: readonly string[]): Locale {
  for (const candidate of candidates) {
    const short = candidate.toLowerCase().split('-')[0];
    if (isLocale(short)) return short;
  }
  return DEFAULT_LOCALE;
}

/** hreflang alternates for a sub-path (e.g. "/about" → { en: "/en/about", …, "x-default": "/about" }). */
export function altLanguages(subpath: string): Record<string, string> {
  const suffix = subpath === '/' ? '' : subpath;
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `/${locale}${suffix}`;
  }
  languages['x-default'] = suffix === '' ? '/' : `/${DEFAULT_LOCALE}${suffix}`;
  return languages;
}
