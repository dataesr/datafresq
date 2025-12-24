const siesLogo = '/public/sies_logo_signature.svg';

export default function Footer() {
  return (
    <footer className="fr-footer" id="footer-7361">
      <div className="">
        <div className="fr-footer__body">
          <div className="fr-footer__brand fr-enlarge-link">
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

            <a title="Retour à l'accueil du site" href="/" className="fr-footer__brand-link">
              <svg role="img" aria-label="Logo SIES" viewBox="0 0 1167.77 752.85" width="100%">
                <use className="fr-text-black-white--grey" href={`${siesLogo}#sies-logo-text`} />
                <use href={`${siesLogo}#sies-logo-artwork`} />
              </svg>
            </a>
          </div>
          <div className="fr-footer__content">
            <p className="fr-footer__content-desc">
              Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore
              magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et. Ut aliqu
            </p>
            <ul className="fr-footer__content-list">
              <li className="fr-footer__content-item">
                <a
                  className="fr-footer__content-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="info.gouv.fr - nouvelle fenêtre"
                  href="https://info.gouv.fr"
                >
                  info.gouv.fr
                </a>
              </li>
              <li className="fr-footer__content-item">
                <a
                  className="fr-footer__content-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="service-public.fr - nouvelle fenêtre"
                  href="https://service-public.fr"
                >
                  service-public.fr
                </a>
              </li>
              <li className="fr-footer__content-item">
                <a
                  className="fr-footer__content-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="legifrance.gouv.fr - nouvelle fenêtre"
                  href="https://legifrance.gouv.fr"
                >
                  legifrance.gouv.fr
                </a>
              </li>
              <li className="fr-footer__content-item">
                <a
                  className="fr-footer__content-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="data.gouv.fr - nouvelle fenêtre"
                  href="https://data.gouv.fr"
                >
                  data.gouv.fr
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="fr-footer__bottom">
          <ul className="fr-footer__bottom-list">
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="/">
                Plan du site
              </a>
            </li>
            <li className="fr-footer__bottom-item">
              <a className="fr-footer__bottom-link" href="/">
                Accessibilité : non/partiellement/totalement conforme
              </a>
            </li>
          </ul>
          <div className="fr-footer__bottom-copy">
            <p>
              Sauf mention explicite de propriété intellectuelle détenue par des tiers, les contenus
              de ce site sont proposés sous{' '}
              <a
                href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
                target="_blank"
                rel="noopener noreferrer"
                title="Licence etalab - nouvelle fenêtre"
              >
                licence etalab-2.0
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
