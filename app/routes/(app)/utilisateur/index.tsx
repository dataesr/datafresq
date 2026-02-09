import { Navigate } from 'react-router';

export default function RedirectToProfil() {
  return <Navigate to="/utilisateur/profil" replace />;
}
