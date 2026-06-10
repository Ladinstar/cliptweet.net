import type { Metadata } from 'next';
import AdminLoginView from '@/views/AdminLoginView';

export const metadata: Metadata = {
  title: 'Connexion admin',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginView />;
}
