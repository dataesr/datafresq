import { Navigate, useParams } from 'react-router';

export default function RedirectToInformations() {
  const { inf } = useParams<{ inf: string }>();
  return <Navigate to={`/formations/${inf}/informations`} replace />;
}
