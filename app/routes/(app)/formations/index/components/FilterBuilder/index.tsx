import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { type Institution, useInstitutionsSearch } from '@/api/institutions';
import { type FilterState, useProgramsFacets } from '@/api/programs';
import { Select } from '@/components/ui/Select';
import './styles.css';

// =============================================================================
// TYPES
// =============================================================================

type FilterType = 'multiselect' | 'async-search' | 'boolean';
type FilterGroup = 'typeDiplome' | 'etablissement' | 'domaine' | 'donneesDispo';

interface FilterConfig {
  key: keyof FilterState;
  label: string;
  type: FilterType;
  placeholder?: string;
  facetKey?: string;
  group?: FilterGroup;
}

interface FilterRowData {
  id: string;
  filterKey: keyof FilterState;
  values: string[];
}

interface FilterBuilderProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  resultCount?: number;
  isLoading?: boolean;
}

// =============================================================================
// FILTER CONFIGURATION
// =============================================================================

const FILTER_CONFIGS: FilterConfig[] = [
  { key: 'cycle', label: 'Cycle', type: 'multiselect', facetKey: 'cycles', group: 'typeDiplome' },
  {
    key: 'diplomaType',
    label: 'Type de diplôme',
    type: 'multiselect',
    facetKey: 'diplomaTypes',
    group: 'typeDiplome',
  },
  {
    key: 'diplomaCategory',
    label: 'Catégorie',
    type: 'multiselect',
    facetKey: 'diplomaCategories',
    group: 'typeDiplome',
  },
  {
    key: 'region',
    label: 'Région',
    type: 'multiselect',
    facetKey: 'regions',
    group: 'etablissement',
  },
  {
    key: 'academy',
    label: 'Académie',
    type: 'multiselect',
    facetKey: 'academies',
    group: 'etablissement',
  },
  {
    key: 'paysageId',
    label: 'Établissement',
    type: 'async-search',
    placeholder: 'Rechercher...',
    group: 'etablissement',
  },
  {
    key: 'sector',
    label: 'Secteur',
    type: 'multiselect',
    facetKey: 'sectors',
    group: 'etablissement',
  },
  {
    key: 'disciplinarySector',
    label: 'Secteur disciplinaire',
    type: 'multiselect',
    facetKey: 'disciplinarySectors',
    group: 'domaine',
  },
  { key: 'domain', label: 'Domaine', type: 'multiselect', facetKey: 'domains', group: 'domaine' },
  { key: 'hasSiseInfos', label: 'Données SISE', type: 'boolean', group: 'donneesDispo' },
  { key: 'hasRncpInfos', label: 'Données RNCP', type: 'boolean', group: 'donneesDispo' },
  { key: 'hasRomeInfos', label: 'Données ROME', type: 'boolean', group: 'donneesDispo' },
];

// =============================================================================
// SELECTION BADGES
// =============================================================================

interface SelectionBadgesProps {
  items: { key: string; label: string }[];
  onRemove: (key: string) => void;
  maxVisible?: number;
}

function SelectionBadges({ items, onRemove, maxVisible = 5 }: SelectionBadgesProps) {
  if (items.length === 0) return null;

  const visible = items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  return (
    <div
      style={{ display: 'inline-flex' }}
      className="fr-tags-group fr-hidden fr-unhidden-sm fr-mt-1w"
    >
      {visible.map((item) => (
        <p key={item.key} className="fr-tag fr-tag--sm fr-tag--blue-france">
          {item.label.length > 25 ? `${item.label.substring(0, 25)}...` : item.label}
          <button
            type="button"
            title={`Retirer ${item.label}`}
            aria-label={`Retirer ${item.label}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.key);
            }}
            className="fx-flex fx-items-center fx-justify-center"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.125rem',
              borderRadius: '50%',
              color: 'inherit',
            }}
          >
            <span className="fr-icon-close-line fr-icon--sm" aria-hidden="true" />
          </button>
        </p>
      ))}
      {remaining > 0 && <span className="fr-tag fr-tag--sm">+{remaining}</span>}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface MultiselectValuePickerProps {
  options: { key: string; count: number }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

function MultiselectValuePicker({
  options,
  selectedValues,
  onChange,
  placeholder = 'Sélectionner...',
}: MultiselectValuePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) => opt.key.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  const sortedOptions = useMemo(() => {
    return [...filteredOptions].sort((a, b) => {
      const aSelected = selectedValues.includes(a.key);
      const bSelected = selectedValues.includes(b.key);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return b.count - a.count;
    });
  }, [filteredOptions, selectedValues]);

  const handleToggle = useCallback(
    (key: string, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, key]);
      } else {
        onChange(selectedValues.filter((v) => v !== key));
      }
    },
    [selectedValues, onChange],
  );

  const handleRemoveBadge = useCallback(
    (key: string) => {
      onChange(selectedValues.filter((v) => v !== key));
    },
    [selectedValues, onChange],
  );

  const getDisplayLabel = (): string => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return '1 sélectionné';
    return `${selectedValues.length} sélectionnés`;
  };

  const badgeItems = selectedValues.map((v) => ({
    key: v,
    label: options.find((o) => o.key === v)?.key ?? v,
  }));

  return (
    <div>
      <Select label={getDisplayLabel()} outline multiple>
        {options.length > 8 && (
          <Select.Search
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
        {sortedOptions.length === 0 ? (
          <Select.Empty>Aucune option</Select.Empty>
        ) : (
          <Select.Content>
            {sortedOptions.map((option) => (
              <Select.Checkbox
                key={option.key}
                value={option.key}
                checked={selectedValues.includes(option.key)}
                onChange={(checked) => handleToggle(option.key, checked)}
                count={option.count}
              >
                {option.key}
              </Select.Checkbox>
            ))}
          </Select.Content>
        )}
      </Select>
      <SelectionBadges items={badgeItems} onRemove={handleRemoveBadge} />
    </div>
  );
}

interface AsyncSearchValuePickerProps {
  selectedValues: string[];
  selectedItems: Institution[];
  onChange: (values: string[], items: Institution[]) => void;
  placeholder?: string;
}

function AsyncSearchValuePicker({
  selectedValues,
  selectedItems,
  onChange,
  placeholder = 'Rechercher...',
}: AsyncSearchValuePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { institutions, isLoading } = useInstitutionsSearch({
    query: searchQuery,
    pageSize: 20,
  });

  const handleToggle = useCallback(
    (inst: Institution, checked: boolean) => {
      if (checked) {
        onChange([...selectedValues, inst.id], [...selectedItems, inst]);
      } else {
        onChange(
          selectedValues.filter((v) => v !== inst.id),
          selectedItems.filter((i) => i.id !== inst.id),
        );
      }
    },
    [selectedValues, selectedItems, onChange],
  );

  const handleRemoveBadge = useCallback(
    (id: string) => {
      onChange(
        selectedValues.filter((v) => v !== id),
        selectedItems.filter((i) => i.id !== id),
      );
    },
    [selectedValues, selectedItems, onChange],
  );

  const displayOptions = useMemo(() => {
    const result = [...selectedItems];
    for (const inst of institutions) {
      if (!result.find((i) => i.id === inst.id)) {
        result.push(inst);
      }
    }
    return result.sort((a, b) => {
      const aSelected = selectedValues.includes(a.id);
      const bSelected = selectedValues.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [institutions, selectedItems, selectedValues]);

  const getDisplayLabel = (): string => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return '1 sélectionné';
    return `${selectedValues.length} sélectionnés`;
  };

  const showInitialMessage = searchQuery.length === 0 && selectedItems.length === 0;
  const showMinLengthMessage = searchQuery.length > 0 && searchQuery.length < 2;

  const badgeItems = selectedItems.map((item) => ({
    key: item.id,
    label: item.label,
  }));

  return (
    <div>
      <Select label={getDisplayLabel()} outline multiple>
        <Select.Search
          placeholder="Saisissez au moins 2 caractères..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {isLoading && <Select.Loading>Chargement...</Select.Loading>}

        {!isLoading && showInitialMessage && (
          <Select.Empty>Saisissez au moins 2 caractères</Select.Empty>
        )}

        {!isLoading && showMinLengthMessage && (
          <Select.Empty>Saisissez au moins 2 caractères</Select.Empty>
        )}
        <Select.Content>
          {!isLoading &&
            displayOptions.length > 0 &&
            displayOptions.map((inst) => {
              const subLabel = [inst.nature, inst.city].filter(Boolean).join(' - ');
              return (
                <Select.Checkbox
                  key={inst.id}
                  value={inst.id}
                  checked={selectedValues.includes(inst.id)}
                  onChange={(checked) => handleToggle(inst, checked)}
                >
                  <div className="fx-flex fx-flex-col" style={{ flex: 1, minWidth: 0 }}>
                    <span className="fx-clamp-1" title={inst.label}>
                      {inst.label}
                    </span>
                    {subLabel && (
                      <span className="fr-text--xs fr-text-mention--grey fr-mb-0 fx-clamp-1">
                        {subLabel}
                      </span>
                    )}
                  </div>
                </Select.Checkbox>
              );
            })}
        </Select.Content>
      </Select>
      <SelectionBadges items={badgeItems} onRemove={handleRemoveBadge} />
    </div>
  );
}

interface BooleanValuePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  counts?: { true: number; false: number };
}

function BooleanValuePicker({ value, onChange, counts }: BooleanValuePickerProps) {
  const options = [
    { key: 'true', label: 'Oui', count: counts?.true ?? 0 },
    { key: 'false', label: 'Non', count: counts?.false ?? 0 },
  ];

  const displayLabel = value === 'true' ? 'Oui' : value === 'false' ? 'Non' : 'Sélectionner...';

  return (
    <Select label={displayLabel} outline>
      <Select.Content>
        {options.map((option) => (
          <Select.Radio
            key={option.key}
            value={option.key}
            name="boolean-filter"
            checked={value === option.key}
            onChange={() => onChange(value === option.key ? null : option.key)}
          >
            <span style={{ flex: 1 }}>{option.label}</span>
            <span className="fr-badge fr-badge--sm fr-badge--no-icon">
              {option.count.toLocaleString('fr-FR')}
            </span>
          </Select.Radio>
        ))}
      </Select.Content>
    </Select>
  );
}

// =============================================================================
// FILTER ROW COMPONENT
// =============================================================================

interface FilterRowProps {
  row: FilterRowData;
  config: FilterConfig;
  facets: Record<string, { key: string; count: number }[]>;
  booleanCounts: Record<string, { true: number; false: number }>;
  selectedInstitutions: Institution[];
  onValuesChange: (values: string[], institutions?: Institution[]) => void;
  onRemove: () => void;
}

function FilterRow({
  row,
  config,
  facets,
  booleanCounts,
  selectedInstitutions,
  onValuesChange,
  onRemove,
}: FilterRowProps) {
  const options = config.facetKey ? (facets[config.facetKey] ?? []) : [];
  const operator = config.type === 'boolean' ? 'est' : 'contient';

  return (
    <div className="filter-builder__row fx-flex fx-items-baseline fx-gap-4w fr-px-3v fr-py-1w fr-mb-1w">
      <span className="fr-text fr-text--bold fx-flex-shrink-0 fr-mb-0" style={{ width: '10rem' }}>
        {config.label}
      </span>
      <i className="fr-hidden fr-unhidden-sm fr-text--sm fr-text-mention--grey fx-flex-shrink-0 fr-mb-0">
        {operator}
      </i>
      <div style={{ flex: 1, minWidth: 0 }}>
        {config.type === 'multiselect' && (
          <MultiselectValuePicker
            options={options}
            selectedValues={row.values}
            onChange={(values) => onValuesChange(values)}
            placeholder="Sélectionner..."
          />
        )}
        {config.type === 'async-search' && (
          <AsyncSearchValuePicker
            selectedValues={row.values}
            selectedItems={selectedInstitutions}
            onChange={(values, items) => onValuesChange(values, items)}
            placeholder="Rechercher..."
          />
        )}
        {config.type === 'boolean' && (
          <BooleanValuePicker
            value={row.values[0] || null}
            onChange={(value) => onValuesChange(value ? [value] : [])}
            counts={booleanCounts[config.key]}
          />
        )}
      </div>
      <button
        type="button"
        className="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline"
        onClick={onRemove}
        title="Supprimer ce filtre"
        aria-label="Supprimer ce filtre"
        style={{ alignSelf: 'center' }}
      />
    </div>
  );
}

// =============================================================================
// SEARCH ROW COMPONENT
// =============================================================================

interface SearchRowProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchRow({ value, onChange }: SearchRowProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputId = useId();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="filter-builder__row fx-flex fx-flex-col fx-gap-2w fr-px-3v fr-py-1w fr-mb-1w">
      <label htmlFor={inputId} className="fr-text--sm fr-text--bold fr-mb-0">
        Termes recherchés
      </label>
      <div className="fx-flex fx-items-center fx-gap-2w">
        <input
          id={inputId}
          type="text"
          placeholder="Exemple : (nucléaire NOT médecine)"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="filter-builder__search"
        />
        {value ? (
          <button
            type="button"
            className="fr-btn fr-icon-close-line fr-btn--tertiary-no-outline"
            onClick={handleClear}
            title="Effacer la recherche"
          />
        ) : (
          <button
            type="button"
            className="fr-btn fr-icon-search-line fr-btn--tertiary-no-outline"
            onClick={() => onChange(localValue)}
            title="Recherche"
          />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// ADD FILTER DROPDOWN
// =============================================================================

interface AddFilterDropdownProps {
  availableFilters: FilterConfig[];
  onAddFilter: (filterKey: keyof FilterState) => void;
}

function AddFilterDropdown({ availableFilters, onAddFilter }: AddFilterDropdownProps) {
  if (availableFilters.length === 0) {
    return null;
  }

  const domainFilters = availableFilters.filter((c) => c.group === 'domaine');
  const donneesDispoFilters = availableFilters.filter((c) => c.group === 'donneesDispo');
  const etablissementFilters = availableFilters.filter((c) => c.group === 'etablissement');
  const typeDiplomeFilters = availableFilters.filter((c) => c.group === 'typeDiplome');

  return (
    <Select label="Ajouter un filtre" outline={false} icon="add-line">
      <Select.Content>
        {typeDiplomeFilters.length > 0 && (
          <Select.Group label="Types de diplôme">
            {typeDiplomeFilters.map((config) => (
              <Select.Option
                key={config.key}
                value={config.key}
                onClick={() => onAddFilter(config.key)}
              >
                {config.label}
              </Select.Option>
            ))}
          </Select.Group>
        )}
        {etablissementFilters.length > 0 && (
          <Select.Group label="Établissements">
            {etablissementFilters.map((config) => (
              <Select.Option
                key={config.key}
                value={config.key}
                onClick={() => onAddFilter(config.key)}
              >
                {config.label}
              </Select.Option>
            ))}
          </Select.Group>
        )}
        {domainFilters.length > 0 && (
          <Select.Group label="Domaines">
            {domainFilters.map((config) => (
              <Select.Option
                key={config.key}
                value={config.key}
                onClick={() => onAddFilter(config.key)}
              >
                {config.label}
              </Select.Option>
            ))}
          </Select.Group>
        )}
        {donneesDispoFilters.length > 0 && (
          <Select.Group label="Données disponibles">
            {donneesDispoFilters.map((config) => (
              <Select.Option
                key={config.key}
                value={config.key}
                onClick={() => onAddFilter(config.key)}
              >
                {config.label}
              </Select.Option>
            ))}
          </Select.Group>
        )}
      </Select.Content>
    </Select>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FilterBuilder({
  filters,
  onFiltersChange,
  searchQuery = '',
  onSearchQueryChange,
  resultCount,
  isLoading = false,
}: FilterBuilderProps) {
  const id = useId();

  // Helper to extract active keys from filters
  const getActiveKeysFromFilters = useCallback((f: FilterState): (keyof FilterState)[] => {
    const keys: (keyof FilterState)[] = [];
    for (const config of FILTER_CONFIGS) {
      const value = f[config.key];
      if (Array.isArray(value) && value.length > 0) {
        keys.push(config.key);
      } else if (typeof value === 'string' && value) {
        keys.push(config.key);
      }
    }
    return keys;
  }, []);

  // Track which filters have been added as rows
  const [activeFilterKeys, setActiveFilterKeys] = useState<(keyof FilterState)[]>(() =>
    getActiveKeysFromFilters(filters),
  );

  // Track selected institutions for async search display
  const [selectedInstitutions, setSelectedInstitutions] = useState<Institution[]>([]);

  // Sync active filter keys when URL filters change
  useEffect(() => {
    const newKeys = getActiveKeysFromFilters(filters);
    setActiveFilterKeys((prev) => {
      const missingKeys = newKeys.filter((k) => !prev.includes(k));
      if (missingKeys.length > 0) {
        return [...prev, ...missingKeys];
      }
      return prev;
    });
  }, [filters, getActiveKeysFromFilters]);

  // Fetch facets for multiselect options
  const { facets, getBooleanCounts } = useProgramsFacets({
    query: searchQuery,
    staleTime: 5 * 60 * 1000,
  });

  // Build facets map
  const facetsMap = useMemo(
    () => ({
      cycles: facets.cycles,
      diplomaTypes: facets.diplomaTypes,
      diplomaCategories: facets.diplomaCategories,
      regions: facets.regions,
      academies: facets.academies,
      sectors: facets.sectors,
      disciplinarySectors: facets.disciplinarySectors,
      domains: facets.domains,
    }),
    [facets],
  );

  // Boolean counts
  const booleanCounts = useMemo(
    () => ({
      hasSiseInfos: getBooleanCounts(facets.hasSiseInfos),
      hasRncpInfos: getBooleanCounts(facets.hasRncpInfos),
      hasRomeInfos: getBooleanCounts(facets.hasRomeInfos),
    }),
    [facets, getBooleanCounts],
  );

  // Build rows from active filter keys
  const rows: FilterRowData[] = useMemo(() => {
    return activeFilterKeys.map((key) => {
      const value = filters[key];
      let values: string[] = [];
      if (Array.isArray(value)) {
        values = value;
      } else if (typeof value === 'string' && value) {
        values = [value];
      }
      return {
        id: `${id}-${key}`,
        filterKey: key,
        values,
      };
    });
  }, [activeFilterKeys, filters, id]);

  // Available filters (not yet added)
  const availableFilters = useMemo(() => {
    return FILTER_CONFIGS.filter((config) => !activeFilterKeys.includes(config.key));
  }, [activeFilterKeys]);

  // Handlers
  const handleAddFilter = useCallback((filterKey: keyof FilterState) => {
    setActiveFilterKeys((prev) => [...prev, filterKey]);
  }, []);

  const handleRemoveFilter = useCallback(
    (filterKey: keyof FilterState) => {
      setActiveFilterKeys((prev) => prev.filter((k) => k !== filterKey));

      const config = FILTER_CONFIGS.find((c) => c.key === filterKey);
      if (config) {
        if (config.type === 'boolean') {
          onFiltersChange({ ...filters, [filterKey]: null });
        } else {
          onFiltersChange({ ...filters, [filterKey]: [] });
        }
      }

      if (filterKey === 'paysageId') {
        setSelectedInstitutions([]);
      }
    },
    [filters, onFiltersChange],
  );

  const handleValuesChange = useCallback(
    (filterKey: keyof FilterState, values: string[], institutions?: Institution[]) => {
      const config = FILTER_CONFIGS.find((c) => c.key === filterKey);
      if (config) {
        if (config.type === 'boolean') {
          onFiltersChange({ ...filters, [filterKey]: values[0] || null });
        } else {
          onFiltersChange({ ...filters, [filterKey]: values });
        }
      }

      if (filterKey === 'paysageId' && institutions) {
        setSelectedInstitutions(institutions);
      }
    },
    [filters, onFiltersChange],
  );

  const handleClearAll = useCallback(() => {
    setActiveFilterKeys([]);
    setSelectedInstitutions([]);
    onFiltersChange({
      cycle: [],
      diplomaType: [],
      diplomaCategory: [],
      academy: [],
      region: [],
      paysageId: [],
      sector: [],
      disciplinarySector: [],
      domain: [],
      hasSiseInfos: null,
      hasRncpInfos: null,
      hasRomeInfos: null,
    });
    if (onSearchQueryChange) {
      onSearchQueryChange('');
    }
  }, [onFiltersChange, onSearchQueryChange]);

  const activeCount = rows.filter((r) => r.values.length > 0).length + (searchQuery ? 1 : 0);

  return (
    <div className="filter-builder fr-p-3v fr-mb-3w">
      <div className="fx-spacer fr-mb-3v">
        <span className="fr-text--bold fr-mb-0">
          <span className="fr-icon-search-line fr-mr-1v fr-icon--sm" aria-hidden="true" />
          Rechercher des formations
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
            onClick={handleClearAll}
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Search Row - Always visible */}
      {onSearchQueryChange && <SearchRow value={searchQuery} onChange={onSearchQueryChange} />}

      {/* Filter Rows */}
      {rows.map((row) => {
        const config = FILTER_CONFIGS.find((c) => c.key === row.filterKey);
        if (!config) return null;

        return (
          <FilterRow
            key={row.id}
            row={row}
            config={config}
            facets={facetsMap}
            booleanCounts={booleanCounts}
            selectedInstitutions={selectedInstitutions}
            onValuesChange={(values, institutions) =>
              handleValuesChange(row.filterKey, values, institutions)
            }
            onRemove={() => handleRemoveFilter(row.filterKey)}
          />
        );
      })}

      {/* Footer */}
      <div
        className="fx-spacer fr-mt-1v fr-pt-1w"
        style={{ borderTop: '1px dashed var(--border-default-grey)' }}
      >
        <AddFilterDropdown availableFilters={availableFilters} onAddFilter={handleAddFilter} />

        {resultCount !== undefined && (
          <div>
            {isLoading ? (
              <span className="fr-text--sm fr-text-mention--grey fr-mb-0">
                <span
                  className="fr-icon-refresh-line fr-icon--sm fr-mx-1v"
                  aria-hidden="true"
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                Chargement...
              </span>
            ) : (
              <span className="fr-text--sm fr-mb-0">
                <strong>{resultCount.toLocaleString('fr-FR')}</strong> résultat
                {resultCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterBuilder;
