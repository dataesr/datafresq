import type { EtablissementsFilterState } from '@/api/etablissements';
import { SearchInput } from '@/components/table/SearchInput';
import './styles.css';

interface FacetItem {
  key: string;
  count: number;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filters: EtablissementsFilterState;
  onFilterChange: (field: keyof EtablissementsFilterState, values: string[]) => void;
  onRemoveFilter: (field: keyof EtablissementsFilterState, value: string) => void;
  onClearAll: () => void;
  resultCount: number;
  isLoading: boolean;
  facets: {
    types: FacetItem[];
    typologies: FacetItem[];
    academies: FacetItem[];
    regions: FacetItem[];
    departements: FacetItem[];
  };
  activeFilterCount: number;
}

const FILTER_LABELS: Record<keyof EtablissementsFilterState, string> = {
  type: 'Type',
  typologie: 'Typologie',
  academie: 'Académie',
  region: 'Région',
  departement: 'Département',
};

export function FilterBar({
  searchQuery,
  onSearchQueryChange,
  filters,
  onFilterChange,
  onRemoveFilter,
  onClearAll,
  resultCount,
  isLoading,
  facets,
  activeFilterCount,
}: FilterBarProps) {
  const activeFilters = (
    Object.entries(filters) as [keyof EtablissementsFilterState, string[]][]
  ).flatMap(([field, values]) => values.map((value: string) => ({ field, value })));

  return (
    <div className="etab-filter-bar fr-mb-3w">
      {/* Search */}
      <div className="etab-filter-bar__search fr-p-2w">
        <SearchInput
          value={searchQuery}
          onChange={onSearchQueryChange}
          placeholder="Rechercher un établissement..."
          aria-label="Rechercher un établissement"
        />
      </div>

      {/* Filters */}
      <div className="etab-filter-bar__filters fr-px-2w fr-py-1w">
        <div className="etab-filter-bar__grid">
          <FilterSelect
            label="Type"
            value={filters.type}
            options={facets.types}
            onChange={(values) => onFilterChange('type', values)}
          />
          <FilterSelect
            label="Typologie"
            value={filters.typologie}
            options={facets.typologies}
            onChange={(values) => onFilterChange('typologie', values)}
          />
          <FilterSelect
            label="Académie"
            value={filters.academie}
            options={facets.academies}
            onChange={(values) => onFilterChange('academie', values)}
          />
          <FilterSelect
            label="Région"
            value={filters.region}
            options={facets.regions}
            onChange={(values) => onFilterChange('region', values)}
          />
        </div>
      </div>

      {/* Active filter tags */}
      {activeFilters.length > 0 && (
        <div className="fx-flex fx-flex-wrap fx-gap-1w fx-items-center fr-px-2w fr-py-1w">
          {activeFilters.map(({ field, value }) => (
            <button
              key={`${field}-${value}`}
              className="fr-tag fr-tag--sm fr-tag--dismiss"
              type="button"
              aria-label={`Retirer le filtre ${FILTER_LABELS[field]}: ${value}`}
              onClick={() => onRemoveFilter(field, value)}
            >
              {value}
            </button>
          ))}
          <button
            className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
            type="button"
            onClick={onClearAll}
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Footer with result count */}
      <div className="etab-filter-bar__footer fx-flex fx-justify-between fx-items-center">
        <p className="fr-text--sm fr-mb-0">
          {isLoading ? (
            <span className="fr-text-mention--grey">Chargement...</span>
          ) : (
            <>
              <strong>{resultCount.toLocaleString('fr-FR')}</strong>{' '}
              {`établissement${resultCount > 1 ? 's' : ''}`}
              {activeFilterCount > 0 && (
                <span className="fr-text-mention--grey">
                  {' '}
                  · {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif
                  {activeFilterCount > 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: FacetItem[];
  onChange: (values: string[]) => void;
}) {
  const selectedValue = value[0] ?? '';

  return (
    <div className="fr-select-group" style={{ minWidth: 0 }}>
      <label className="fr-label" htmlFor={`filter-${label}`}>
        {label}
      </label>
      <select
        id={`filter-${label}`}
        className="fr-select"
        value={selectedValue}
        onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
      >
        <option value="">Tous</option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.key} ({option.count})
          </option>
        ))}
      </select>
    </div>
  );
}
