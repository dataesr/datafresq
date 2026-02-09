import { Route } from 'react-router';
import FormationPage from './(tabs)';
import RedirectToInformations from './index';

export const formationRoutes = (
  <Route path=":inf">
    <Route index element={<RedirectToInformations />} />
    <Route path=":tab" element={<FormationPage />} />
  </Route>
);
