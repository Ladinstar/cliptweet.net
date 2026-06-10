'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAdminStats } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocale, localeHref } from '@/hooks/useLocale';

export default function AdminView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const locale = useLocale();
  const { token, username, isAuthenticated, ready, logout } = useAuth();
  const { data: stats, isLoading, error } = useAdminStats(token);

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace(localeHref(locale, '/admin-login'));
  }, [ready, isAuthenticated, router, locale]);

  const handleLogout = () => {
    logout();
    router.push(localeHref(locale, '/'));
  };

  const sectionClass = theme === 'dark' ? 'bg-slate-950/80' : 'bg-white/90';
  const textClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-white">{t('admin.title')}</h1>
          <p className={`mt-2 ${textClass}`}>{t('admin.welcome', { username })}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-4 py-2 transition"
        >
          {t('admin.logoutButton')}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-200">
          {error instanceof Error ? error.message : t('admin.loadError')}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
        </div>
      ) : stats ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`rounded-3xl border border-slate-800/70 ${sectionClass} p-8 shadow-neon`}>
            <h2 className="text-2xl font-semibold text-white mb-6">{t('admin.statsTitle')}</h2>
            <div className="space-y-4">
              <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <p className={textClass}>{t('admin.totalDownloads')}</p>
                <p className="text-3xl font-bold text-sky-400">{stats.downloads}</p>
              </div>
              <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <p className={textClass}>{t('admin.totalErrors')}</p>
                <p className="text-3xl font-bold text-rose-400">{stats.errors}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border border-slate-800/70 ${sectionClass} p-8 shadow-neon`}>
            <h2 className="text-2xl font-semibold text-white mb-6">{t('admin.popularFormats')}</h2>
            <div className="space-y-3">
              {Object.entries(stats.formatStats).map(([formatKey, count]) => (
                <div key={formatKey} className="flex justify-between items-center">
                  <span className={`capitalize ${textClass}`}>{formatKey}</span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl border border-slate-800/70 ${sectionClass} p-8 shadow-neon lg:col-span-2`}>
            <h2 className="text-2xl font-semibold text-white mb-6">{t('admin.recentLinks')}</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.lastLinks.length > 0 ? (
                stats.lastLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'} text-sm`}
                  >
                    <p className="font-medium text-white truncate">{link.title}</p>
                    <p className={`text-xs ${textClass} truncate`}>{link.url}</p>
                    <p className={`text-xs ${textClass}`}>{new Date(link.timestamp).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className={textClass}>{t('admin.noLinks')}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
