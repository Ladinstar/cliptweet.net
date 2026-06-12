'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAdminStats } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale, localeHref } from '@/hooks/useLocale';

// A labelled distribution (platform/format/quality) rendered as proportional bars.
function BarList({ data, empty }: { data: Record<string, number>; empty: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = entries.reduce((m, [, v]) => Math.max(m, v), 0) || 1;
  if (entries.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">{empty}</p>;
  return (
    <div className="space-y-3">
      {entries.map(([key, count]) => (
        <div key={key}>
          <div className="flex items-center justify-between text-sm">
            <span className="capitalize text-slate-700 dark:text-slate-300">{key}</span>
            <span className="font-semibold text-slate-900 dark:text-white">{count}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-sky-500" style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const locale = useLocale();
  const { token, username, isAuthenticated, ready, logout } = useAuth();
  const { data: stats, isLoading, error } = useAdminStats(token);

  const handleLogout = () => {
    logout();
    router.push(localeHref(locale, '/'));
  };

  const sectionClass = `border border-slate-200 bg-white/90 dark:border-slate-800/70 dark:bg-slate-950/80`;
  const tileClass = theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100';
  const textClass = 'text-slate-600 dark:text-slate-400';
  const cardTitle = 'text-2xl font-semibold text-slate-900 dark:text-white';

  // Auth still resolving (localStorage read happens after mount).
  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-500" />
      </div>
    );
  }

  // Not signed in → explicit 403 (the protected stats API also returns 401).
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <p className="text-6xl font-black text-rose-500/80">403</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">{t('admin.forbiddenTitle')}</h1>
        <p className={`mt-2 max-w-md ${textClass}`}>{t('admin.forbiddenDesc')}</p>
        <Link
          href={localeHref(locale, '/admin-login')}
          className="mt-6 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          {t('admin.goToLogin')}
        </Link>
        <Link href={localeHref(locale, '/')} className="mt-4 text-sm text-slate-500 hover:text-sky-500">
          {t('admin.backHome')}
        </Link>
      </div>
    );
  }

  const total = stats ? stats.downloads + stats.errors : 0;
  const successRate = total > 0 ? Math.round((stats!.downloads / total) * 100) : null;

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{t('admin.title')}</h1>
          <p className={`mt-2 ${textClass}`}>{t('admin.welcome', { username })}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-rose-500/15 px-4 py-2 text-rose-600 transition hover:bg-rose-500/25 dark:bg-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/30"
        >
          {t('admin.logoutButton')}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-700 dark:text-rose-200">
          {error instanceof Error ? error.message : t('admin.loadError')}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-500" />
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={`rounded-2xl ${tileClass} p-5`}>
              <p className={`text-sm ${textClass}`}>{t('admin.totalDownloads')}</p>
              <p className="mt-1 text-3xl font-bold text-sky-500 dark:text-sky-400">{stats.downloads}</p>
            </div>
            <div className={`rounded-2xl ${tileClass} p-5`}>
              <p className={`text-sm ${textClass}`}>{t('admin.totalErrors')}</p>
              <p className="mt-1 text-3xl font-bold text-rose-500 dark:text-rose-400">{stats.errors}</p>
            </div>
            <div className={`rounded-2xl ${tileClass} p-5`}>
              <p className={`text-sm ${textClass}`}>{t('admin.successRate')}</p>
              <p className="mt-1 text-3xl font-bold text-emerald-500 dark:text-emerald-400">
                {successRate === null ? '—' : `${successRate}%`}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className={`rounded-3xl ${sectionClass} p-8 shadow-neon`}>
              <h2 className={`mb-6 ${cardTitle}`}>{t('admin.platformStats')}</h2>
              <BarList data={stats.platformStats} empty={t('admin.noData')} />
            </div>
            <div className={`rounded-3xl ${sectionClass} p-8 shadow-neon`}>
              <h2 className={`mb-6 ${cardTitle}`}>{t('admin.popularFormats')}</h2>
              <BarList data={stats.formatStats} empty={t('admin.noData')} />
            </div>
            <div className={`rounded-3xl ${sectionClass} p-8 shadow-neon`}>
              <h2 className={`mb-6 ${cardTitle}`}>{t('admin.qualityStats')}</h2>
              <BarList data={stats.qualityStats} empty={t('admin.noData')} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className={`rounded-3xl ${sectionClass} p-8 shadow-neon`}>
              <h2 className={`mb-6 ${cardTitle}`}>{t('admin.recentLinks')}</h2>
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {stats.lastLinks.length > 0 ? (
                  stats.lastLinks.map((link, idx) => (
                    <div key={idx} className={`rounded-lg ${tileClass} p-3 text-sm`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-slate-900 dark:text-white">{link.title}</p>
                        {link.platform && (
                          <span className="shrink-0 rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-sky-600 dark:text-sky-300">
                            {link.platform}
                          </span>
                        )}
                      </div>
                      <p className={`truncate text-xs ${textClass}`}>{link.url}</p>
                      <p className={`text-xs ${textClass}`}>{new Date(link.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className={textClass}>{t('admin.noLinks')}</p>
                )}
              </div>
            </div>

            <div className={`rounded-3xl ${sectionClass} p-8 shadow-neon`}>
              <h2 className={`mb-6 ${cardTitle}`}>{t('admin.lastErrors')}</h2>
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {stats.lastErrors.length > 0 ? (
                  stats.lastErrors.map((err, idx) => (
                    <div key={idx} className={`rounded-lg ${tileClass} p-3 text-sm`}>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{err.url}</p>
                      <p className="mt-1 line-clamp-2 text-rose-600 dark:text-rose-300">{err.message}</p>
                      <p className={`mt-1 text-xs ${textClass}`}>{new Date(err.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className={textClass}>{t('admin.noErrors')}</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
