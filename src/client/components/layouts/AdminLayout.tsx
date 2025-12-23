import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { APIError } from '@/api/eden-treaty';
import { useCurrentUser } from '@/api/users';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import Footer from '@/components/Footer';
import FullPageLoader from '@/components/FullPageLoader';
import Header from '@/components/Header';

export default function AdminLayout() {
  const { isAdmin } = useCurrentUser();
  if (!isAdmin) {
    throw new APIError({ value: { message: 'Unauthorized' }, status: 403 });
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullPageLoader />}>
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </Suspense>
    </ErrorBoundary>
  );
}
