import { Route } from 'react-router';
import UserSettings from './[tab]';
import RedirectToProfil from './index';

export const utilisateurRoutes = (
  <Route path="utilisateur">
    <Route index element={<RedirectToProfil />} />
    <Route path=":tab" element={<UserSettings />} />
  </Route>
);
