import { notFound } from 'next/navigation';
import { LOCALES, isLocale } from '@/lib/i18n-config';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default function LocaleLayout({ params, children }: { params: { locale: string }; children: React.ReactNode }) {
  if (!isLocale(params.locale)) notFound();
  return <>{children}</>;
}
