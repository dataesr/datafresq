import { Outlet } from 'react-router';
import { useAuth } from '@/api/auth';
import { APIError } from '@/api/eden-treaty';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();

  if (user && !isAdmin) {
    throw new APIError({ status: 403, value: { message: 'Accès réservé aux administrateurs' } });
  }

  return (
    <>
      <Header />
      <ErrorBoundary>
        <main>
          <div className="fr-container--fluid">
            <div className="fr-grid-row">
              <div className="fx-col-content">
                <div className="fr-container">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </main>
      </ErrorBoundary>
      <Footer />
    </>
  );
}
