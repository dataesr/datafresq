import { Navigate, useParams } from 'react-router';

export default function RedirectToFormations() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/espaces/${id}/offre-de-formation`} replace />;
}
