import { useProgramsFacets } from '@/api/programs';
import { AutoGrid } from '@/components/Grids/AutoGrid';

interface HomeStats {
  totalPrograms: number;
  programsWithSiseInfos: number;
  totalDiplomaTypes: number;
  isLoading: boolean;
  error: Error | null;
}

function useHomeStats(): HomeStats {
  const { totalCount, siseInfosCounts, diplomaTypes, isLoading, error } = useProgramsFacets();

  return {
    totalPrograms: totalCount,
    programsWithSiseInfos: siseInfosCounts.true,
    totalDiplomaTypes: diplomaTypes.length,
    isLoading,
    error: error as Error | null,
  };
}

const stats = [
  { icon: 'fr-icon-book-2-line', key: 'totalPrograms', label: 'Formations référencées' },
  { icon: 'fr-icon-bar-chart-box-line', key: 'programsWithSiseInfos', label: 'Avec données SISE' },
  { icon: 'fr-icon-award-line', key: 'totalDiplomaTypes', label: 'Types de diplômes' },
] as const;

export default function Stats() {
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
                className="fx-card fx-card--sm fx-card--lift fx-flex fx-items-start fx-gap-4w"
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
