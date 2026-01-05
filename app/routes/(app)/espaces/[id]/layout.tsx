import cn from 'classnames';
import { Activity, Suspense } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useLeaveWorkspace, useWorkspace, useWorkspacePermissions } from '@/api/workspaces';
import { Avatars } from '@/components/Avatar';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import FullPageLoader from '@/components/FullPageLoader';
import { useToast } from '@/hooks/useToast';
import Formations from './formations';
import Historique from './historique';
import Parametres from './parametres';
import TableauDeBord from './tableau-de-bord';

export default function EspaceLayout() {
  const { id: workspaceId = '', tab: activeTab = 'tableau-de-bord' } = useParams<{
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

  const tabs = [
    { id: 'tableau-de-bord' as const, label: 'Tableau de bord', icon: 'fr-icon-pie-chart' },
    { id: 'formations' as const, label: 'Formations', icon: 'fr-icon-shopping-cart-2' },
    {
      id: 'historique' as const,
      label: 'Historique',
      icon: 'fr-icon-time',
      requireEdit: true as const,
    },
    {
      id: 'parametres' as const,
      label: 'Paramètres',
      icon: 'fr-icon-settings-5',
      requireOwner: true as const,
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
          <div className="fr-mb-4w">
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <Avatars users={allUsers} size={32} />
                <div
                  className="fr-mt-1w fr-mb-2w"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                  }}
                >
                  <h1 className="fr-h2 fr-mb-0">{workspace.name}</h1>
                  <p className="fr-text-title--grey fr-mb-0">
                    <span className="fr-icon-inbox-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
                    {workspace.programs.length} formation{workspace.programs.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div
                  style={{
                    height: '4px',
                    backgroundColor: `var(--artwork-minor-${workspace.color})`,
                    borderRadius: '2px',
                    marginBottom: '.75rem',
                  }}
                />
                {workspace.description && (
                  <p className="fr-text--sm" style={{ maxWidth: '64rem' }}>
                    {workspace.description}
                  </p>
                )}
              </div>
              {isMember && !isOwner && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-logout-box-line fr-btn--icon-left"
                    onClick={handleLeave}
                    disabled={leaveWorkspace.isPending}
                  >
                    Quitter
                  </button>
                </div>
              )}
            </div>
          </div>

          <nav className="fr-nav xfr-nav--horizontal" aria-label="Navigation de l'espace">
            <ul className="fr-nav__list">
              {tabs.map((tab) => (
                <li key={tab.id} className="fr-nav__item">
                  <Link
                    className="fr-nav__link"
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                    to={`/espaces/${workspaceId}/${tab.id}`}
                    replace
                  >
                    <span
                      className={cn('fr-icon--sm fr-mr-1w', {
                        [`${tab.icon}-line`]: activeTab !== tab.id,
                        [`${tab.icon}-fill`]: activeTab === tab.id,
                      })}
                      aria-hidden="true"
                    />
                    {tab.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <hr className="fr-mt-0" />

          <ErrorBoundary>
            <Suspense fallback={<FullPageLoader />}>
              <Activity mode={activeTab === 'tableau-de-bord' ? 'visible' : 'hidden'}>
                <TableauDeBord />
              </Activity>
              <Activity mode={activeTab === 'historique' ? 'visible' : 'hidden'}>
                <Historique />
              </Activity>
              <Activity mode={activeTab === 'parametres' ? 'visible' : 'hidden'}>
                <Parametres />
              </Activity>
              <Activity mode={activeTab === 'formations' ? 'visible' : 'hidden'}>
                <Formations />
              </Activity>
            </Suspense>
          </ErrorBoundary>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
