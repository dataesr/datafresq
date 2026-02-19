import { lazy } from 'react';
import { Route } from 'react-router';
import RedirectToFormations from './index';

const Espace = lazy(() => import('./(tabs)'));

export const espacesIdRoutes = (
  <Route path=":id">
    <Route index element={<RedirectToFormations />} />
    {/* :tab renders all tabs with <Activity> for instant switch */}
    <Route path=":tab" element={<Espace />} />
  </Route>
);
