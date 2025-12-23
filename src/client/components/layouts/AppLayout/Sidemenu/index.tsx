import cn from 'classnames';
import { Link, useLocation } from 'react-router';
import { useWorkspaces } from '@/api/workspaces';
import CreateWorkspaceForm from '@/components/forms/CreateWorkspaceForm';
import './sidemenu.css';
import { Activity } from 'react';

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

  const isEmpty = workspaces.length === 0;

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
              <CreateWorkspaceForm />
            </div>
            <Activity mode={!isEmpty ? 'visible' : 'hidden'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workspaces.map((workspace) => (
                  <Link
                    to={`/espaces/${workspace.id}`}
                    key={workspace.id}
                    className={cn('fr-nav__link fr-nav__link--sidebar fr-text--heavy', {
                      'xfr-btn-text-default': !pathname.startsWith(`/espaces/${workspace.id}`),
                    })}
                  >
                    <div>
                      <span className="clamp-1">
                        {workspace.name}
                        <br />
                      </span>
                      <span className="fr-text--regular fr-text--xs fr-text-mention--grey">
                        par {workspace.ownerInfo?.firstName || ''}{' '}
                        {workspace.ownerInfo?.lastName || ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Activity>
            <Activity mode={isEmpty ? 'visible' : 'hidden'}>
              <p className="fr-text--sm fr-text-mention--grey fr-pl-2w">Aucun espace de travail</p>
            </Activity>
          </div>
        </div>
      </nav>
    </div>
  );
}
