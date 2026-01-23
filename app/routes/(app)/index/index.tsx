import { Link } from 'react-router';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import { useHomeStats } from './useHomeStats';
import './styles.css';

const homeIllustration = '/public/home/illustration.svg';
const ovoid = '/public/home/ovoid.svg';

// =============================================================================
// STATS COMPONENT
// =============================================================================

const stats = [
  { icon: 'fr-icon-book-2-line', key: 'totalPrograms', label: 'Formations référencées' },
  { icon: 'fr-icon-bar-chart-box-line', key: 'programsWithSiseInfos', label: 'Avec données SISE' },
  { icon: 'fr-icon-award-line', key: 'totalDiplomaTypes', label: 'Types de diplômes' },
] as const;

function StatsSection() {
  const { totalPrograms, programsWithSiseInfos, totalDiplomaTypes, isLoading } = useHomeStats();

  const values = { totalPrograms, programsWithSiseInfos, totalDiplomaTypes };

  return (
    <section className="home-section home-section--default">
      <div className="home__inner fr-py-8w">
        <h2 className="fr-h5 fr-mb-1v">La base de données en chiffres</h2>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
          Des données complètes sur l'enseignement supérieur français
        </p>

        {isLoading ? (
          <p className="fr-text-mention--grey">Chargement des statistiques...</p>
        ) : (
          <AutoGrid min={200} gap="sm">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="fx-card fx-card--sm fx-card--lift"
                style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}
              >
                <div className={`icon-box ${stat.icon}`} aria-hidden="true" />
                <div>
                  <p
                    className="fr-text--bold fr-mb-0"
                    style={{ fontSize: '1.5rem', lineHeight: 1.2 }}
                  >
                    {values[stat.key].toLocaleString('fr-FR')}
                  </p>
                  <p className="fr-text--sm fr-text-mention--grey fr-mb-0">{stat.label}</p>
                </div>
              </div>
            ))}
          </AutoGrid>
        )}
      </div>
    </section>
  );
}

// =============================================================================
// FEATURES COMPONENT
// =============================================================================

const features = [
  {
    icon: 'fr-icon-search-line',
    title: 'Recherche avancée',
    description:
      'Explorez les formations avec des filtres puissants : établissements, type de diplôme, académie, et bien plus.',
  },
  {
    icon: 'fr-icon-folder-2-line',
    title: 'Espaces de travail',
    description:
      'Créez des espaces personnalisés pour organiser et sauvegarder vos recherches de formations.',
  },
  {
    icon: 'fr-icon-download-line',
    title: 'Export des données',
    description: 'Téléchargez les données en format Excel ou JSON pour vos analyses et rapports.',
  },
  {
    icon: 'fr-icon-pie-chart-2-line',
    title: 'Visualisations',
    description:
      'Accédez à des graphiques et cartes interactifs pour mieux comprendre les données.',
  },
  {
    icon: 'fr-icon-team-line',
    title: 'Collaboration',
    description: 'Partagez vos espaces de travail avec vos collègues pour travailler ensemble.',
  },
  {
    icon: 'fr-icon-refresh-line',
    title: 'Données actualisées',
    description: 'Bénéficiez de données régulièrement mises à jour par le Ministère.',
  },
];

function FeaturesSection() {
  return (
    <section className="home-section home-section--alt">
      <div className="home__inner fr-py-8w">
        <h2 className="fr-h5 fr-mb-1v">Fonctionnalités</h2>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
          Tout ce dont vous avez besoin pour explorer les formations
        </p>

        <AutoGrid min={400} gap="sm">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="fx-card fx-card--sm fx-card--lift fx-card--bg-default"
            >
              <div className={`icon-box ${feature.icon} fr-mb-2v`} aria-hidden="true" />
              <h3 className="fr-text--md fr-text--bold fr-mb-1v">{feature.title}</h3>
              <p className="fr-text--sm fr-text-mention--grey fr-mb-0">{feature.description}</p>
            </div>
          ))}
        </AutoGrid>
      </div>
    </section>
  );
}

// =============================================================================
// HERO COMPONENT
// =============================================================================

function HeroSection() {
  return (
    <section className="home-hero">
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

// =============================================================================
// HOME PAGE
// =============================================================================

export default function Home() {
  return (
    <div className="home">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
    </div>
  );
}
