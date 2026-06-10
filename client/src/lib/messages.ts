import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';
import de from '@/locales/de.json';
import it from '@/locales/it.json';
import pt from '@/locales/pt.json';
import nl from '@/locales/nl.json';
import pl from '@/locales/pl.json';
import ar from '@/locales/ar.json';
import type { Locale } from '@/lib/i18n-config';

type Messages = typeof en;

const overrides: Record<Locale, unknown> = { en, fr, es, de, it, pt, nl, pl, ar };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// Deep-merge a locale over the English base, so any key missing in a locale
// (e.g. legal pages only translated in en/fr) falls back to English.
function deepMerge<T>(base: T, override: unknown): T {
  if (!isObject(base) || !isObject(override)) return (override as T) ?? base;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    out[key] = deepMerge((base as Record<string, unknown>)[key], override[key]);
  }
  return out as T;
}

/** Server-side access to translations (English-backed) for localized metadata. */
export function getMessages(locale: Locale): Messages {
  return deepMerge(en, overrides[locale]);
}
