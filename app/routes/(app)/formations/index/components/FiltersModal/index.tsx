import cn from 'classnames';
import { useEffect, useId, useState } from 'react';
import { useProgramsFacets } from '@/api/programs';
import { Button } from '@/components/Button';
import { Modal, useModal } from '@/components/Modal';
import type { FacetItem } from '~/schemas/programs';
import { useProgramsFilters } from '../../hooks/useProgramsFilters';

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="fr-mb-3w">
      <button
        type="button"
        className="fr-collapse__btn"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0',
          background: 'none',
          border: 'none',
          borderBottom: '1px solid var(--border-default-grey)',
          cursor: 'pointer',
        }}
      >
        <span className="fr-text--bold">{title}</span>
        <span className={`fr-icon-arrow-${isOpen ? 'up' : 'down'}-s-line`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div id={id} className="fr-pt-2w">
          {children}
        </div>
      )}
    </div>
  );
}

// Checkbox list for multi-select filters
function CheckboxFilterList({
  options,
  selectedValues,
  onChange,
  maxVisible = 8,
  searchable = false,
}: {
  options: FacetItem[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  maxVisible?: number;
  searchable?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const id = useId();

  const filteredOptions = searchable
    ? options.filter((opt) => opt.key.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const visibleOptions = showAll ? filteredOptions : filteredOptions.slice(0, maxVisible);

  const handleToggle = (key: string) => {
    if (selectedValues.includes(key)) {
      onChange(selectedValues.filter((v) => v !== key));
    } else {
      onChange([...selectedValues, key]);
    }
  };

  return (
    <div>
      {searchable && options.length > maxVisible && (
        <div className="fr-mb-2w">
          <input
            type="text"
            className="fr-input fr-input--sm"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      <div
        style={{ maxHeight: showAll ? '300px' : 'auto', overflowY: showAll ? 'auto' : 'visible' }}
      >
        {visibleOptions.length === 0 ? (
          <p className="fr-text--sm fr-text-mention--grey">Aucun résultat</p>
        ) : (
          visibleOptions.map((option, index) => (
            <div key={option.key} className="fr-fieldset__element fr-mb-1w">
              <div className="fr-checkbox-group fr-checkbox-group--sm">
                <input
                  type="checkbox"
                  id={`${id}-${index}`}
                  checked={selectedValues.includes(option.key)}
                  onChange={() => handleToggle(option.key)}
                />
                <label className="fr-label" htmlFor={`${id}-${index}`}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span className="clamp-1" title={option.key}>
                      {option.key}
                    </span>
                    <span className="fr-badge fr-badge--sm fr-badge--no-icon fr-ml-1w">
                      {option.count.toLocaleString('fr-FR')}
                    </span>
                  </span>
                </label>
              </div>
            </div>
          ))
        )}
      </div>
      {filteredOptions.length > maxVisible && (
        <button
          type="button"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-mt-1w"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Voir moins' : `Voir tout (${filteredOptions.length})`}
        </button>
      )}
    </div>
  );
}

// Boolean toggle filter (for has* fields)
function BooleanFilter({
  label,
  value,
  onChange,
  counts,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  counts?: { true: number; false: number };
}) {
  const id = useId();

  return (
    <div className="fr-fieldset__element">
      <fieldset className="fr-fieldset" aria-labelledby={`${id}-legend`}>
        <legend className="fr-fieldset__legend fr-text--sm" id={`${id}-legend`}>
          {label}
        </legend>
        <div className="fr-fieldset__content" style={{ display: 'flex', gap: '1rem' }}>
          <div className="fr-radio-group fr-radio-group--sm">
            <input
              type="radio"
              id={`${id}-all`}
              name={id}
              checked={value === null}
              onChange={() => onChange(null)}
            />
            <label className="fr-label" htmlFor={`${id}-all`}>
              Tous
            </label>
          </div>
          <div className="fr-radio-group fr-radio-group--sm">
            <input
              type="radio"
              id={`${id}-true`}
              name={id}
              checked={value === 'true'}
              onChange={() => onChange('true')}
            />
            <label className="fr-label" htmlFor={`${id}-true`}>
              Oui {counts?.true !== undefined && `(${counts.true.toLocaleString('fr-FR')})`}
            </label>
          </div>
          <div className="fr-radio-group fr-radio-group--sm">
            <input
              type="radio"
              id={`${id}-false`}
              name={id}
              checked={value === 'false'}
              onChange={() => onChange('false')}
            />
            <label className="fr-label" htmlFor={`${id}-false`}>
              Non {counts?.false !== undefined && `(${counts.false.toLocaleString('fr-FR')})`}
            </label>
          </div>
        </div>
      </fieldset>
    </div>
  );
}

export default function FiltersModal() {
  const { modalProps, open, close } = useModal();
  const { params, currentFilters, activeFilterCount, handleApplyFilters } = useProgramsFilters();
  const { facets, isLoading } = useProgramsFacets({ query: params.q });

  const [localFilters, setLocalFilters] = useState(currentFilters);

  // Sync local state when URL filters change
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleApply = () => {
    handleApplyFilters(localFilters);
    close();
  };

  const handleReset = () => {
    const emptyFilters = {
      cycle: [],
      diplomaType: [],
      diplomaCategory: [],
      academy: [],
      region: [],
      sector: [],
      disciplinarySector: [],
      domain: [],
      hasSiseInfos: null,
      hasRncpInfos: null,
      hasRomeInfos: null,
    };
    setLocalFilters(emptyFilters);
  };

  // Helper to get boolean counts
  const getBooleanCounts = (items: FacetItem[]): { true: number; false: number } => {
    const trueItem = items.find((i) => i.key === 'true');
    const falseItem = items.find((i) => i.key === 'false');
    return {
      true: trueItem?.count ?? 0,
      false: falseItem?.count ?? 0,
    };
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        className={cn('fr-btn fr-btn--secondary fr-btn--icon-left', {
          'fr-icon-equalizer-fill': activeFilterCount > 0,
          'fr-icon-equalizer-line': activeFilterCount === 0,
        })}
        onClick={open}
        style={{
          backgroundColor:
            activeFilterCount > 0 ? 'var(--background-action-low-blue-france)' : undefined,
        }}
      >
        Filtres
        {activeFilterCount > 0 && (
          <span className="fr-badge fr-badge--sm fr-badge--no-icon fr-badge--info fr-ml-1w">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Modal */}
      <Modal {...modalProps} data-fr-concealing-backdrop={false}>
        <div className="fr-container fr-container--fluid fr-container-md">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12" style={{ maxWidth: '700px' }}>
              <div className="fr-modal__body">
                <div className="fr-modal__header">
                  <button
                    type="button"
                    className="fr-btn--close fr-btn"
                    title="Fermer"
                    onClick={close}
                  >
                    Fermer
                  </button>
                </div>
                <div className="fr-modal__content">
                  <h1 className="fr-modal__title">
                    <span className="fr-icon-filter-line fr-mr-1w" aria-hidden="true" />
                    Filtres avancés
                    {activeFilterCount > 0 && (
                      <span className="fr-badge fr-badge--sm fr-badge--info fr-ml-2w">
                        {activeFilterCount} actif{activeFilterCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </h1>

                  {isLoading ? (
                    <div className="fr-py-4w" style={{ textAlign: 'center' }}>
                      <p>Chargement des filtres...</p>
                    </div>
                  ) : (
                    <div className="fr-grid-row fr-grid-row--gutters">
                      {/* Left column */}
                      <div className="fr-col-12">
                        <FilterSection title="Diplôme">
                          <p className="fr-text--sm fr-text-mention--grey fr-mb-1w">Cycle</p>
                          <CheckboxFilterList
                            options={facets.cycles}
                            selectedValues={localFilters.cycle}
                            onChange={(values) =>
                              setLocalFilters((prev) => ({ ...prev, cycle: values }))
                            }
                            maxVisible={10}
                          />

                          <p className="fr-text--sm fr-text-mention--grey fr-mb-1w fr-mt-2w">
                            Type de diplôme
                          </p>
                          <CheckboxFilterList
                            options={facets.diplomaTypes}
                            selectedValues={localFilters.diplomaType}
                            onChange={(values) =>
                              setLocalFilters((prev) => ({ ...prev, diplomaType: values }))
                            }
                            maxVisible={8}
                            searchable
                          />

                          <p className="fr-text--sm fr-text-mention--grey fr-mb-1w fr-mt-2w">
                            Catégorie
                          </p>
                          <CheckboxFilterList
                            options={facets.diplomaCategories}
                            selectedValues={localFilters.diplomaCategory}
                            onChange={(values) =>
                              setLocalFilters((prev) => ({ ...prev, diplomaCategory: values }))
                            }
                            maxVisible={8}
                          />
                        </FilterSection>

                        <FilterSection title="Géographie">
                          <p className="fr-text--sm fr-text-mention--grey fr-mb-1w">Académie</p>
                          <CheckboxFilterList
                            options={facets.academies}
                            selectedValues={localFilters.academy}
                            onChange={(values) =>
                              setLocalFilters((prev) => ({ ...prev, academy: values }))
                            }
                            maxVisible={8}
                            searchable
                          />

                          <p className="fr-text--sm fr-text-mention--grey fr-mb-1w fr-mt-2w">
                            Région
                          </p>
                          <CheckboxFilterList
                            options={facets.regions}
                            selectedValues={localFilters.region}
                            onChange={(values) =>
                              setLocalFilters((prev) => ({ ...prev, region: values }))
                            }
                            maxVisible={8}
                            searchable
                          />
                        </FilterSection>
                      </div>

                      {/* Right column */}
                      <div className="fr-col-12">
                        <FilterSection title="Établissement">
                          <p className="fr-text--sm fr-text-mention--grey fr-mb-1w">Secteur</p>
                          <CheckboxFilterList
                            options={facets.sectors}
                            selectedValues={localFilters.sector}
                            onChange={(values) =>
                              setLocalFilters((prev) => ({ ...prev, sector: values }))
                            }
                            maxVisible={5}
                          />
                        </FilterSection>

                        <FilterSection title="Contenu">
                          <p className="fr-text--sm fr-text-mention--grey fr-mb-1w">
                            Secteur disciplinaire
                          </p>
                          <CheckboxFilterList
                            options={facets.disciplinarySectors}
                            selectedValues={localFilters.disciplinarySector}
                            onChange={(values) =>
                              setLocalFilters((prev) => ({ ...prev, disciplinarySector: values }))
                            }
                            maxVisible={8}
                            searchable
                          />

                          <p className="fr-text--sm fr-text-mention--grey fr-mb-1w fr-mt-2w">
                            Domaines
                          </p>
                          <CheckboxFilterList
                            options={facets.domains}
                            selectedValues={localFilters.domain}
                            onChange={(values) =>
                              setLocalFilters((prev) => ({ ...prev, domain: values }))
                            }
                            maxVisible={8}
                            searchable
                          />
                        </FilterSection>

                        <FilterSection title="Données disponibles">
                          <BooleanFilter
                            label="Données SISE"
                            value={localFilters.hasSiseInfos}
                            onChange={(value) =>
                              setLocalFilters((prev) => ({ ...prev, hasSiseInfos: value }))
                            }
                            counts={getBooleanCounts(facets.hasSiseInfos)}
                          />
                          <BooleanFilter
                            label="Données RNCP"
                            value={localFilters.hasRncpInfos}
                            onChange={(value) =>
                              setLocalFilters((prev) => ({ ...prev, hasRncpInfos: value }))
                            }
                            counts={getBooleanCounts(facets.hasRncpInfos)}
                          />
                          <BooleanFilter
                            label="Données ROME"
                            value={localFilters.hasRomeInfos}
                            onChange={(value) =>
                              setLocalFilters((prev) => ({ ...prev, hasRomeInfos: value }))
                            }
                            counts={getBooleanCounts(facets.hasRomeInfos)}
                          />
                        </FilterSection>
                      </div>
                    </div>
                  )}
                </div>
                <div className="fr-modal__footer">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button
                      variant="tertiary"
                      onClick={handleReset}
                      disabled={activeFilterCount === 0}
                    >
                      Réinitialiser
                    </Button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="secondary" onClick={close}>
                        Annuler
                      </Button>
                      <Button onClick={handleApply}>Appliquer les filtres</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
