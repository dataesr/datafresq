import { lazy } from 'react';
import { Route } from 'react-router';
import RedirectToProfil from './index';

const UserSettings = lazy(() => import('./[tab]'));

export const utilisateurRoutes = (
  <Route path="utilisateur">
    <Route index element={<RedirectToProfil />} />
    <Route path=":tab" element={<UserSettings />} />
  </Route>
);
