import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router';
import { queryClient } from '@/api/query-client';
import { ToastContextProvider } from '@/hooks/useToast';
import AppRouter from '@/routes';
import '@/components/highcharts';

import './styles/index.css';

function DSFRInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.dsfr && typeof window.dsfr.start === 'function') {
      window.dsfr.start();
    }
  }, []);

  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname) window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const elem = document.getElementById('root');
if (!elem) throw new Error('Root element not found');

const app = (
  <StrictMode>
    <BrowserRouter>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <DSFRInitializer>
            <ToastContextProvider>
              <ScrollToTop />
              <AppRouter />
            </ToastContextProvider>
          </DSFRInitializer>
        </QueryClientProvider>
      </NuqsAdapter>
    </BrowserRouter>
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  if (!import.meta.hot.data.root) {
    import.meta.hot.data.root = createRoot(elem);
  }
  import.meta.hot.data.root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
