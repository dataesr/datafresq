import { lazy } from 'react';
import { Route } from 'react-router';
import { espacesIdRoutes } from './[id]/routes';

const EspacesPage = lazy(() => import('./index'));
const NouveauEspacePage = lazy(() => import('./nouveau'));

export const espacesRoutes = (
  <Route path="espaces">
    <Route index element={<EspacesPage />} />
    <Route path="nouveau" element={<NouveauEspacePage />} />
    {espacesIdRoutes}
  </Route>
);
