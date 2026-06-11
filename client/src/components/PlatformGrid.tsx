'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useLocale, localeHref } from '@/hooks/useLocale';
import { PLATFORMS } from '@/lib/platforms';

export default function PlatformGrid() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const locale = useLocale();
  const cardClass = theme === 'dark' ? 'border-slate-800/70 bg-slate-950/80' : 'border-slate-200 bg-white/90';

  return (
    <section>
      <h2 className="text-center text-3xl font-semibold text-slate-900 dark:text-white">{t('platform.gridTitle')}</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {PLATFORMS.map((p) => (
          <Link
            key={p.id}
            href={localeHref(locale, `/${p.id}`)}
            className={`flex flex-col items-center gap-2 rounded-2xl border ${cardClass} p-5 text-center shadow-neon transition hover:border-sky-500 hover:shadow-md hover:shadow-sky-500/10`}
          >
            <span className="text-3xl" aria-hidden="true">
              {p.icon}
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
