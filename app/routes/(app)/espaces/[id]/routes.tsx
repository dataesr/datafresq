import { Route } from 'react-router';
import Espace from './(tabs)';
import RedirectToFormations from './index';

export const espacesIdRoutes = (
  <Route path=":id">
    <Route index element={<RedirectToFormations />} />
    {/* :tab renders all tabs with <Activity> for instant switch */}
    <Route path=":tab" element={<Espace />} />
  </Route>
);
