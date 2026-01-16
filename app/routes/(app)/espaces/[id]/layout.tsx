import cn from 'classnames';
import { Activity, Suspense } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useLeaveWorkspace, useWorkspace, useWorkspacePermissions } from '@/api/workspaces';
import { Avatars } from '@/components/Avatar';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import FullPageLoader from '@/components/FullPageLoader';
import { useToast } from '@/hooks/useToast';

interface TabErrorFallbackProps {
  tabName: string;
  resetError: () => void;
}

function TabErrorFallback({ tabName, resetError }: TabErrorFallbackProps) {
  return (
    <div className="fr-callout fr-callout--red-marianne fr-my-4w">
      <h3 className="fr-callout__title">Erreur dans l'onglet {tabName}</h3>
      <p className="fr-callout__text">
        Une erreur s'est produite lors du chargement de cet onglet. Les autres onglets restent
        accessibles.
      </p>
      <button type="button" className="fr-btn fr-btn--secondary fr-mt-2w" onClick={resetError}>
        Réessayer
      </button>
    </div>
  );
}

import EffectifsEtudiants from './effectifs-etudiants';
import Formations from './formations';
import Historique from './historique';
import InsertionProfessionnelle from './insertion-professionnelle';
import OffreDeFormation from './offre-de-formation';
import Parametres from './parametres';

export default function EspaceLayout() {
  const { id: workspaceId = '', tab: activeTab = 'offre-de-formation' } = useParams<{
    id: string;
    tab?: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: workspace } = useWorkspace(workspaceId);
  const { isOwner, isMember, canEdit } = useWorkspacePermissions(workspaceId);
  const leaveWorkspace = useLeaveWorkspace();

  const handleLeave = () => {
    leaveWorkspace.mutate(workspaceId, {
      onSuccess: () => {
        toast({
          type: 'success',
          description: "Vous avez quitté l'espace de travail",
        });
        navigate('/espaces');
      },
      onError: (err) => {
        toast({
          type: 'error',
          description: err.message,
        });
      },
    });
  };

  const allUsers = [
    workspace.ownerInfo
      ? {
          id: workspace.owner,
          email: workspace.ownerInfo.email,
          firstName: workspace.ownerInfo.firstName,
          lastName: workspace.ownerInfo.lastName,
        }
      : null,
    ...workspace.users.map((u) => ({
      id: u.userId,
      email: u.userInfo?.email ?? '',
      firstName: u.userInfo?.firstName,
      lastName: u.userInfo?.lastName,
    })),
  ].filter(Boolean) as {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  }[];

  const tabs = [
    {
      id: 'offre-de-formation',
      label: 'Offre de formation',
      iconLine: 'fr-icon-file-line',
      iconFill: 'fr-icon-file-fill',
    },
    {
      id: 'effectifs-etudiants',
      label: 'Effectifs étudiants',
      iconLine: 'fr-icon-team-line',
      iconFill: 'fr-icon-team-fill',
    },
    {
      id: 'insertion-professionnelle',
      label: 'Insertion professionnelle',
      iconLine: 'fr-icon-briefcase-line',
      iconFill: 'fr-icon-briefcase-fill',
      grow: true,
    },
    {
      id: 'formations',
      label: 'Formations',
      iconLine: 'fr-icon-list-unordered',
      iconFill: 'fr-icon-list-unordered',
      count: workspace.programs.length,
    },
    {
      id: 'historique',
      label: 'Historique',
      iconLine: 'fr-icon-time-line',
      iconFill: 'fr-icon-time-fill',
      requireEdit: true,
    },
    {
      id: 'parametres',
      label: 'Paramètres',
      iconLine: 'fr-icon-settings-5-line',
      iconFill: 'fr-icon-settings-5-fill',
      requireOwner: true,
    },
  ].filter((tab) => {
    if (tab.requireOwner) return isOwner;
    if (tab.requireEdit) return canEdit;
    return true;
  });

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullPageLoader />}>
        <div className="page">
          <nav className="fr-breadcrumb" aria-label="vous êtes ici :">
            <button
              className="fr-breadcrumb__button"
              aria-expanded="false"
              aria-controls="breadcrumb"
              type="button"
            >
              Voir le fil d'Ariane
            </button>
            <div className="fr-collapse" id="breadcrumb">
              <ol className="fr-breadcrumb__list">
                <li>
                  <Link className="fr-breadcrumb__link" to="/">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link className="fr-breadcrumb__link" to="/espaces">
                    Espaces de travail
                  </Link>
                </li>
                <li>
                  <span className="fr-breadcrumb__link" aria-current="page">
                    {workspace.name}
                  </span>
                </li>
              </ol>
            </div>
          </nav>

          <div>
            <div
              className="fr-mb-1w"
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <h1 className="fr-h3 fr-mb-0" style={{ flexGrow: 1 }}>
                {workspace.name}
              </h1>
              <Avatars users={allUsers} size={32} />
              {isMember && !isOwner && (
                <button
                  type="button"
                  className="fr-btn fr-btn--sm fr-btn--tertiary fr-btn--error fr-icon-logout-box-r-line fr-btn--icon-left"
                  onClick={handleLeave}
                  disabled={leaveWorkspace.isPending}
                >
                  Quitter l'espace
                </button>
              )}
            </div>
            {workspace.description && (
              <p className="fr-text--sm clamp-3 fr-mb-0" style={{ maxWidth: '64rem' }}>
                {workspace.description}
              </p>
            )}
          </div>
          <nav
            className={cn(
              'fr-nav',
              'fx-nav--horizontal',
              'fx-nav--sticky',
              `fr-nav--${workspace.color}`,
            )}
            aria-label="Navigation de l'espace"
          >
            <ul className="fr-nav__list">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <li
                    key={tab.id}
                    className="fr-nav__item"
                    style={{ flexGrow: tab.grow ? 1 : undefined }}
                  >
                    <Link
                      className="fr-nav__link"
                      aria-current={isActive ? 'page' : undefined}
                      to={`/espaces/${workspaceId}/${tab.id}`}
                      replace
                    >
                      <span
                        className={cn(
                          'fr-icon--sm fr-mr-1w',
                          isActive ? tab.iconFill : tab.iconLine,
                        )}
                        aria-hidden="true"
                      />
                      {tab.label} {tab.count && `(${tab.count})`}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Suspense fallback={<FullPageLoader />}>
            <Activity mode={activeTab === 'offre-de-formation' ? 'visible' : 'hidden'}>
              <ErrorBoundary
                fallback={({ resetError }) => (
                  <TabErrorFallback tabName="Offre de formation" resetError={resetError} />
                )}
              >
                <OffreDeFormation />
              </ErrorBoundary>
            </Activity>
            <Activity mode={activeTab === 'effectifs-etudiants' ? 'visible' : 'hidden'}>
              <ErrorBoundary
                fallback={({ resetError }) => (
                  <TabErrorFallback tabName="Effectifs étudiants" resetError={resetError} />
                )}
              >
                <EffectifsEtudiants />
              </ErrorBoundary>
            </Activity>
            <Activity mode={activeTab === 'insertion-professionnelle' ? 'visible' : 'hidden'}>
              <ErrorBoundary
                fallback={({ resetError }) => (
                  <TabErrorFallback tabName="Insertion professionnelle" resetError={resetError} />
                )}
              >
                <InsertionProfessionnelle />
              </ErrorBoundary>
            </Activity>
            <Activity mode={activeTab === 'formations' ? 'visible' : 'hidden'}>
              <ErrorBoundary
                fallback={({ resetError }) => (
                  <TabErrorFallback tabName="Formations" resetError={resetError} />
                )}
              >
                <Formations />
              </ErrorBoundary>
            </Activity>
            {canEdit && (
              <Activity mode={activeTab === 'historique' ? 'visible' : 'hidden'}>
                <ErrorBoundary
                  fallback={({ resetError }) => (
                    <TabErrorFallback tabName="Historique" resetError={resetError} />
                  )}
                >
                  <Historique />
                </ErrorBoundary>
              </Activity>
            )}
            {isOwner && (
              <Activity mode={activeTab === 'parametres' ? 'visible' : 'hidden'}>
                <ErrorBoundary
                  fallback={({ resetError }) => (
                    <TabErrorFallback tabName="Paramètres" resetError={resetError} />
                  )}
                >
                  <Parametres />
                </ErrorBoundary>
              </Activity>
            )}
          </Suspense>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
