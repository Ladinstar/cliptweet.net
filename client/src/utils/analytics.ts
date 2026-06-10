import { getConsent } from '@/utils/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

let initialized = false;

function loadScript(src: string, attrs: Record<string, string> = {}) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  for (const [k, v] of Object.entries(attrs)) script.setAttribute(k, v);
  document.head.appendChild(script);
}

/**
 * Loads gtag/AdSense with Google Consent Mode v2: storage is DENIED by default
 * (cookieless pings only) and granted later via grantConsent() once the visitor
 * accepts. This is the model required to serve Google ads/analytics in the EEA.
 */
export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return;
  if (!GA_ID && !ADSENSE_CLIENT) return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer!.push(args);
  };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });

  if (getConsent() === 'accepted') grantConsent();

  if (GA_ID) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });
  }

  if (ADSENSE_CLIENT) {
    loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`, {
      crossorigin: 'anonymous',
    });
  }
}

export function grantConsent(): void {
  window.gtag?.('consent', 'update', {
    ad_storage: 'granted',
    analytics_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  });
}

export function trackPageView(path: string): void {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path });
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}
