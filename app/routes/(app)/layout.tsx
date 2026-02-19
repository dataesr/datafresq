import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { useSharedWorkspaces, useWorkspaces } from '@/api/workspaces';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import FullPageLoader from '@/components/loaders/FullPageLoader';
import PageContentLoader from '@/components/loaders/PageContentLoader';
import { ActiveWorkspaceProvider } from '@/contexts/ActiveWorkspaceContext';
import Sidemenu from './components/Sidemenu';
import './styles.css';

/**
 * Main app layout for authenticated users.
 * Auth is already verified by the router before this renders.
 * ErrorBoundary wraps Outlet so errors display within the layout (with header/footer).
 */
function AppLayoutContent() {
  const { data: workspaces } = useWorkspaces();
  const { data: sharedWorkspaces } = useSharedWorkspaces();

  const allWorkspaces = [...workspaces, ...sharedWorkspaces];

  return (
    <ActiveWorkspaceProvider workspaces={allWorkspaces}>
      <Header showSidemenu sidemenuContent={<Sidemenu />} />
      <ErrorBoundary>
        <main>
          <div className="fr-container--fluid">
            <div className="fr-grid-row">
              <div className="fx-col-sidemenu">
                <Sidemenu />
              </div>
              <div className="fx-col-content">
                <div className="fr-container">
                  <Suspense fallback={<PageContentLoader />}>
                    <Outlet />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </main>
      </ErrorBoundary>
      <Footer />
    </ActiveWorkspaceProvider>
  );
}

export default function AppLayout() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <AppLayoutContent />
    </Suspense>
  );
}
