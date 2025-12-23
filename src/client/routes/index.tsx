import { Navigate, Route, Routes } from 'react-router';
import Error404 from '@/components/errors/Error404';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import AdminLayout from '@/components/layouts/AdminLayout';
import AppLayout from '@/components/layouts/AppLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import EspacesPage from './(app)/espaces';
import EspaceLayout from './(app)/espaces/[id]/layout';
import FormationPage from './(app)/formations/[id]';
import FormationsListPage from './(app)/formations/index/index';
import Home from './(app)';
import UserSettingsPage from './(app)/utilisateur';
import AdminPageLayout from './admin/layout';
import CreerUnCompte from './auth/creer-un-compte';
import MotDePasseOublie from './auth/mot-de-passe-oublie';
import ReinitialiserMotDePasse from './auth/reinitialiser-mot-de-passe';
import SignIn from './auth/se-connecter';

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Auth routes */}
        <Route path="auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth/se-connecter" />} />
          <Route path="se-connecter" element={<SignIn />} />
          <Route path="mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
          <Route path="creer-un-compte" element={<CreerUnCompte />} />
        </Route>

        {/* Admin routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/utilisateurs" replace />} />
          <Route path=":tab" element={<AdminPageLayout />} />
        </Route>

        {/* Main app routes */}
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="formations" element={<FormationsListPage />} />
          <Route path="formations/:inf" element={<FormationPage />} />
          <Route path="faq" element={<div />} />

          <Route path="espaces" element={<EspacesPage />} />
          <Route path="espaces/:id" element={<EspaceLayout />} />
          <Route path="espaces/:id/:tab" element={<EspaceLayout />} />

          <Route path="utilisateur" element={<UserSettingsPage />} />
          <Route path="utilisateur/:tab" element={<UserSettingsPage />} />
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
    </ErrorBoundary>
  );
}
