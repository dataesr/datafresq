import { Link } from 'react-router';
import { useSignOut } from '@/api/auth';
import { useCurrentUser } from '@/api/users';
import { Avatar } from './Avatar';

export default function Header() {
  const { user } = useCurrentUser();
  const isAuthenticated = !!user;
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
                  <p className="fr-header__service-title fr-text-default--grey">
                    <span style={{ letterSpacing: '0.1rem' }} className="fr-text--bold">
                      #data
                    </span>
                    <span style={{ letterSpacing: '0.1rem' }} className="fr-text--light">
                      ESR
                    </span>
                    <span className="fr-text--light"> - </span>
                    <span className="fr-text--bold">Fresq visualisation</span>
                  </p>
                </Link>
                <p className="fr-header__service-tagline fr-hidden fr-unhidden-md">
                  Les formations agréées de l'enseignement supérieur
                </p>
              </div>
            </div>
            {isAuthenticated && user && (
              <div className="fr-header__tools">
                <div className="fr-header__tools-links">
                  <div className="fr-translate fr-nav">
                    <div className="fr-nav__item">
                      <button
                        aria-controls="user-menu"
                        aria-expanded="false"
                        title="Menu utilisateur"
                        type="button"
                        className="fr-translate__btn fr-btn fr-btn--tertiary fr-translate__btn--user"
                      >
                        {user?.firstName}
                      </button>
                      <div className="fr-collapse fr-menu" id="user-menu">
                        <div className="fr-menu__list" style={{ textAlign: 'start' }}>
                          <div
                            className="fr-p-2w fr-pr-6w"
                            style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}
                          >
                            <Avatar name={user.firstName} />
                            <div>
                              <p className="fr-text--bold fr-mb-0">{user.firstName}</p>
                              {user.email && (
                                <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                                  {user.email}
                                </p>
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
                                style={{ width: '100%' }}
                                title="Se deconnecter"
                                type="button"
                                className="fr-btn fr-btn--tertiary fr-icon-logout-box-r-line"
                                onClick={handleLogout}
                              >
                                Se deconnecter
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="fr-header__menu fr-modal" id="modal-nav-user">
              {user && (
                <div className="fr-header__menu-links">
                  <div
                    className="fr-p-2w fr-pr-6w"
                    style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}
                  >
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
                        to="/"
                      >
                        Mes applications
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
                    <li>
                      <Link
                        className="fr-nav__link fr-nav__link--user fr-icon-terminal-line fr-link--icon-left"
                        to="/admin/utilisateurs"
                      >
                        Administration du site
                      </Link>
                    </li>
                  </ul>
                  <div className="fr-px-4w fr-py-2w">
                    <div className="fr-btns-group fr-btns-group--sm fr-btns-group--icon-left">
                      <button
                        style={{ width: '100%' }}
                        title="Se deconecter"
                        type="button"
                        className="fr-btn fr-btn--tertiary fr-icon-logout-box-r-line"
                        onClick={handleLogout}
                      >
                        Se deconnecter
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
