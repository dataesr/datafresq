import { Link } from 'react-router';
import { useAuth, useSignOut } from '@/api/auth';
import { Avatar } from '@/components/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import './styles.css';

interface HeaderProps {
  showSidemenu?: boolean;
  sidemenuContent?: React.ReactNode;
  searchContent?: React.ReactNode;
}

export function Header({ showSidemenu = false, sidemenuContent, searchContent }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const signOutMutation = useSignOut();
  const handleLogout = () => signOutMutation.mutate();

  return (
    <header className="fr-header">
      <div className="fr-header__body">
        <div className="">
          <div className="fr-header__body-row">
            <div className="fr-header__brand fr-enlarge-link">
              <div className="fr-header__brand-top">
                <div className="fr-header__logo">
                  <p className="fr-logo">
                    Ministère
                    <br />
                    de l'enseignement
                    <br />
                    supérieur,
                    <br />
                    de la recherche
                    <br />
                    et de l'espace
                  </p>
                </div>
                {isAuthenticated && user && (
                  <div className="fr-header__navbar">
                    <button
                      data-fr-opened="false"
                      aria-controls="modal-nav-user"
                      title="Menu"
                      type="button"
                      id="button-menu-user"
                      className="fr-btn--menu fr-btn header--menu-user"
                    >
                      Utilisateur
                    </button>
                    {showSidemenu && (
                      <button
                        data-fr-opened="false"
                        aria-controls="modal-nav"
                        title="Menu"
                        type="button"
                        id="button-menu"
                        className="fr-btn--menu fr-btn fr-hidden-lg"
                      >
                        Menu
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="fr-header__service">
                <Link to="/" title="Accueil - Dataesr">
                  <p className="fr-header__service-title fr-text-default--grey fx-text--logo">
                    <span className="fr-text--bold">#data</span>
                    <span className="fr-text--light">ESR</span>
                    <span className="fr-text--light"> - </span>
                    <span className="fr-text--bold">data</span>
                    <span className="fr-text--light">FRESQ</span>
                  </p>
                </Link>
                <p className="fr-header__service-tagline fr-hidden fr-unhidden-md">
                  Les formations de l'enseignement supérieur reconnues de qualité
                </p>
              </div>
            </div>
            {isAuthenticated && user && (
              <div className="fr-header__tools">
                <div className="fr-header__tools-links">
                  <Dropdown
                    label={user.firstName}
                    icon="account-circle-fill"
                    size="sm"
                    title="Menu utilisateur"
                    align="end"
                  >
                    <Dropdown.Header>
                      <div className="fr-py-1v fr-pr-5w fx-flex fx-items-center fx-gap-2w">
                        <Avatar name={user.firstName} />
                        <div className="fx-items-start">
                          <p className="fr-text--bold fr-mb-0">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.email && (
                            <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </Dropdown.Header>
                    <Dropdown.Link className="fr-py-3v" icon="stack-line" to="/espaces">
                      Mes espaces
                    </Dropdown.Link>
                    <Dropdown.Link
                      className="fr-py-3v"
                      icon="settings-5-line"
                      to="/utilisateur/profil"
                    >
                      Gérer mon compte
                    </Dropdown.Link>
                    {user.role === 'admin' && (
                      <Dropdown.Link
                        className="fr-py-3v"
                        icon="terminal-line"
                        to="/admin/utilisateurs"
                      >
                        Administration du site
                      </Dropdown.Link>
                    )}
                    <Dropdown.Footer align="center">
                      <button
                        type="button"
                        className="fr-mx-2w fr-my-1w fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-left fr-icon-logout-box-r-line fx-justify-center fx-width-100"
                        onClick={handleLogout}
                      >
                        Se déconnecter
                      </button>
                    </Dropdown.Footer>
                  </Dropdown>
                </div>
                {searchContent && (
                  <div className="fr-header__search fr-hidden fr-unhidden-lg">
                    {searchContent}
                  </div>
                )}
              </div>
            )}
            {showSidemenu && sidemenuContent && (
              <div className="fr-header__menu fr-modal fr-hidden-lg" id="modal-nav">
                <div className="fr-container">
                  <button
                    aria-controls="modal-nav"
                    title="Fermer"
                    type="button"
                    id="button-close-modal-nav"
                    className="fr-btn--close fr-btn"
                  >
                    Fermer
                  </button>
                  {sidemenuContent}
                </div>
              </div>
            )}
            <div className="fr-header__menu fr-modal" id="modal-nav-user">
              <div className="fr-container">
                <button
                  aria-controls="modal-nav-user"
                  title="Fermer"
                  type="button"
                  id="button-close-modal-nav-user"
                  className="fr-btn--close fr-btn"
                >
                  Fermer
                </button>
                {user && (
                  <div className="fr-header__menu-links">
                    <div className="fr-px-2w fr-pb-2w fx-flex fx-items-center fx-gap-2w">
                      <Avatar name={user.firstName} />
                      <div>
                        <p className="fr-text--bold fr-mb-0">{user.firstName}</p>
                        {user.email && (
                          <p className="fr-text--xs fr-text-mention--grey fr-mb-0">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <ul className="fr-nav">
                      <li className="fr-nav__item">
                        <Link
                          className="fr-nav__link fr-icon-stack-line fr-link--icon-right"
                          to="/espaces"
                        >
                          Mes espaces
                        </Link>
                      </li>
                      <li className="fr-nav__item">
                        <Link
                          className="fr-nav__link fr-icon-settings-5-line fr-link--icon-right"
                          to="/utilisateur/profil"
                        >
                          Gérer mon compte
                        </Link>
                      </li>
                      {user.role === 'admin' && (
                        <li className="fr-nav__item">
                          <Link
                            className="fr-nav__link fr-icon-terminal-line fr-link--icon-right"
                            to="/admin/utilisateurs"
                          >
                            Administration du site
                          </Link>
                        </li>
                      )}
                    </ul>
                    <div className="fr-px-2w fr-pt-2w">
                      <div className="fr-btns-group fr-btns-group--icon-left">
                        <button
                          title="Se déconnecter"
                          type="button"
                          className="fr-btn fr-btn--tertiary fr-icon-logout-box-r-line"
                          onClick={handleLogout}
                        >
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
