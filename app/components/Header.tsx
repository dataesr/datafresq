import { Link } from 'react-router';
import { useAuth, useSignOut } from '@/api/auth';
import { Avatar } from './Avatar';
import { Dropdown } from './ui/Dropdown';

export default function Header() {
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
                {isAuthenticated && (
                  <div className="fr-header__navbar">
                    <button
                      data-fr-opened="false"
                      aria-controls="modal-nav-user"
                      title="Menu"
                      type="button"
                      id="button-menu-user"
                      className="fr-btn--menu fr-btn"
                    >
                      Menu
                    </button>
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
              </div>
            )}
            {/* Mobile menu modal */}
            <div className="fr-header__menu fr-modal" id="modal-nav-user">
              {user && (
                <div className="fr-header__menu-links">
                  <div className="fr-p-2w fr-pr-6w fx-flex fx-items-center fx-gap-2w">
                    <Avatar name={user.firstName} />
                    <div>
                      <p className="fr-text--bold fr-mb-0">{user.firstName}</p>
                      {user.email && (
                        <p className="fr-text--xs fr-text-mention--grey fr-mb-0">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <ul>
                    <li>
                      <Link
                        className="fr-nav__link fr-nav__link--user fr-icon-stack-line fr-link--icon-left"
                        to="/espaces"
                      >
                        Mes espaces
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="fr-nav__link fr-nav__link--user fr-icon-settings-5-line fr-link--icon-left"
                        to="/utilisateur/profil"
                      >
                        Gérer mon compte
                      </Link>
                    </li>
                    {user.role === 'admin' && (
                      <li>
                        <Link
                          className="fr-nav__link fr-nav__link--user fr-icon-terminal-line fr-link--icon-left"
                          to="/admin/utilisateurs"
                        >
                          Administration du site
                        </Link>
                      </li>
                    )}
                  </ul>
                  <div className="fr-px-4w fr-py-2w">
                    <div className="fr-btns-group fr-btns-group--sm fr-btns-group--icon-left">
                      <button
                        title="Se déconnecter"
                        type="button"
                        className="fr-btn fr-btn--tertiary fr-icon-logout-box-r-line fx-justify-center fx-width-100"
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
    </header>
  );
}
