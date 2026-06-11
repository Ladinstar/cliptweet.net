'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale, useHasLocalePrefix, localeHref } from '@/hooks/useLocale';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import MoreMenu from '@/components/MoreMenu';
import MobileMenu from '@/components/MobileMenu';
import Footer from '@/components/Footer';
import ConsentBanner from '@/components/ConsentBanner';

function navClass(active: boolean): string {
  return active
    ? 'text-sky-500 dark:text-sky-400 border-b-2 border-sky-400 pb-1'
    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white';
}

export default function Shell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname() || '/';
  const locale = useLocale();
  const hasPrefix = useHasLocalePrefix();

  const homeHref = hasPrefix ? localeHref(locale, '/') : '/';
  const adminHref = localeHref(locale, '/admin');
  const onHome = pathname === '/' || pathname === `/${locale}`;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div
        className={`min-h-screen transition-colors ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
            : 'bg-gradient-to-b from-slate-50 to-white'
        }`}
      >
        <nav
          className={`border-b ${
            theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-white/50'
          } backdrop-blur-sm sticky top-0 z-50`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link href={homeHref} className="font-bold text-xl text-slate-900 dark:text-white">
              {t('header.title')}
            </Link>
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="hidden items-center gap-6 sm:flex">
                <Link href={homeHref} className={navClass(onHome)}>
                  {t('nav.home')}
                </Link>
                {isAuthenticated && (
                  <Link href={adminHref} className={navClass(pathname.endsWith('/admin'))}>
                    {t('nav.admin')}
                  </Link>
                )}
                <MoreMenu />
              </div>
              <LanguageSwitcher />
              <ThemeSwitcher />
              <div className="sm:hidden">
                <MobileMenu />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
        <Footer />
        <ConsentBanner />
      </div>
    </div>
  );
}
