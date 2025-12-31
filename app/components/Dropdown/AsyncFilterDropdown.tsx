import { useCallback, useEffect, useState } from 'react';
import Dropdown from './index';

// =============================================================================
// TYPES
// =============================================================================

export interface AsyncFilterOption {
  id: string;
  label: string;
  subLabel?: string;
}

interface AsyncFilterDropdownProps {
  /**
   * Label displayed on the dropdown button
   */
  label: string;
  /**
   * Currently selected option IDs
   */
  selectedIds: string[];
  /**
   * Callback when selection changes
   */
  onSelectionChange: (ids: string[]) => void;
  /**
   * Async function to search for options
   */
  onSearch: (query: string) => void;
  /**
   * Options returned from the search
   */
  options: AsyncFilterOption[];
  /**
   * Whether the search is loading
   */
  isLoading?: boolean;
  /**
   * Placeholder text for the search input
   */
  searchPlaceholder?: string;
  /**
   * Minimum characters before triggering search
   */
  minSearchLength?: number;
  /**
   * Debounce delay in ms
   */
  debounceMs?: number;
  /**
   * Message when no results found
   */
  noResultsMessage?: string;
  /**
   * Message when search is too short
   */
  minLengthMessage?: string;
  /**
   * Selected items to display (for showing selected items not in current search)
   */
  selectedItems?: AsyncFilterOption[];
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AsyncFilterDropdown({
  label,
  selectedIds,
  onSelectionChange,
  onSearch,
  options,
  isLoading = false,
  searchPlaceholder = 'Rechercher...',
  minSearchLength = 2,
  debounceMs = 300,
  noResultsMessage = 'Aucun résultat',
  minLengthMessage = 'Saisissez au moins 2 caractères',
  selectedItems = [],
}: AsyncFilterDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= minSearchLength) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, minSearchLength, onSearch]);

  const handleToggle = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    },
    [selectedIds, onSelectionChange],
  );

  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
    setSearchQuery('');
  }, [onSelectionChange]);

  // Merge selected items with search results, avoiding duplicates
  const displayOptions = [...selectedItems];
  for (const option of options) {
    if (!displayOptions.find((o) => o.id === option.id)) {
      displayOptions.push(option);
    }
  }

  // If there are selected items, show them first
  const sortedOptions = displayOptions.sort((a, b) => {
    const aSelected = selectedIds.includes(a.id);
    const bSelected = selectedIds.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const selectedCount = selectedIds.length;
  const buttonLabel = selectedCount > 0 ? `${label} (${selectedCount})` : label;

  const showInitialMessage = searchQuery.length === 0 && selectedItems.length === 0;
  const showMinLengthMessage =
    searchQuery.length > 0 && searchQuery.length < minSearchLength && options.length === 0;
  const showNoResults = !isLoading && searchQuery.length >= minSearchLength && options.length === 0;
  const showOptions = sortedOptions.length > 0 || selectedItems.length > 0;

  return (
    <Dropdown label={buttonLabel} size="md" outline>
      {/* Search input */}
      <div className="fx-dropdown__search">
        <input
          type="search"
          data-autofocus
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="fx-dropdown__loading">
          <span className="fr-icon-loader-4-line" aria-hidden="true" />
          <span>Chargement...</span>
        </div>
      )}

      {/* Initial message when search is empty */}
      {showInitialMessage && !isLoading && (
        <div className="fx-dropdown__empty">{minLengthMessage}</div>
      )}

      {/* Min length message */}
      {showMinLengthMessage && !isLoading && (
        <div className="fx-dropdown__empty">{minLengthMessage}</div>
      )}

      {/* No results message */}
      {showNoResults && <div className="fx-dropdown__empty">{noResultsMessage}</div>}

      {/* Options list */}
      {showOptions && !isLoading && (
        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {sortedOptions.map((option) => {
            const isChecked = selectedIds.includes(option.id);
            return (
              <div
                key={option.id}
                role="menuitemcheckbox"
                aria-checked={isChecked}
                className="fx-dropdown__input"
                tabIndex={0}
                onClick={() => handleToggle(option.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(option.id);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(option.id)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span>{option.label}</span>
                  {option.subLabel && (
                    <p className="fr-text--xs fr-text-mention--grey fr-mb-0">{option.subLabel}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions footer */}
      <div className="fx-dropdown__actions">
        <button
          type="button"
          role="menuitem"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
          onClick={handleClearAll}
          disabled={selectedCount === 0}
        >
          Effacer ({selectedCount})
        </button>
      </div>
    </Dropdown>
  );
}

export default AsyncFilterDropdown;
