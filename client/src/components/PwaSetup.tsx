'use client';

import { useEffect } from 'react';

// Registers the service worker (PWA / offline) and adds preconnect hints to the
// media CDNs so the first thumbnail/preview/download starts faster.
export default function PwaSetup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    for (const href of ['https://video.twimg.com', 'https://pbs.twimg.com']) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  return null;
}
