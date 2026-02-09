import { Link } from 'react-router';

const homeIllustration = '/public/home/illustration.svg';
const ovoid = '/public/home/ovoid.svg';

export default function Hero() {
  return (
    <section className="fx-fullwidth-bg home-hero">
      <div className="home__inner">
        <div className="home-hero__content">
          <div className="home-hero__text">
            <p className="fr-text--bold fr-text-label--blue-france fr-mb-1w">DATA FRESQ</p>
            <hr className="home-hero__separator" />
            <h1 className="home-hero__title">
              Explorez les données des formations de l'enseignement supérieur
            </h1>
            <p className="fr-text-mention--grey fr-mb-3w">
              <em>Data Fresq</em> est un outil de visualisation des données des formations de
              l'enseignement supérieur. Consultez des indicateurs sur les formations, les mentions,
              les établissements et les régions.
            </p>
            <div className="home-hero__cta">
              <Link to="/formations" className="fr-btn fr-btn--icon-right fr-icon-arrow-right-line">
                Explorer les formations
              </Link>
              <Link to="/faq" className="fr-btn fr-btn--secondary">
                En savoir plus
              </Link>
            </div>
          </div>

          <div className="home-hero__illustration">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="fr-artwork home-hero__ovoid"
              aria-hidden="true"
              viewBox="0 0 160 200"
            >
              <use className="fr-artwork-motif" href={`${ovoid}#artwork-motif`} />
              <use className="fr-artwork-motif" href={`${ovoid}#artwork-background`} />
            </svg>
            <img src={homeIllustration} alt="" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
