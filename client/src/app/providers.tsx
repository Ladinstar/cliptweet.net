'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
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

  // The browser-detected language (e.g. "fr"), captured before we override it.
  // On the server it resolves to the fallback ("en") since there's no navigator.
  const detected = useRef(i18n.language).current;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Language for SSR + the first client paint: the URL locale, or "en" on the
  // locale-less "/". It MUST match the server-rendered HTML to avoid a hydration
  // mismatch. We align i18n during render only before mount — at that point no
  // child is mounted yet, so this can't trigger a setState-in-render warning.
  const initialLang = urlLocale ?? 'en';
  if (!mounted && i18n.language !== initialLang) {
    i18n.changeLanguage(initialLang);
  }

  // After mount, switch to the user's language (URL locale, or the detected one
  // on "/"). Done in an effect — never during render — so updating subscribed
  // components (Shell, menus…) is safe.
  const active = urlLocale ?? detected;
  useEffect(() => {
    if (i18n.language !== active) i18n.changeLanguage(active);
    document.documentElement.lang = active;
    document.documentElement.dir = isRtl(active) ? 'rtl' : 'ltr';
  }, [active]);

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
