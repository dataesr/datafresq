import { Navigate, Route } from 'react-router';
import CreerUnCompte from './inscription';
import ReinitialiserMotDePasse from './reinitialiser-mot-de-passe';
import MotDePasseOublie from './mot-de-passe-oublie';
import SignIn from './se-connecter';
import AuthLayout from './layout';

export const authRoutes = (
  <Route path="auth" element={<AuthLayout />}>
    <Route index element={<Navigate to="/auth/se-connecter" />} />
    <Route path="se-connecter" element={<SignIn />} />
    <Route path="mot-de-passe-oublie" element={<MotDePasseOublie />} />
    <Route path="reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
    <Route path="inscription" element={<CreerUnCompte />} />
  </Route>
);
