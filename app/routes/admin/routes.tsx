import { Route } from 'react-router';
import AdminSection from './(tabs)';
import RedirectToUsers from '.';
import AdminLayout from './layout';

export const adminRoutes = (
  <Route path="admin" element={<AdminLayout />}>
    <Route index element={<RedirectToUsers />} />
    <Route path=":tab" element={<AdminSection />} />
  </Route>
);
