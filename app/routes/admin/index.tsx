import { Navigate, useParams } from 'react-router';

export default function RedirectToUsers() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/admin/utilisateurs`} replace />;
}
