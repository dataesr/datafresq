import { Route } from 'react-router';
import { etablissementRoutes } from './[id]/routes';
import EtablissementsListPage from './index';

export const etablissementsRoutes = (
  <Route path="etablissements">
    <Route index element={<EtablissementsListPage />} />
    {etablissementRoutes}
  </Route>
);
