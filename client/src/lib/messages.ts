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
import { deepMerge } from '@/lib/deepMerge';
import { BRAND } from '@/config/brand';

type Messages = typeof en;
type Section = Record<string, unknown>;

const overrides: Record<Locale, unknown> = { en, fr, es, de, it, pt, nl, pl, ar };

function brandSection(messages: unknown): Section | undefined {
  if (typeof messages !== 'object' || messages === null) return undefined;
  return (messages as { brands?: Record<string, Section> }).brands?.[BRAND.id];
}

/**
 * The brand overlay (locales' `brands.<id>` section) is split in two:
 * - site-wide keys (header, footer, meta, platform…) are safe on every page;
 * - page-scoped keys (home hero/intro, steps, faq) only belong on the focused
 *   home page — applied globally they would leak onto the other platforms'
 *   subpages ("Paste a TikTok link" on /twitter).
 */
function splitOverlay(overlay: Section): { global: Section; homeOnly: Section } {
  const { home, steps, faq, ...global } = overlay;
  // `home.supported` is a site-wide statement (which platforms the site handles).
  const supported = (home as Section | undefined)?.supported;
  if (supported) (global as Section).home = { supported };
  return { global, homeOnly: { home, steps, faq } };
}

function resolveOverlay(messages: unknown, base: unknown): Section {
  return deepMerge(brandSection(base) ?? {}, brandSection(messages)) as Section;
}

/** Site-wide brand overrides, applied to every page (client i18n resources). */
export function applyBrand<T>(messages: T, base: unknown = en): T {
  return deepMerge(messages, splitOverlay(resolveOverlay(messages, base)).global);
}

/**
 * Full messages including the page-scoped brand copy — used as the `brandHome`
 * i18n namespace, consumed only by the focused home page.
 */
export function applyBrandHome<T>(messages: T, base: unknown = en): T {
  const { global, homeOnly } = splitOverlay(resolveOverlay(messages, base));
  return deepMerge(deepMerge(messages, global), homeOnly);
}

/** Slim client-side `brandHome` namespace: just the page-scoped sections. */
export function brandHomeSections<T>(messages: T, base: unknown = en): Pick<Messages, 'home' | 'steps' | 'faq'> {
  const full = applyBrandHome(messages, base) as unknown as Messages;
  return { home: full.home, steps: full.steps, faq: full.faq };
}

/** Server-side access to translations (English-backed) for localized metadata. */
export function getMessages(locale: Locale, opts: { homePage?: boolean } = {}): Messages {
  const merged = deepMerge(en, overrides[locale]);
  return opts.homePage ? applyBrandHome(merged) : applyBrand(merged);
}
