import '@gouvfr/dsfr/dist/dsfr.main.min.css';
import '@gouvfr/dsfr/dist/utility/utility.main.min.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { queryClient } from '@/api/query-client';
import { ToastContextProvider } from '@/hooks/useToast';
import AppRouter from '@/routes';
import '@/components/highcharts';

import './styles/index.css';

const elem = document.getElementById('root');
if (!elem) throw new Error('Root element not found');
const app = (
  <StrictMode>
    <BrowserRouter>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <ToastContextProvider>
            <AppRouter />
          </ToastContextProvider>
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
