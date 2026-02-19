import { lazy } from 'react';
import { Route } from 'react-router';
import RedirectToInformations from './index';

const FormationPage = lazy(() => import('./(tabs)'));

export const formationRoutes = (
  <Route path=":inf">
    <Route index element={<RedirectToInformations />} />
    <Route path=":tab" element={<FormationPage />} />
  </Route>
);
