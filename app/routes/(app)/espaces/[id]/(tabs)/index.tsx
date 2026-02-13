import { Suspense } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLeaveWorkspace, useWorkspace, useWorkspacePermissions } from '@/api/workspaces';
import { Avatars } from '@/components/Avatar';
import { Breadcrumb } from '@/components/Breadcrumb';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import PageContentLoader from '@/components/loaders/PageContentLoader';
import { TabActivityPanel } from '@/components/TabActivityPanel';
import { Tabnav, TabnavItem } from '@/components/ui/Tabnav';
import { toast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import EffectifsEtudiants from './effectifs-etudiants';
import Formations from './formations';
import Historique from './historique';
import InsertionProfessionnelle from './insertion-professionnelle';
import OffreDeFormation from './offre-de-formation';
import Parametres from './parametres';

export default function Espace() {
  const { id: workspaceId = '', tab: activeTab = 'offre-de-formation' } = useParams<{
    id: string;
    tab?: string;
  }>();
  const navigate = useNavigate();

  const { data: workspace } = useWorkspace(workspaceId);
  const { isOwner, isMember, canEdit } = useWorkspacePermissions(workspaceId);
  const leaveWorkspace = useLeaveWorkspace();

  const handleLeave = () => {
    toast.promise(leaveWorkspace.mutateAsync(workspaceId), {
      loading: { title: "Quitter l'espace..." },
      success: {
        title: "Vous avez quitté l'espace de travail",
      },
      error: (err) => ({
        title: 'Erreur',
        description: getErrorMessage(err),
      }),
    });
    navigate('/espaces');
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
      <Suspense fallback={<PageContentLoader />}>
        <div>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Espaces de travail', href: '/espaces' },
              { label: workspace.name, current: true },
            ]}
          />

          <div>
            <div className="fr-mb-1w fx-flex fx-items-center fx-flex-wrap fx-gap-2w">
              <h1 className="fr-h3 fr-mb-0 fx-flex-grow">{workspace.name}</h1>
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
              <p className="fr-text--sm fx-clamp-3 fr-mb-0" style={{ maxWidth: '64rem' }}>
                {workspace.description}
              </p>
            )}
          </div>
          <Tabnav
            breakpoint="lg"
            color={workspace.color}
            currentLabel={tabs.find((tab) => tab.id === activeTab)?.label}
          >
            {tabs.map((tab) => (
              <TabnavItem
                key={tab.id}
                to={`/espaces/${workspaceId}/${tab.id}`}
                icon={tab.iconLine}
                iconActive={tab.iconFill}
                grow={tab.grow}
                active={activeTab === tab.id}
              >
                {tab.label} {tab.count ? `(${tab.count})` : ''}
              </TabnavItem>
            ))}
          </Tabnav>

          <TabActivityPanel mode={activeTab === 'offre-de-formation' ? 'visible' : 'hidden'}>
            <OffreDeFormation />
          </TabActivityPanel>
          <TabActivityPanel mode={activeTab === 'effectifs-etudiants' ? 'visible' : 'hidden'}>
            <EffectifsEtudiants />
          </TabActivityPanel>
          <TabActivityPanel mode={activeTab === 'insertion-professionnelle' ? 'visible' : 'hidden'}>
            <InsertionProfessionnelle />
          </TabActivityPanel>
          <TabActivityPanel mode={activeTab === 'formations' ? 'visible' : 'hidden'}>
            <Formations />
          </TabActivityPanel>
          {canEdit && (
            <TabActivityPanel mode={activeTab === 'historique' ? 'visible' : 'hidden'}>
              <Historique />
            </TabActivityPanel>
          )}
          {isOwner && (
            <TabActivityPanel mode={activeTab === 'parametres' ? 'visible' : 'hidden'}>
              <Parametres />
            </TabActivityPanel>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
