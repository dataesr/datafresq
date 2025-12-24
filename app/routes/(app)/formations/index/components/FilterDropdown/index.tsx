import { useEffect, useRef, useState } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  icon?: string;
}

export function FilterDropdown({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Rechercher...',
  icon = 'filter-line',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === filteredOptions.length) {
      onChange([]);
    } else {
      onChange(filteredOptions.map((opt) => opt.value));
    }
  };

  const handleClear = () => {
    onChange([]);
    setSearchQuery('');
  };

  const selectedCount = selectedValues.length;
  const allFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => selectedValues.includes(opt.value));

  return (
    <div className="fr-form-group" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`fr-btn fr-btn--sm fr-btn--tertiary fr-btn--icon-left fr-icon-${icon} ${selectedCount > 0 ? 'fr-btn--tertiary-no-outline' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        {selectedCount > 0 && (
          <span className="fr-badge fr-badge--sm fr-badge--no-icon fr-ml-1w">{selectedCount}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="fr-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.5rem',
            minWidth: '20rem',
            maxWidth: '30rem',
            maxHeight: '28rem',
            backgroundColor: 'var(--background-default-grey)',
            boxShadow: 'var(--overlap-shadow)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search input */}
          <div className="fr-p-2w" style={{ borderBottom: '1px solid var(--border-default-grey)' }}>
            <div className="fr-search-bar" style={{ width: '100%' }}>
              <input
                className="fr-input"
                placeholder={placeholder}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Select All / Clear buttons */}
          <div
            className="fr-px-2w fr-py-1w"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-default-grey)',
            }}
          >
            <button
              type="button"
              className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
              onClick={handleSelectAll}
            >
              {allFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            {selectedCount > 0 && (
              <button
                type="button"
                className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                onClick={handleClear}
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="fr-px-2w fr-py-1w" style={{ overflowY: 'auto', maxHeight: '20rem' }}>
            {filteredOptions.length === 0 ? (
              <p className="fr-text--sm fr-text-mention--grey fr-my-2w">Aucun résultat</p>
            ) : (
              <ul className="fr-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filteredOptions.map((option) => (
                  <li key={option.value} style={{ marginBottom: '0.5rem' }}>
                    <div className="fr-checkbox-group">
                      <input
                        type="checkbox"
                        id={`filter-${option.value}`}
                        checked={selectedValues.includes(option.value)}
                        onChange={() => handleToggle(option.value)}
                      />
                      <label
                        className="fr-label"
                        htmlFor={`filter-${option.value}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{option.label}</span>
                        {option.count !== undefined && (
                          <span className="fr-badge fr-badge--sm fr-badge--no-icon">
                            {option.count}
                          </span>
                        )}
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
