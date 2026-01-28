import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Activity, Suspense } from 'react';
import { Link } from 'react-router';
import { usePublicWorkspaces, useSharedWorkspaces, useWorkspaces } from '@/api/workspaces';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import { CreateWorkspaceCard, WorkspaceCard } from './components/WorkspaceCard';
import { WorkspaceSkeleton } from './components/WorkspaceSkeleton';

function MyWorkspacesList() {
  const { data: workspaces } = useWorkspaces();

  return (
    <AutoGrid type="fill" min={320} gap="md">
      <CreateWorkspaceCard />
      {workspaces?.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </AutoGrid>
  );
}

function SharedWorkspacesList() {
  const { data: workspaces } = useSharedWorkspaces();

  if (!workspaces?.length) {
    return (
      <div className="fr-callout">
        <h3 className="fr-callout__title">Aucun espace de travail</h3>
        <p className="fr-callout__text">Aucun espace partagé avec vous pour le moment.</p>
      </div>
    );
  }

  return (
    <AutoGrid type="fill" min={320} gap="md">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </AutoGrid>
  );
}

function PublicWorkspacesList() {
  const { data: workspaces } = usePublicWorkspaces();

  if (!workspaces?.length) {
    return (
      <div className="fr-callout">
        <h3 className="fr-callout__title">Aucun espace de travail</h3>
        <p className="fr-callout__text">Aucun espace de travail public trouvé.</p>
      </div>
    );
  }

  return (
    <AutoGrid type="fill" min={320} gap="md">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </AutoGrid>
  );
}

export default function EspacesPage() {
  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringLiteral(['my', 'shared', 'public'] as const).withDefault('my'),
  );

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
        <Suspense fallback={<WorkspaceSkeleton />}>
          <MyWorkspacesList />
        </Suspense>
      </Activity>

      <Activity mode={activeTab === 'shared' ? 'visible' : 'hidden'}>
        <Suspense fallback={<WorkspaceSkeleton />}>
          <SharedWorkspacesList />
        </Suspense>
      </Activity>

      <Activity mode={activeTab === 'public' ? 'visible' : 'hidden'}>
        <Suspense fallback={<WorkspaceSkeleton />}>
          <PublicWorkspacesList />
        </Suspense>
      </Activity>
    </div>
  );
}
