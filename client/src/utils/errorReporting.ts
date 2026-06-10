const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

let started = false;

/** Loads Sentry's official Loader Script (no pinned version, no bundled dep) when a DSN is set. */
export function initErrorReporting(): void {
  if (started || !DSN || typeof window === 'undefined') return;
  started = true;
  try {
    const publicKey = DSN.split('//')[1]?.split('@')[0];
    if (!publicKey) return;
    const script = document.createElement('script');
    script.src = `https://js.sentry-cdn.com/${publicKey}.min.js`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  } catch {
    /* ignore — error reporting is best-effort */
  }
}

export function captureError(error: unknown): void {
  if (typeof window !== 'undefined' && window.Sentry?.captureException) {
    window.Sentry.captureException(error);
  }
  if (process.env.NODE_ENV !== 'production') console.error(error);
}
