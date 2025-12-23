import cn from 'classnames';
import { memo, useId } from 'react';
import Dropdown from '@/components/Dropdown';
import type { FacetItem } from '~/schemas/programs';
import './styles.css';

interface CheckboxMenuProps {
  /**
   * Button label
   */
  label: string;
  /**
   * Available options
   */
  options: FacetItem[];
  /**
   * Currently selected values
   */
  selectedValues: string[];
  /**
   * Callback when selection changes
   */
  onChange: (values: string[]) => void;

  /**
   * Button title/tooltip
   */
  title?: string;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Show count badge when items are selected
   * @default true
   */
  showSelectedCount?: boolean;
}

/**
 * Multi-select dropdown menu with checkboxes
 *
 * Features:
 * - DSFR styled checkboxes
 * - Shows count of selected items
 * - Displays option counts from facets
 * - Keyboard navigation
 *
 * Uses menuitemcheckbox role for accessibility.
 *
 * @example
 * <CheckboxMenu
 *   label="Cycle"
 *   options={[{ key: 'L', count: 100 }, { key: 'M', count: 200 }]}
 *   selectedValues={['L']}
 *   onChange={(values) => setSelectedCycles(values)}
 * />
 */
export const CheckboxMenu = memo(function CheckboxMenu({
  label,
  options,
  selectedValues,
  onChange,
  title,
  disabled = false,
  showSelectedCount = true,
}: CheckboxMenuProps) {
  const id = useId();

  const handleToggle = (key: string) => {
    if (selectedValues.includes(key)) {
      onChange(selectedValues.filter((v) => v !== key));
    } else {
      onChange([...selectedValues, key]);
    }
  };

  const selectedCount = selectedValues.length;

  const buttonLabel = (
    <>
      {label}
      {showSelectedCount && selectedCount > 0 && (
        <span className="fr-badge fr-badge--sm fr-badge--no-icon fr-badge--info fr-ml-1w">
          {selectedCount}
        </span>
      )}
    </>
  );

  return (
    <Dropdown
      label={buttonLabel}
      size="sm"
      outline={false}
      className={cn({ 'checkbox-menu-btn--active': selectedCount > 0 })}
      title={title ?? label}
      disabled={disabled}
    >
      {options.length === 0 ? (
        <div className="fx-dropdown__empty">Aucune option</div>
      ) : (
        options.map((option, index) => {
          const isChecked = selectedValues.includes(option.key);
          return (
            <div
              key={option.key}
              role="menuitemcheckbox"
              aria-checked={isChecked}
              className="fx-dropdown__input"
              tabIndex={0}
              onClick={() => handleToggle(option.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggle(option.key);
                }
              }}
            >
              <input
                type="checkbox"
                id={`${id}-${index}`}
                checked={isChecked}
                onChange={() => handleToggle(option.key)}
                tabIndex={-1}
                aria-hidden="true"
              />
              <span className="checkbox-menu-label-content">
                <span className="checkbox-menu-label-text" title={option.key}>
                  {option.key}
                </span>
                <span className="fr-badge fr-badge--sm fr-badge--no-icon">
                  {option.count.toLocaleString('fr-FR')}
                </span>
              </span>
            </div>
          );
        })
      )}
    </Dropdown>
  );
});
