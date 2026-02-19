import { Outlet } from 'react-router';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import DocSidemenu from './components/DocSidemenu';
import GuideSearchModal from './components/SearchModal';
import './styles.css';

export default function GuideLayout() {
  return (
    <>
      <Header
        showSidemenu
        sidemenuContent={<DocSidemenu idPrefix="mobile-sidemenu" />}
        searchContent={<GuideSearchModal />}
      />
      <ErrorBoundary>
        <main>
          <div className="fr-container--fluid">
            <div className="fr-grid-row">
              <div className="docs-sidemenu">
                <DocSidemenu idPrefix="desktop-sidemenu" />
              </div>
              <div className="docs-content">
                <div className="fr-container">
                  <Outlet />
                  <div className="docs-content__separator fullwidth-bg" />
                  <Footer sm />
                </div>
              </div>
            </div>
          </div>
        </main>
      </ErrorBoundary>
    </>
  );
}
