import { Outlet } from 'react-router';
import { useAuth } from '@/api/auth';
import { APIError } from '@/api/eden-treaty';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function AdminLayout() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    throw new APIError({ status: 403, value: { message: 'Accès réservé aux administrateurs' } });
  }

  return (
    <>
      <Header />
      <main>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
