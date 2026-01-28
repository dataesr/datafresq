import cn from 'classnames';
import { Link } from 'react-router';
import type { ReadWorkspace } from '~/schemas/workspaces';
import './styles.css';

export function WorkspaceCard({ workspace }: { workspace: ReadWorkspace }) {
  const { color, description, id, isPublic, name, programs, users, ownerInfo } = workspace;

  return (
    <div className="fx-card fr-enlarge-link fx-card--sm fx-card--rounded fx-card--lift fx-flex fx-flex-col fx-gap-3w">
      <div
        className="workspace-card__bar"
        style={{ backgroundColor: `var(--artwork-minor-${color})` }}
      />

      <div className="fx-flex fx-items-start fx-justify-center fx-gap-2w">
        <Link to={`/espaces/${id}`} className="fx-flex-grow fr-text--bold fx-clamp fr-mb-0">
          {name}
        </Link>
        <span
          className={cn(
            'fr-badge fr-badge--sm fr-badge--no-icon',
            isPublic ? 'fr-badge--green-emeraude' : 'fr-badge--blue-cumulus',
          )}
        >
          {isPublic ? 'Public' : 'Privé'}
        </span>
      </div>

      <p className="fx-flex-grow fr-text--sm fr-text-mention--grey fx-clamp-2 fr-mb-0">
        {description || 'Aucune description'}
      </p>

      <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
        <span className="fr-icon-user-line fr-icon--sm fr-mr-1v" aria-hidden="true" />
        {ownerInfo?.firstName} {ownerInfo?.lastName}
        <span className="fr-mx-1w">•</span>
        <span className="fr-icon-team-line fr-icon--sm fr-mr-1v" aria-hidden="true" />
        {(users?.length ?? 0) + 1}
        <span className="fr-mx-1w">•</span>
        <span className="fr-icon-file-text-line fr-icon--sm fr-mr-1v" aria-hidden="true" />
        {programs?.length ?? 0} formation{(programs?.length ?? 0) > 1 ? 's' : ''}
      </p>
    </div>
  );
}

export function CreateWorkspaceCard() {
  return (
    <div className="fx-flex workspace-card--create fx-card fr-enlarge-link fx-card--sm fx-card--rounded fx-card--lift">
      <Link
        to="/espaces/nouveau"
        className="fx-flex-grow fx-flex fx-flex-col fx-justify-center fx-items-center"
      >
        <span
          className="fr-icon-add-line fr-icon--lg workspace-card__create-icon"
          aria-hidden="true"
        />
        <p className="fr-text--sm fr-text--bold fr-mb-0 workspace-card__create-text">
          Créer un espace
        </p>
      </Link>
    </div>
  );
}

export function WorkspaceCardSkeleton() {
  return (
    <div className="fx-card fx-card--sm fx-card--rounded fx-flex fx-flex-col fx-gap-3w">
      <div className="workspace-skeleton__bar" />
      <div className="fx-flex fx-justify-between">
        <div className="workspace-skeleton__title" />
        <div className="workspace-skeleton__badge" />
      </div>
      <div className="fx-flex-grow">
        <div className="workspace-skeleton__desc" />
      </div>
      <div className="workspace-skeleton__line" />
    </div>
  );
}
