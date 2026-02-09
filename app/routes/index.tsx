import { Navigate, Routes, useLocation } from 'react-router';
import { useAuth } from '@/api/auth';
import FullPageLoader from '@/components/loaders/FullPageLoader';

import { appRoutes } from './(app)/routes';
import { adminRoutes } from './admin/routes';
import { authRoutes } from './auth/routes';
import { Suspense } from 'react';

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
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith('/auth/');

  if (!user && !isAuthPage) return <RedirectToLogin />;
  if (user && isAuthPage) return <RedirectToApp />;

  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {authRoutes}
        {adminRoutes}
        {appRoutes}
      </Routes>
    </Suspense>
  );
}
