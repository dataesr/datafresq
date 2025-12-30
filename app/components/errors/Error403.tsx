import { Link } from 'react-router';

export default function Error403() {
  return (
    <div className="fr-container">
      <div className="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
        <div className="fr-py-0 fr-col-12 fr-col-md-6">
          <h1>Accès refusé</h1>
          <p className="fr-text--sm fr-mb-3w">Erreur 403</p>
          <p className="fr-text--lead fr-mb-3w">
            Vous n'avez pas les droits nécessaires pour accéder à cette page.
          </p>
          <p className="fr-text--sm fr-mb-5w">
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur du site.
            <br />
            Sinon, vous pouvez retourner à la page d'accueil.
          </p>
          <ul className="fr-btns-group fr-btns-group--inline-md">
            <li>
              <Link className="fr-btn" to="/">
                Page d'accueil
              </Link>
            </li>
          </ul>
        </div>
        <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1 fr-px-6w fr-px-md-0 fr-py-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="fr-responsive-img fr-artwork"
            aria-hidden="true"
            width="160"
            height="200"
            viewBox="0 0 160 200"
          >
            <use
              className="fr-artwork-motif"
              href="/public/artwork/background/ovoid.svg#artwork-motif"
            />
            <use
              className="fr-artwork-background"
              href="/public/artwork/background/ovoid.svg#artwork-background"
            />
            <g transform="translate(40, 60)">
              <use
                className="fr-artwork-decorative"
                href="/public/artwork/pictograms/system/padlock.svg#artwork-decorative"
              />
              <use
                className="fr-artwork-minor"
                href="/public/artwork/pictograms/system/padlock.svg#artwork-minor"
              />
              <use
                className="fr-artwork-major"
                href="/public/artwork/pictograms/system/padlock.svg#artwork-major"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
