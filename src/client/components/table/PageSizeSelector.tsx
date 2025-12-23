import { memo, useId } from 'react';
import Dropdown from '@/components/Dropdown';

export const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

interface PageSizeSelectorProps {
  value: string;
  onChange: (value: PageSize) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const PageSizeSelector = memo(function PageSizeSelector({
  value,
  onChange,
  size = 'sm',
}: PageSizeSelectorProps) {
  const id = useId();

  return (
    <Dropdown
      label={`${value} par page`}
      size={size}
      outline={false}
      title="Nombre d'éléments par page"
    >
      {PAGE_SIZE_OPTIONS.map((optionSize, index) => {
        const isChecked = value === optionSize;
        return (
          <div
            key={optionSize}
            role="menuitemradio"
            aria-checked={isChecked}
            className="fx-dropdown__input"
            tabIndex={0}
            onClick={() => onChange(optionSize)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(optionSize);
              }
            }}
          >
            <input
              type="radio"
              name={`${id}-page-size`}
              id={`${id}-${index}`}
              checked={isChecked}
              onChange={() => onChange(optionSize)}
              tabIndex={-1}
              aria-hidden="true"
            />
            <span>{optionSize} éléments</span>
          </div>
        );
      })}
    </Dropdown>
  );
});
