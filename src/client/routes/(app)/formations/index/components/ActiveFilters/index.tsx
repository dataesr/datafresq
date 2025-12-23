import { Button } from '@/components/Button';
import { useProgramsFilters } from '../../hooks/useProgramsFilters';

// Human-readable labels for filter categories
const FILTER_LABELS: Record<string, string> = {
  cycle: 'Cycle',
  diplomaType: 'Type de diplôme',
  diplomaCategory: 'Catégorie',
  academy: 'Académie',
  region: 'Région',
  sector: 'Secteur',
  disciplinarySector: 'Secteur disciplinaire',
  domain: 'Domaine',
  hasSiseInfos: 'Données SISE',
  hasRncpInfos: 'Données RNCP',
  hasRomeInfos: 'Données ROME',
};

// Human-readable labels for boolean values
const BOOLEAN_LABELS: Record<string, string> = {
  true: 'Oui',
  false: 'Non',
};

interface FilterPill {
  key: string;
  value: string;
  label: string;
}

export default function ActiveFilters() {
  const { currentFilters, handleRemoveFilter, handleClearAllFilters } = useProgramsFilters();

  const pills: FilterPill[] = [];

  const arrayFilterKeys = [
    'cycle',
    'diplomaType',
    'diplomaCategory',
    'academy',
    'region',
    'sector',
    'disciplinarySector',
    'domain',
  ] as const;

  for (const key of arrayFilterKeys) {
    const values = currentFilters[key] as string[];
    for (const value of values) {
      pills.push({
        key,
        value,
        label: `${FILTER_LABELS[key]}: ${value}`,
      });
    }
  }

  const booleanFilterKeys = ['hasSiseInfos', 'hasRncpInfos', 'hasRomeInfos'] as const;

  for (const key of booleanFilterKeys) {
    const value = currentFilters[key] as string | null;
    if (value !== null) {
      pills.push({
        key,
        value,
        label: `${FILTER_LABELS[key]}: ${BOOLEAN_LABELS[value] || value}`,
      });
    }
  }

  if (pills.length === 0) {
    return null;
  }

  return (
    <div
      className="fr-mt-2w"
      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}
    >
      <span className="fr-text--sm fr-text--bold fr-mr-1w">Filtres actifs :</span>

      {pills.map((pill, index) => (
        <button
          key={`${pill.key}-${pill.value}-${index}`}
          type="button"
          className="fr-tag fr-tag--sm"
          onClick={() =>
            handleRemoveFilter(
              pill.key as
                | 'cycle'
                | 'diplomaType'
                | 'diplomaCategory'
                | 'academy'
                | 'region'
                | 'sector'
                | 'disciplinarySector'
                | 'domain'
                | 'hasSiseInfos'
                | 'hasRncpInfos'
                | 'hasRomeInfos',
              pill.value,
            )
          }
          aria-label={`Retirer le filtre ${pill.label}`}
        >
          {pill.label}
          <span className="fr-icon-close-line fr-icon--sm fr-icon--inline fr-icon--right"></span>
        </button>
      ))}

      {pills.length > 1 && (
        <Button variant="text" size="sm" onClick={handleClearAllFilters} className="fr-ml-1w">
          Tout effacer
        </Button>
      )}
    </div>
  );
}
