'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/queryClient';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { initAnalytics, trackPageView } from '@/utils/analytics';
import { initErrorReporting } from '@/utils/errorReporting';
import Shell from '@/components/Shell';
import ErrorBoundary from '@/components/ErrorBoundary';
import PwaSetup from '@/components/PwaSetup';
import i18n from '@/i18n';
import { isLocale, isRtl } from '@/lib/i18n-config';

function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    initAnalytics();
    initErrorReporting();
  }, []);
  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const first = pathname.split('/')[1];
  const urlLocale = isLocale(first) ? first : null;

  // A locale in the URL (explicit choice) overrides the auto-detected one.
  // On "/" there's no prefix, so i18n keeps the browser-detected language.
  if (urlLocale && i18n.language !== urlLocale) {
    i18n.changeLanguage(urlLocale);
  }

  useEffect(() => {
    const active = urlLocale || i18n.resolvedLanguage || 'en';
    document.documentElement.lang = active;
    document.documentElement.dir = isRtl(active) ? 'rtl' : 'ltr';
  }, [urlLocale]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AnalyticsTracker />
            <PwaSetup />
            <ErrorBoundary>
              <Shell>{children}</Shell>
            </ErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
