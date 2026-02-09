import { Route } from 'react-router';
import { formationRoutes } from './[inf]/routes';
import FormationsListPage from './index/index';

export const formationsRoutes = (
  <Route path="formations">
    <Route index element={<FormationsListPage />} />
    {formationRoutes}
  </Route>
);
