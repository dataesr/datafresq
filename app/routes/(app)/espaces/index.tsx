import cn from 'classnames';
import { Activity, useState } from 'react';
import { Link } from 'react-router';
import { usePublicWorkspaces, useWorkspaces } from '@/api/workspaces';
import { DebouncedInput } from '@/components/debounced-input';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import type { ReadWorkspace } from '~/schemas/workspaces';

function WorkspaceBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <span
      className={cn(
        'fr-badge fr-badge--sm fr-badge--no-icon',
        isPublic ? 'fr-badge--green-emeraude' : 'fr-badge--blue-cumulus',
      )}
    >
      {isPublic ? 'Public' : 'Privé'}
    </span>
  );
}

function WorkspaceCardSkeleton() {
  return (
    <div className="fx-card fx-card--sm fx-card--rounded">
      <div
        style={{
          height: '4px',
          width: '100%',
          background: 'var(--background-alt-grey)',
          borderRadius: '2px',
          marginBottom: '1rem',
        }}
      />
      <div
        style={{
          height: '1.25rem',
          width: '60%',
          background: 'var(--background-alt-grey)',
          marginBottom: '0.75rem',
          borderRadius: '2px',
        }}
      />
      <div
        style={{
          height: '0.875rem',
          width: '100%',
          background: 'var(--background-alt-grey)',
          marginBottom: '0.5rem',
          borderRadius: '2px',
        }}
      />
      <div
        style={{
          height: '0.875rem',
          width: '40%',
          background: 'var(--background-alt-grey)',
          borderRadius: '2px',
        }}
      />
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <AutoGrid type="fill" min={320}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <WorkspaceCardSkeleton key={i} />
      ))}
    </AutoGrid>
  );
}

function WorkspaceCard({ workspace }: { workspace: ReadWorkspace }) {
  const { color, description, id, isPublic, name, programs, users, ownerInfo } = workspace;

  return (
    <div
      className="fx-card fr-enlarge-link fx-card--sm fx-card--rounded fx-card--lift"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      {/* Color bar */}
      <div
        style={{
          height: '4px',
          backgroundColor: `var(--artwork-minor-${color})`,
          borderRadius: '2px',
          marginBottom: '0.75rem',
        }}
      />

      {/* Header: title + badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <Link
          to={`/espaces/${id}`}
          className="fr-text--md fr-text--bold fr-mb-0 clamp-1"
          style={{ flex: 1 }}
        >
          {name}
        </Link>
        <WorkspaceBadge isPublic={isPublic} />
      </div>

      {/* Description */}
      <p className="fr-text--sm fr-text-mention--grey clamp-2 fr-mb-2w">
        {description || 'Aucune description'}
      </p>

      {/* Footer: metadata */}
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

function CreateWorkspaceCard() {
  return (
    <Link
      to="/espaces/nouveau"
      className="fx-card fx-card--sm fx-card--rounded"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '140px',
        textDecoration: 'none',
        border: '2px dashed var(--border-default-grey)',
        background: 'transparent',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <span
          className="fr-icon-add-line fr-icon--lg"
          aria-hidden="true"
          style={{
            color: 'var(--text-action-high-blue-france)',
            marginBottom: '0.5rem',
            display: 'block',
          }}
        />
        <p
          className="fr-text--sm fr-text--bold fr-mb-0"
          style={{ color: 'var(--text-action-high-blue-france)' }}
        >
          Créer un espace
        </p>
      </div>
    </Link>
  );
}

function WorkspaceCardList({
  workspaces,
  isLoading,
  showCreateCard = false,
}: {
  workspaces: ReadWorkspace[] | undefined;
  isLoading: boolean;
  showCreateCard?: boolean;
}) {
  if (isLoading) return <WorkspaceSkeleton />;

  if (!workspaces?.length && !showCreateCard) {
    return (
      <div className="fr-callout">
        <h3 className="fr-callout__title">Aucun espace de travail</h3>
        <p className="fr-callout__text">
          Aucun espace de travail trouvé. Créez votre premier espace de travail pour commencer.
        </p>
      </div>
    );
  }

  return (
    <AutoGrid type="fill" min={320} gap="md">
      {showCreateCard && <CreateWorkspaceCard />}
      {workspaces?.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </AutoGrid>
  );
}

function MyWorkspacesTab() {
  const { data: workspaces, isLoading } = useWorkspaces();

  return <WorkspaceCardList workspaces={workspaces} isLoading={isLoading} showCreateCard />;
}

function PublicWorkspacesTab() {
  const [query, setQuery] = useState('');
  const { data: workspaces, isLoading } = usePublicWorkspaces(query);

  return (
    <>
      <DebouncedInput
        className="fr-mb-3w"
        onChange={(value) => setQuery(value)}
        placeholder="Rechercher des espaces publics..."
        type="text"
        size="md"
        value={query}
      />
      <WorkspaceCardList workspaces={workspaces} isLoading={isLoading} />
    </>
  );
}

export default function EspacesPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'public' | 'shared'>('my');

  return (
    <div className="page">
      <nav className="fr-breadcrumb" aria-label="vous êtes ici :">
        <button
          type="button"
          className="fr-breadcrumb__button"
          aria-expanded="false"
          aria-controls="breadcrumb-1"
        >
          Voir le fil d'Ariane
        </button>
        <div className="fr-collapse" id="breadcrumb-1">
          <ol className="fr-breadcrumb__list">
            <li>
              <Link className="fr-breadcrumb__link" to="/">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="#" className="fr-breadcrumb__link" aria-current="page">
                Espaces
              </Link>
            </li>
          </ol>
        </div>
      </nav>
      <div className="fr-grid-row fr-grid-row--middle fr-mb-4w">
        <div className="fr-col">
          <h1 className="fr-h2 fr-mb-1w">Espaces de travail</h1>
          <p className="fr-text--lg fr-text-mention--grey fr-mb-0">
            Gérez vos espaces de travail et explorez les espaces publics
          </p>
        </div>
      </div>

      <nav className="fr-nav xfr-nav--horizontal" aria-label="Navigation des espaces">
        <ul className="fr-nav__list">
          <li className="fr-nav__item">
            <button
              type="button"
              className="fr-nav__link"
              aria-current={activeTab === 'my' ? 'page' : undefined}
              onClick={() => setActiveTab('my')}
            >
              <span className="fr-icon-user-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
              Mes espaces
            </button>
          </li>
          <li className="fr-nav__item">
            <button
              type="button"
              className="fr-nav__link"
              aria-current={activeTab === 'shared' ? 'page' : undefined}
              onClick={() => setActiveTab('shared')}
            >
              <span className="fr-icon-share-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
              Partagés avec moi
            </button>
          </li>
          <li className="fr-nav__item">
            <button
              type="button"
              className="fr-nav__link"
              aria-current={activeTab === 'public' ? 'page' : undefined}
              onClick={() => setActiveTab('public')}
            >
              <span className="fr-icon-global-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
              Espaces publics
            </button>
          </li>
        </ul>
      </nav>

      <hr className="fr-mt-0 fr-mb-4w" />

      <Activity mode={activeTab === 'my' ? 'visible' : 'hidden'}>
        <MyWorkspacesTab />
      </Activity>
      <Activity mode={activeTab === 'shared' ? 'visible' : 'hidden'}>
        <WorkspaceSkeleton />
      </Activity>
      <Activity mode={activeTab === 'public' ? 'visible' : 'hidden'}>
        <PublicWorkspacesTab />
      </Activity>
    </div>
  );
}

// Re-export components for use elsewhere
export { WorkspaceCard, WorkspaceCardList, WorkspaceBadge };
