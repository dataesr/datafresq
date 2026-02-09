import { AutoGrid } from '@/components/Grids/AutoGrid';

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

export default function Features() {
  return (
    <section className="fx-fullwidth-bg home-section home-section--alt">
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
