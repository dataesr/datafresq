import { useParams } from 'react-router';
import { useWorkspaceHistory } from '@/api/workspaces';
import type { WorkspaceEvent } from '~/schemas/workspaces';

export default function Historique() {
  const { id } = useParams<{ id: string }>();
  const workspaceId = id!;

  const { data: history } = useWorkspaceHistory(workspaceId, { limit: 50 });

  const getEventLabel = (event: WorkspaceEvent): string => {
    switch (event.type) {
      case 'workspace_created':
        return `a créé l'espace de travail "${event.details.workspaceName}"`;
      case 'workspace_updated':
        return `a modifié l'espace de travail`;
      case 'user_added':
        return `a ajouté ${event.details.targetUserInfo ? `${event.details.targetUserInfo.firstName} ${event.details.targetUserInfo.lastName}` : 'un utilisateur'} (${event.details.userRole})`;
      case 'user_removed':
        return `a retiré ${event.details.targetUserInfo ? `${event.details.targetUserInfo.firstName} ${event.details.targetUserInfo.lastName}` : 'un utilisateur'}`;
      case 'user_role_changed':
        return `a changé le rôle de ${event.details.targetUserInfo ? `${event.details.targetUserInfo.firstName} ${event.details.targetUserInfo.lastName}` : 'un utilisateur'} en ${event.details.userRole}`;
      case 'program_added':
        return `a ajouté ${event.details.programIds?.length || 0} formation(s)`;
      case 'program_removed':
        return `a retiré ${event.details.programIds?.length || 0} formation(s)`;
      case 'ownership_transferred':
        return `a transféré la propriété à ${event.details.targetUserInfo ? `${event.details.targetUserInfo.firstName} ${event.details.targetUserInfo.lastName}` : 'un utilisateur'}`;
      default:
        return 'action inconnue';
    }
  };

  const getEventIcon = (type: WorkspaceEvent['type']): string => {
    switch (type) {
      case 'workspace_created':
        return 'fr-icon-add-circle-line';
      case 'workspace_updated':
        return 'fr-icon-edit-line';
      case 'user_added':
        return 'fr-icon-user-add-line';
      case 'user_removed':
        return 'fr-icon-user-remove-line';
      case 'user_role_changed':
        return 'fr-icon-user-setting-line';
      case 'program_added':
        return 'fr-icon-file-add-line';
      case 'program_removed':
        return 'fr-icon-delete-bin-line';
      case 'ownership_transferred':
        return 'fr-icon-arrow-right-line';
      default:
        return 'fr-icon-information-line';
    }
  };

  if (!history?.data.length) {
    return (
      <div className="fr-callout fr-my-4w">
        <h3 className="fr-callout__title">Aucun historique</h3>
        <p className="fr-callout__text">Aucune activité enregistrée pour cet espace de travail.</p>
      </div>
    );
  }

  return (
    <div className="fr-pb-4w">
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {history.data.map((event) => (
          <li
            key={event.id}
            className="fx-flex fx-items-start fx-gap-2w fr-py-2w fr-px-0"
            style={{
              borderBottom: '1px solid var(--border-default-grey)',
            }}
          >
            <span className={`${getEventIcon(event.type)} fr-icon--sm`} aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <p className="fr-mb-0">
                <strong>
                  {event.actorInfo?.firstName} {event.actorInfo?.lastName}
                </strong>{' '}
                {getEventLabel(event)}
              </p>
              <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
                {new Date(event.timestamp).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
