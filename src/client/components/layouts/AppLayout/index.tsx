import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { useCurrentUser } from '@/api/users';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import Footer from '@/components/Footer';
import FullPageLoader from '@/components/FullPageLoader';
import Header from '@/components/Header';
import Sidemenu from './Sidemenu';
import './styles.css';

export default function AppLayout() {
  useCurrentUser();

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullPageLoader />}>
        <Header />
        <main>
          <div className="main-app">
            <Sidemenu />
            <Outlet />
          </div>
        </main>
        <Footer />
      </Suspense>
    </ErrorBoundary>
  );
}
