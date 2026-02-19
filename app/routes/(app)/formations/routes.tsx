import { lazy } from 'react';
import { Route } from 'react-router';
import { formationRoutes } from './[inf]/routes';

const FormationsListPage = lazy(() => import('./index/index'));

export const formationsRoutes = (
  <Route path="formations">
    <Route index element={<FormationsListPage />} />
    {formationRoutes}
  </Route>
);
