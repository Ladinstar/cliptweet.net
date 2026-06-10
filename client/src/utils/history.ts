const KEY = 'download-history';
const MAX = 8;

export interface HistoryItem {
  url: string;
  title: string;
  thumbnail: string | null;
  at: number;
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function addHistory(item: Omit<HistoryItem, 'at'>): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  const existing = getHistory().filter((h) => h.url !== item.url);
  const next = [{ ...item, at: Date.now() }, ...existing].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearHistory(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(KEY);
}
