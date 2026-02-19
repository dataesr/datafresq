import { Navigate } from 'react-router';

export default function RedirectToUsers() {
  return <Navigate to={`/admin/utilisateurs`} replace />;
}
