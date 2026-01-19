import { Navigate, Route, Routes, useLocation } from 'react-router';
import { useAuth } from '@/api/auth';
import Error404 from '@/components/errors/Error404';
import FullPageLoader from '@/components/FullPageLoader';
import AdminLayout from '@/components/layouts/AdminLayout';
import AppLayout from '@/components/layouts/AppLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import EspacesPage from './(app)/espaces';
import EspaceLayout from './(app)/espaces/[id]/layout';
import NouveauEspacePage from './(app)/espaces/nouveau';
import Faq from './(app)/faq';
import FormationPage from './(app)/formations/[id]';
import FormationsListPage from './(app)/formations/index/index';
import Home from './(app)/index/index';
import UserSettingsPage from './(app)/utilisateur';
import AdminPageLayout from './admin/layout';
import CreerUnCompte from './auth/inscription';
import MotDePasseOublie from './auth/mot-de-passe-oublie';
import ReinitialiserMotDePasse from './auth/reinitialiser-mot-de-passe';
import SignIn from './auth/se-connecter';

/**
 * Redirect to login with current path as redirect param
 */
function RedirectToLogin() {
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  const loginUrl = `/auth/se-connecter?redirect=${encodeURIComponent(currentPath)}`;
  return <Navigate to={loginUrl} replace />;
}

/**
 * Redirect authenticated users away from auth pages
 */
function RedirectToApp() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const destination = params.get('redirect') || '/';
  return <Navigate to={destination} replace />;
}

export default function AppRouter() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith('/auth/');

  if (isLoading) return <FullPageLoader />;
  if (!user && !isAuthPage) return <RedirectToLogin />;
  if (user && isAuthPage) return <RedirectToApp />;

  return (
    <Routes>
      {/* Auth routes - only accessible when not logged in */}
      <Route path="auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/se-connecter" />} />
        <Route path="se-connecter" element={<SignIn />} />
        <Route path="mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route path="reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
        <Route path="inscription" element={<CreerUnCompte />} />
      </Route>

      {/* Admin routes - requires admin role */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/utilisateurs" replace />} />
        <Route path=":tab" element={<AdminPageLayout />} />
      </Route>

      {/* App routes - requires authentication */}
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="faq" element={<Faq />} />
        <Route path="formations" element={<FormationsListPage />} />
        <Route path="formations/:inf" element={<FormationPage />} />
        <Route path="formations/:inf/:tab" element={<FormationPage />} />

        <Route path="espaces" element={<EspacesPage />} />
        <Route path="espaces/nouveau" element={<NouveauEspacePage />} />
        <Route path="espaces/:id" element={<EspaceLayout />} />
        <Route path="espaces/:id/:tab" element={<EspaceLayout />} />

        <Route path="utilisateur" element={<UserSettingsPage />} />
        <Route path="utilisateur/:tab" element={<UserSettingsPage />} />

        {/* 404 - inside AppLayout to have header/footer */}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
}
