import { describe, it, expect } from 'vitest';
import { isLocale, resolveLocale, altLanguages, LOCALES } from './i18n-config';

describe('isLocale', () => {
  it('accepts supported locales', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('en')).toBe(true);
  });
  it('rejects anything else', () => {
    expect(isLocale('about')).toBe(false);
    expect(isLocale('zz')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('resolveLocale', () => {
  it('matches the first supported browser language (ignoring region)', () => {
    expect(resolveLocale(['fr-FR', 'en'])).toBe('fr');
    expect(resolveLocale(['pt-BR'])).toBe('pt');
  });
  it('falls back to default when none match', () => {
    expect(resolveLocale(['ja', 'ko'])).toBe('en');
    expect(resolveLocale([])).toBe('en');
  });
});

describe('altLanguages', () => {
  it('builds hreflang map for the home', () => {
    const map = altLanguages('/');
    expect(map.fr).toBe('/fr');
    expect(map['x-default']).toBe('/');
    expect(Object.keys(map)).toHaveLength(LOCALES.length + 1);
  });
  it('builds hreflang map for a sub-path', () => {
    const map = altLanguages('/about');
    expect(map.es).toBe('/es/about');
    expect(map['x-default']).toBe('/en/about');
  });
});
