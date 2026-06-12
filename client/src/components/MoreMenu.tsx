'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useLocale, localeHref } from '@/hooks/useLocale';
import { NAV_PLATFORMS, platformPath } from '@/lib/platforms';

export default function MoreMenu() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const panelClass = theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white';
  const linkClass =
    'block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800';

  const legal = [
    { href: localeHref(locale, '/about'), label: t('pages.about.title') },
    { href: localeHref(locale, '/privacy'), label: t('pages.privacy.title') },
    { href: localeHref(locale, '/terms'), label: t('pages.terms.title') },
    { href: localeHref(locale, '/contact'), label: t('pages.contact.title') },
  ];

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        {t('header.more')}
      </button>

      {open && (
        // pt-3 is a transparent "bridge" so the menu stays open while moving the cursor onto it.
        <div className="absolute right-0 top-full z-50 pt-3">
          <div className={`w-64 rounded-2xl border ${panelClass} p-3 shadow-xl`}>
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('footer.tools')}
            </p>
            {NAV_PLATFORMS.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.id}
                  href={localeHref(locale, platformPath(p.id))}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  <Icon
                    className="mr-2 inline h-5 w-5 align-text-bottom"
                    style={{ color: p.color }}
                    aria-hidden="true"
                  />
                  {p.name}
                </Link>
              );
            })}
            <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('footer.legal')}
            </p>
            {legal.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
