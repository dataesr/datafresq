import { lazy } from 'react';
import { Navigate, Route } from 'react-router';
import AuthLayout from './layout';

const SignIn = lazy(() => import('./se-connecter'));
const MotDePasseOublie = lazy(() => import('./mot-de-passe-oublie'));
const ReinitialiserMotDePasse = lazy(() => import('./reinitialiser-mot-de-passe'));
const CreerUnCompte = lazy(() => import('./inscription'));

export const authRoutes = (
  <Route path="auth" element={<AuthLayout />}>
    <Route index element={<Navigate to="/auth/se-connecter" />} />
    <Route path="se-connecter" element={<SignIn />} />
    <Route path="mot-de-passe-oublie" element={<MotDePasseOublie />} />
    <Route path="reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
    <Route path="inscription" element={<CreerUnCompte />} />
  </Route>
);
