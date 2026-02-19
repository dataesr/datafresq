import { Link } from 'react-router';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import { getSections } from './guide-content.generated';

const sections = getSections();

export default function GuideIndex() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: "Guide d'utilisation", current: true },
        ]}
      />

      <h1>Guide d'utilisation</h1>
      <p className="fr-mb-6w">
        Bienvenue dans le guide d'utilisation de DataFresq. Cette documentation vous accompagne dans
        la prise en main de la plateforme, de la recherche de formations à la création d'espaces de
        travail.
      </p>

      <h2 className="fr-h4">Rubriques</h2>

      <AutoGrid min={400} gap="lg" className="fr-mb-12w">
        {sections.map((section) => (
          <div
            key={section.href}
            className="fx-card fx-card--shadow fx-card--sm fx-card--lift fr-enlarge-link"
          >
            <div className="fx-flex fx-gap-4w">
              <div>
                {section.icon && <div className={`icon-box ${section.icon}`} aria-hidden="true" />}
              </div>
              <div>
                <h3 className="fr-text--md fr-text--bold fr-mb-1v">
                  <Link to={section.href} className="fr-raw-link">
                    {section.title}
                  </Link>
                </h3>
                <p className="fr-text--sm fr-text-mention--grey fr-mb-0">{section.description}</p>
              </div>
            </div>
          </div>
        ))}
      </AutoGrid>
    </div>
  );
}
