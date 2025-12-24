import cn from 'classnames';
import { Activity, useState } from 'react';
import { Link } from 'react-router';
import { usePublicWorkspaces, useWorkspaces } from '@/api/workspaces';
import { DebouncedInput } from '@/components/debounced-input';
import CreateWorkspaceForm from '@/components/forms/CreateWorkspaceForm';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import type { ReadWorkspace } from '~/schemas/workspaces';

function WorkspaceBadge({ isPublic }: { isPublic: boolean }) {
  return (
    <p
      className={cn(
        'fr-badge fr-badge--sm',
        isPublic ? 'fr-badge--green-emeraude' : 'fr-badge--pink-tuile',
      )}
    >
      {isPublic ? 'Public' : 'Privé'}
    </p>
  );
}

function WorkspaceCardSkeleton() {
  return (
    <div className="fr-card fr-card--sm fr-card--shadow">
      <div className="fr-card__body">
        <div className="fr-card__content">
          <div
            className="fr-my-1w"
            style={{ height: '1.5rem', width: '70%', background: 'var(--background-alt-grey)' }}
          />
          <div
            className="fr-my-1w"
            style={{ height: '1rem', width: '100%', background: 'var(--background-alt-grey)' }}
          />
          <div
            className="fr-my-1w"
            style={{ height: '1rem', width: '50%', background: 'var(--background-alt-grey)' }}
          />
        </div>
      </div>
      <div className="fr-card__header">
        <div
          className="fr-card__img"
          style={{
            height: '120px',
            background: 'var(--background-alt-grey)',
            borderTopLeftRadius: '.5rem',
            borderTopRightRadius: '.5rem',
          }}
        />
      </div>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <AutoGrid type="fill" min={256}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <WorkspaceCardSkeleton key={i} />
      ))}
    </AutoGrid>
  );
}

function WorkspaceCard({ workspace }: { workspace: ReadWorkspace }) {
  const { description, id, isPublic, name, programs, users } = workspace;

  return (
    <div className="fr-card fr-card--sm fr-card--shadow fr-enlarge-link">
      <div className="fr-card__body">
        <div className="fr-card__content">
          <h3 className="fr-card__title">
            <Link to={`/espaces/${id}`}>{name}</Link>
          </h3>
          <p className="fr-card__desc clamp-2">{description || 'Aucune description'}</p>
          <div className="fr-card__start">
            <p className="fr-card__detail fr-mb-1v">
              <span className="fr-icon-group-line fr-pr-1w fr-icon--sm" aria-hidden="true" />
              {(users?.length ?? 0) + 1} utilisateur{(users?.length ?? 0) + 1 > 1 ? 's' : ''}
            </p>
            <p className="fr-card__detail fr-mb-1w">
              <span className="fr-icon-inbox-line fr-pr-1w fr-icon--sm" aria-hidden="true" />
              {programs?.length ?? 0} formation{(programs?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
      <div className="fr-card__header">
        <div className="fr-card__img">
          <img
            alt="texture"
            className="fr-responsive-img"
            src="https://i.imgur.com/cqJ1tS4_d.jpg?maxwidth=800&shape=thumb&fidelity=high"
          />
        </div>
        <ul className="fr-badges-group">
          <li>
            <WorkspaceBadge isPublic={isPublic} />
          </li>
        </ul>
      </div>
    </div>
  );
}

function CreateWorkspaceCard() {
  return (
    <div
      className="fr-card fr-card--sm fr-card--shadow fr--enlarge-link"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <CreateWorkspaceForm triggerLabel="Créer un espace" />
    </div>
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
    <AutoGrid type="fill" min={256} gap="md">
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

      <nav className="fr-nav" aria-label="Navigation des espaces">
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
      {/*<Activity mode={activeTab === 'shared' ? 'visible' : 'hidden'}>
        <SharedWorkspacesTab />
      </Activity>*/}
      <Activity mode={activeTab === 'public' ? 'visible' : 'hidden'}>
        <PublicWorkspacesTab />
      </Activity>
    </div>
  );
}

// Re-export components for use elsewhere
export { WorkspaceCard, WorkspaceCardList, WorkspaceBadge };
