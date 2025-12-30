import { Outlet } from 'react-router';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Sidemenu from './Sidemenu';
import './styles.css';

/**
 * Main app layout for authenticated users.
 * Auth is already verified by the router before this renders.
 * ErrorBoundary wraps Outlet so errors display within the layout (with header/footer).
 */
export default function AppLayout() {
  return (
    <>
      <Header />
      <main>
        <div className="main-app">
          <Sidemenu />
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </>
  );
}
