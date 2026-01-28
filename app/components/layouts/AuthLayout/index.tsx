import cn from 'classnames';
import { Outlet } from 'react-router';
import './styles.css';

const dataesrLogo = '/public/dataesr.svg';
const siesLogo = '/public/sies_logo_signature.svg';

export default function AuthLayout() {
  return (
    <div className={cn('auth-layout-wrapper', 'fr-background-contrast--grey')}>
      <div className={cn('auth-layout-logo-container')}>
        <img src={dataesrLogo} alt="Logo" />
      </div>
      <div className="fx-flex fx-flex-col fx-items-center fx-justify-center">
        <div className={cn('auth-layout-card-wrapper', 'fr-card', 'fr-card--shadow', 'fr-py-2w')}>
          <Outlet />
        </div>
        <div className={cn('auth-layout-footer-logos', 'fr-mt-2w')}>
          <div className="fr-container-fluid">
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
          </div>
          <div className={cn('auth-layout-sies-logo')}>
            <img src={siesLogo} alt="Logo" />
          </div>
        </div>
        <ul className={cn('auth-layout-footer-links', 'fr-p-3w', 'fr-m-0')}>
          <li>
            <a className="fr-footer__bottom-link" href="/">
              Mentions légales
            </a>
          </li>
          <li>
            <a className="fr-footer__bottom-link" href="/">
              Données personnelles
            </a>
          </li>
          <li>
            <a className="fr-footer__bottom-link" href="/">
              Gestion des cookies
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
