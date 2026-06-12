'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useLocale, localeHref } from '@/hooks/useLocale';
import { PLATFORMS } from '@/lib/platforms';
import { BRAND } from '@/config/brand';

// Only the platforms that have a subpage on this brand's site (the focused
// platform IS the home page, so it never appears in the grid).
const GRID_PLATFORMS = PLATFORMS.filter((p) => BRAND.subpagePlatforms.includes(p.id));

export default function PlatformGrid() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const locale = useLocale();
  const cardClass = theme === 'dark' ? 'border-slate-800/70 bg-slate-950/80' : 'border-slate-200 bg-white/90';

  return (
    <section>
      <h2 className="text-center text-3xl font-semibold text-slate-900 dark:text-white">{t('platform.gridTitle')}</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {GRID_PLATFORMS.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.id}
              href={localeHref(locale, `/${p.id}`)}
              className={`flex flex-col items-center gap-2 rounded-2xl border ${cardClass} p-5 text-center shadow-neon transition hover:border-sky-500 hover:shadow-md hover:shadow-sky-500/10`}
            >
              <Icon className="h-8 w-8" style={{ color: p.color }} aria-hidden="true" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
