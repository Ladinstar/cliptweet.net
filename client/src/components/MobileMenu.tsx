'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale, localeHref } from '@/hooks/useLocale';
import { PLATFORMS } from '@/lib/platforms';

export default function MobileMenu() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
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
  const close = () => setOpen(false);

  const legal = [
    { href: localeHref(locale, '/about'), label: t('pages.about.title') },
    { href: localeHref(locale, '/privacy'), label: t('pages.privacy.title') },
    { href: localeHref(locale, '/terms'), label: t('pages.terms.title') },
    { href: localeHref(locale, '/contact'), label: t('pages.contact.title') },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-slate-200 ring-1 ring-white/10 transition hover:bg-slate-800"
      >
        ☰
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 mt-2 w-64 rounded-2xl border ${panelClass} max-h-[80vh] overflow-y-auto p-3 shadow-xl`}
        >
          <Link href={localeHref(locale, '/')} className={linkClass} onClick={close}>
            {t('nav.home')}
          </Link>
          {isAuthenticated && (
            <Link href={localeHref(locale, '/admin')} className={linkClass} onClick={close}>
              {t('nav.admin')}
            </Link>
          )}

          <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('footer.tools')}</p>
          {PLATFORMS.map((p) => (
            <Link key={p.id} href={localeHref(locale, `/${p.id}`)} className={linkClass} onClick={close}>
              <span className="mr-2" aria-hidden="true">
                {p.icon}
              </span>
              {p.name}
            </Link>
          ))}

          <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('footer.legal')}</p>
          {legal.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass} onClick={close}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
