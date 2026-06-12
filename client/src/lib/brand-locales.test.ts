import { describe, expect, it } from 'vitest';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';
import de from '@/locales/de.json';
import it_ from '@/locales/it.json';
import pt from '@/locales/pt.json';
import nl from '@/locales/nl.json';
import pl from '@/locales/pl.json';
import ar from '@/locales/ar.json';
import { deepMerge } from '@/lib/deepMerge';

const LOCALES = { fr, es, de, it: it_, pt, nl, pl, ar };

function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, v]) => leafPaths(v, prefix ? `${prefix}.${key}` : key));
}

describe('brand locale completeness', () => {
  const reference = leafPaths(en.brands).sort();

  it('english defines both brand sections', () => {
    expect(reference.length).toBeGreaterThan(0);
    expect(Object.keys(en.brands).sort()).toEqual(['tiktok', 'twitter']);
  });

  for (const [lng, messages] of Object.entries(LOCALES)) {
    it(`${lng} translates every brand key`, () => {
      expect(leafPaths((messages as typeof en).brands).sort()).toEqual(reference);
    });

    it(`${lng} translates the multi-site meta`, () => {
      expect(leafPaths((messages as typeof en).meta).sort()).toEqual(leafPaths(en.meta).sort());
    });
  }
});

describe('deepMerge', () => {
  it('overrides nested keys and keeps the rest', () => {
    const base = { a: { b: 1, c: 2 }, d: 3 };
    expect(deepMerge(base, { a: { c: 9 } })).toEqual({ a: { b: 1, c: 9 }, d: 3 });
  });

  it('returns base when override is undefined', () => {
    expect(deepMerge({ a: 1 }, undefined)).toEqual({ a: 1 });
  });
});
