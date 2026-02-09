import { Route } from 'react-router';
import { espacesIdRoutes } from './[id]/routes';
import EspacesPage from './index';
import NouveauEspacePage from './nouveau';

export const espacesRoutes = (
  <Route path="espaces">
    <Route index element={<EspacesPage />} />
    <Route path="nouveau" element={<NouveauEspacePage />} />
    {espacesIdRoutes}
  </Route>
);
