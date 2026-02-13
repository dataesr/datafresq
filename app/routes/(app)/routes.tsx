import { Navigate, Route } from 'react-router';
import { espacesRoutes } from './espaces/routes';
import { formationsRoutes } from './formations/routes';
import Home from './index/index';
import Layout from './layout';
import { utilisateurRoutes } from './utilisateur/routes';

export const appRoutes = (
  <Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="faq" element={<Navigate to="/guide" replace />} />
    {espacesRoutes}
    {formationsRoutes}
    {utilisateurRoutes}
  </Route>
);
