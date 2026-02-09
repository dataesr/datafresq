import { Link, useParams } from 'react-router';
import { useWorkspace, useWorkspacePermissions } from '@/api/workspaces';
import { DangerZone } from './components/DangerZone';
import { GeneralSettings } from './components/GeneralSettings';
import { UsersSettings } from './components/UsersSettings';
import { VisibilitySettings } from './components/VisibilitySettings';

export default function Parametres() {
  const { id: workspaceId } = useParams();
  const { data: workspace, isLoading, isError } = useWorkspace(workspaceId!);
  const { isOwner } = useWorkspacePermissions(workspaceId!);

  if (isLoading) {
    return <div className="fr-py-4w">Chargement...</div>;
  }

  if (isError || !workspace) {
    return (
      <div className="fr-pb-4w">
        <p className="fr-text--error">Impossible de charger les paramètres de l'espace.</p>
        <Link to="/espaces" className="fr-btn fr-btn--secondary">
          Retour aux espaces
        </Link>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="fr-pb-4w">
        <p className="fr-text--error">
          Vous n'avez pas les droits pour modifier les paramètres de cet espace.
        </p>
        <Link to={`/espaces/${workspaceId}`} className="fr-btn fr-btn--secondary">
          Retour à l'espace
        </Link>
      </div>
    );
  }

  return (
    <div className="fr-pb-4w">
      <GeneralSettings key={`general-${workspaceId}`} workspace={workspace} />
      <hr />
      <UsersSettings key={`users-${workspaceId}`} workspace={workspace} />
      <hr />
      <VisibilitySettings key={`visibility-${workspaceId}`} workspace={workspace} />
      <hr />
      <DangerZone key={`danger-${workspaceId}`} workspace={workspace} />
    </div>
  );
}
