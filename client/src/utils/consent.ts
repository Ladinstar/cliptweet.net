const KEY = 'cookie-consent';

export type Consent = 'accepted' | 'declined';

export function getConsent(): Consent | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(KEY);
  return value === 'accepted' || value === 'declined' ? value : null;
}

export function setConsent(value: Consent): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(KEY, value);
}
