import cn from 'classnames';
import { Activity, Suspense } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useLeaveWorkspace, useWorkspace, useWorkspacePermissions } from '@/api/workspaces';
import { Avatars } from '@/components/Avatar';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import FullPageLoader from '@/components/FullPageLoader';
import { useToast } from '@/hooks/useToast';
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

  // Handle leave
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

  // Navigation tabs - formations has grow to push historique/parametres to the right
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
    },
    {
      id: 'formations',
      label: 'Liste des formations',
      iconLine: 'fr-icon-list-unordered',
      iconFill: 'fr-icon-list-unordered',
      grow: true,
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

          {/* Header with workspace info */}
          <div className="fr-mb-4w">
            <Avatars users={allUsers} size={32} />
            <div
              className="fr-mt-1w fr-mb-2w"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <h1 className="fr-h2 fr-mb-0">{workspace.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isMember && !isOwner && (
                  <button
                    type="button"
                    className="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-logout-box-r-line fr-btn--icon-left"
                    onClick={handleLeave}
                    disabled={leaveWorkspace.isPending}
                  >
                    Quitter l'espace
                  </button>
                )}
              </div>
            </div>
            {workspace.description && (
              <p className="fr-text--sm clamp-3" style={{ maxWidth: '64rem' }}>
                {workspace.description}
              </p>
            )}
          </div>

          {/* Colored navigation */}
          <nav
            className={cn('fr-nav', 'xfr-nav--horizontal', `fr-nav--${workspace.color}`)}
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

          <hr className="fr-mt-0" />

          <ErrorBoundary>
            <Suspense fallback={<FullPageLoader />}>
              <Activity mode={activeTab === 'offre-de-formation' ? 'visible' : 'hidden'}>
                <OffreDeFormation />
              </Activity>
              <Activity mode={activeTab === 'effectifs-etudiants' ? 'visible' : 'hidden'}>
                <EffectifsEtudiants />
              </Activity>
              <Activity mode={activeTab === 'insertion-professionnelle' ? 'visible' : 'hidden'}>
                <InsertionProfessionnelle />
              </Activity>
              <Activity mode={activeTab === 'formations' ? 'visible' : 'hidden'}>
                <Formations />
              </Activity>
              {canEdit && (
                <Activity mode={activeTab === 'historique' ? 'visible' : 'hidden'}>
                  <Historique />
                </Activity>
              )}
              {isOwner && (
                <Activity mode={activeTab === 'parametres' ? 'visible' : 'hidden'}>
                  <Parametres />
                </Activity>
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
