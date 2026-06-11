'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { isLocale } from '@/lib/i18n-config';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Picking a language navigates to the locale-prefixed route (/fr, /es/about…).
  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    const segments = pathname.split('/').filter(Boolean);
    if (isLocale(segments[0])) segments[0] = code;
    else segments.unshift(code);
    router.push('/' + segments.join('/'));
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) || LANGUAGES[0];
  const panelClass = theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-slate-900/70 px-3 text-xs font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-slate-800"
      >
        <span aria-hidden="true">🌐</span>
        <span>{current.flag}</span>
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 mt-2 w-72 rounded-2xl border ${panelClass} p-2 shadow-xl shadow-slate-950/20`}
        >
          <ul className="grid grid-cols-2 gap-0.5">
            {LANGUAGES.map((lang) => {
              const active = lang.code === current.code;
              return (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => selectLanguage(lang.code)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                      active
                        ? 'bg-sky-500/15 font-semibold text-sky-600 dark:text-sky-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span aria-hidden="true">{lang.flag}</span>
                    {lang.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
