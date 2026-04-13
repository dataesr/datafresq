import cn from 'classnames';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useSharedWorkspaces, useWorkspaces } from '@/api/workspaces';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { useActiveWorkspace } from '@/contexts/ActiveWorkspaceContext';
import type { ReadWorkspace } from '~/schemas/workspaces';
import './sidemenu.css';

function WorkspaceItem({
  workspace,
  active = false,
  pinned = false,
}: {
  workspace?: ReadWorkspace | null;
  active?: boolean;
  pinned?: boolean;
}) {
  if (!workspace) {
    return <i className="fr-text-mention--grey fr-text--sm fr-mb-0 fr-px-1w">Aucun espace actif</i>;
  }
  return (
    <li className="sidemenu-workspaces__item">
      <Link
        to={`/espaces/${workspace.id}`}
        className={cn('sidemenu-workspaces__link', {
          'sidemenu-workspaces__link--active': active,
        })}
      >
        <span
          className="sidemenu-workspaces__color"
          style={{
            backgroundColor: `var(--artwork-minor-${workspace.color})`,
          }}
          aria-hidden="true"
        />
        <span className="sidemenu-workspaces__content fx-flex-grow">
          <span className="sidemenu-workspaces__name">{workspace.name}</span>
          <span className="sidemenu-workspaces__meta">
            {workspace.programs?.length || 0} formation
            {(workspace.programs?.length || 0) > 1 ? 's' : ''}
          </span>
        </span>
        {pinned && <span className="fr-icon--map-pin-2-line" />}
      </Link>
    </li>
  );
}

function ActiveWorkspaceSection() {
  const { pathname } = useLocation();
  const { activeWorkspace, clearActiveWorkspace } = useActiveWorkspace();
  return (
    <div className="fr-px-1w fr-mb-2w">
      <div className="fx-flex fx-items-center fx-gap-1w fr-pb-1w">
        <span className="fr-text--sm fr-mb-0 fr-text--heavy fx-flex-grow">ESPACE ACTIF</span>
        <WorkspaceSelector
          title="Définir l'espace actif"
          buttonIcon="fr-icon-arrow-left-right-fill"
        />
        {activeWorkspace && (
          <button
            type="button"
            className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-close-line"
            title="Désélectionner l'espace actif"
            aria-label="Désélectionner l'espace actif"
            onClick={(e) => {
              e.stopPropagation();
              clearActiveWorkspace();
            }}
          />
        )}
      </div>
      <ul className="sidemenu-workspaces">
        <WorkspaceItem
          workspace={activeWorkspace}
          active={pathname.startsWith(`/espaces/${activeWorkspace?.id}`)}
        />
      </ul>
    </div>
  );
}

function WorkspaceList({ workspaces }: { workspaces: ReadWorkspace[] }) {
  if (!workspaces?.length)
    return <p className="fr-text--sm fr-text-mention--grey fr-pl-2w">Aucun espace de travail</p>;
  return (
    <ul className="sidemenu-workspaces">
      {workspaces.map((workspace) => (
        <WorkspaceItem key={workspace.id} workspace={workspace} />
      ))}
    </ul>
  );
}

const menuLinks = [
  {
    label: 'Accueil',
    icon: 'fr-icon-home-4',
    path: '/',
  },
  {
    label: 'Formations',
    icon: 'fr-icon-compass-3',
    path: '/formations',
  },
  {
    label: 'Espaces',
    icon: 'fr-icon-folder-2',
    path: '/espaces',
  },
  {
    label: 'Guide',
    icon: 'fr-icon-book-2',
    path: '/guide',
  },
  {
    label: 'Etablissements - Effectifs',
    icon: 'fr-icon-building',
    path: '/etablissements',
  },
];

export default function Sidemenu() {
  const { pathname } = useLocation();
  const { data: workspaces } = useWorkspaces();
  const { data: sharedWorkspaces } = useSharedWorkspaces();
  const { activeWorkspace } = useActiveWorkspace();
  const [myWorkspacesOpen, setMyWorkspacesOpen] = useState(true);
  const [sharedWorkspacesOpen, setSharedWorkspacesOpen] = useState(true);

  return (
    <nav className="sidemenu fr-sidemenu fr-sidemenu--sticky-full-height" aria-label="Menu">
      <div className="fr-sidemenu__inner">
        <div className="" id="sidemenu">
          <ul className="fr-sidemenu__list">
            {menuLinks.map((link) => (
              <li className="fr-sidemenu__item" key={link.path}>
                <Link
                  className={cn('fr-sidemenu__link', {
                    [`${link.icon}-fill`]: pathname === link.path,
                    [`${link.icon}-line`]: pathname !== link.path,
                  })}
                  to={link.path}
                  aria-current={pathname === link.path}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <hr className="fr-py-1v fr-my-1w" />
        <div>
          <ActiveWorkspaceSection />
        </div>
        <hr className="fr-py-1v fr-my-1w" />
        <div className="fr-px-1w">
          <div className="fx-flex fx-justify-between fx-items-center fr-pb-1w">
            <span className="fr-text--sm fr-mb-0 fr-text--heavy">MES ESPACES</span>
            <div className="fx-flex fx-gap-1v">
              <Link
                to="/espaces/nouveau"
                className="fr-btn fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--sm"
                title="Créer un espace"
                aria-label="Créer un espace"
              />
              <button
                type="button"
                className={cn('fr-btn fr-btn--tertiary-no-outline fr-btn--sm', {
                  'fr-icon-arrow-down-s-line': myWorkspacesOpen,
                  'fr-icon-arrow-right-s-line': !myWorkspacesOpen,
                })}
                title={myWorkspacesOpen ? 'Masquer mes espaces' : 'Afficher mes espaces'}
                aria-label={myWorkspacesOpen ? 'Masquer mes espaces' : 'Afficher mes espaces'}
                aria-expanded={myWorkspacesOpen}
                onClick={() => setMyWorkspacesOpen(!myWorkspacesOpen)}
              />
            </div>
          </div>
          {myWorkspacesOpen && (
            <WorkspaceList
              workspaces={workspaces.filter((workspace) => workspace.id !== activeWorkspace?.id)}
            />
          )}
        </div>
        {!!sharedWorkspaces.length && (
          <div className="fr-mt-2w fr-px-1w">
            <div className="fx-flex fx-justify-between fx-items-center fr-pb-2w">
              <span className="fr-text--md fr-mb-0 fr-text--heavy">PARTAGÉS AVEC MOI</span>
              <button
                type="button"
                className={cn('fr-btn fr-btn--tertiary-no-outline fr-btn--sm', {
                  'fr-icon-arrow-down-s-line': sharedWorkspacesOpen,
                  'fr-icon-arrow-right-s-line': !sharedWorkspacesOpen,
                })}
                title={
                  sharedWorkspacesOpen
                    ? 'Masquer les espaces partagés'
                    : 'Afficher les espaces partagés'
                }
                aria-label={
                  sharedWorkspacesOpen
                    ? 'Masquer les espaces partagés'
                    : 'Afficher les espaces partagés'
                }
                aria-expanded={sharedWorkspacesOpen}
                onClick={() => setSharedWorkspacesOpen(!sharedWorkspacesOpen)}
              />
            </div>
            {sharedWorkspacesOpen && <WorkspaceList workspaces={sharedWorkspaces} />}
          </div>
        )}
      </div>
    </nav>
  );
}
