import { lazy } from 'react';
import { Route } from 'react-router';
import RedirectToUsers from '.';

const AdminLayout = lazy(() => import('./layout'));
const AdminSection = lazy(() => import('./(tabs)'));

export const adminRoutes = (
  <Route path="admin" element={<AdminLayout />}>
    <Route index element={<RedirectToUsers />} />
    <Route path=":tab" element={<AdminSection />} />
  </Route>
);
