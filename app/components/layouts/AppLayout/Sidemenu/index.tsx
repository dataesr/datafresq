import cn from 'classnames';
import { Activity } from 'react';
import { Link, useLocation } from 'react-router';
import { useSharedWorkspaces, useWorkspaces } from '@/api/workspaces';
import './sidemenu.css';

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
    label: 'FAQ',
    icon: 'fr-icon-questionnaire',
    path: '/faq',
  },
];

export default function Sidemenu() {
  const { pathname } = useLocation();
  const { data: workspaces } = useWorkspaces();
  const { data: sharedWorkspaces } = useSharedWorkspaces();

  const isEmpty = workspaces.length === 0;
  const isSharedEmpty = sharedWorkspaces.length === 0;

  return (
    <div className="sidemenu">
      <nav className="fr-sidemenu fr-sidemenu--sticky-full-height" aria-label="Menu">
        <div className="fr-sidemenu__inner">
          <button
            aria-expanded="false"
            aria-controls="sidemenu"
            type="button"
            className="fr-sidemenu__btn"
          >
            MENU
          </button>
          <div className="fr-collapse" id="sidemenu">
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
          <hr className="fr-py-1v fr-my-1w fr-hidden fr-unhidden-md" />
          <div className="fr-px-1w fr-hidden fr-unhidden-md">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '.5rem',
              }}
            >
              <span className="fr-text--lg fr-mb-0 fr-text--heavy">MES ESPACES</span>
              <Link
                to="/espaces/nouveau"
                className="fr-btn fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--sm"
                title="Créer un espace"
                aria-label="Créer un espace"
              />
            </div>
            <Activity mode={!isEmpty ? 'visible' : 'hidden'}>
              <ul className="sidemenu-workspaces">
                {workspaces.map((workspace) => {
                  const isActive = pathname.startsWith(`/espaces/${workspace.id}`);
                  return (
                    <li key={workspace.id} className="sidemenu-workspaces__item">
                      <Link
                        to={`/espaces/${workspace.id}`}
                        className={cn('sidemenu-workspaces__link', {
                          'sidemenu-workspaces__link--active': isActive,
                        })}
                      >
                        <span
                          className="sidemenu-workspaces__color"
                          style={{
                            backgroundColor: `var(--artwork-minor-${workspace.color})`,
                          }}
                          aria-hidden="true"
                        />
                        <span className="sidemenu-workspaces__content">
                          <span className="sidemenu-workspaces__name">{workspace.name}</span>
                          <span className="sidemenu-workspaces__meta">
                            {workspace.programs?.length || 0} formation
                            {(workspace.programs?.length || 0) > 1 ? 's' : ''}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Activity>
            <Activity mode={isEmpty ? 'visible' : 'hidden'}>
              <p className="fr-text--sm fr-text-mention--grey fr-pl-2w">Aucun espace de travail</p>
            </Activity>
          </div>
          <Activity mode={!isSharedEmpty ? 'visible' : 'hidden'}>
            <div className="fr-mt-2w fr-px-1w fr-hidden fr-unhidden-md">
              <p className="fr-text--lg fr-mb-1w fr-text--heavy">PARTAGÉS AVEC MOI</p>
              <ul className="sidemenu-workspaces">
                {sharedWorkspaces.map((workspace) => {
                  const isActive = pathname.startsWith(`/espaces/${workspace.id}`);
                  return (
                    <li key={workspace.id} className="sidemenu-workspaces__item">
                      <Link
                        to={`/espaces/${workspace.id}`}
                        className={cn('sidemenu-workspaces__link', {
                          'sidemenu-workspaces__link--active': isActive,
                        })}
                      >
                        <span
                          className="sidemenu-workspaces__color"
                          style={{
                            backgroundColor: `var(--artwork-minor-${workspace.color})`,
                          }}
                          aria-hidden="true"
                        />
                        <span className="sidemenu-workspaces__content">
                          <span className="sidemenu-workspaces__name">{workspace.name}</span>
                          <span className="sidemenu-workspaces__meta">
                            {workspace.programs?.length || 0} formation
                            {(workspace.programs?.length || 0) > 1 ? 's' : ''}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Activity>{' '}
        </div>
      </nav>
    </div>
  );
}
