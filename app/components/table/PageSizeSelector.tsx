import { memo } from 'react';
import { Select } from '@/components/ui/Select';

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
  return (
    <Select
      label={`${value} par page`}
      size={size}
      outline={false}
      title="Nombre d'éléments par page"
    >
      {PAGE_SIZE_OPTIONS.map((optionSize) => (
        <Select.Radio
          key={optionSize}
          value={optionSize}
          name="page-size"
          checked={value === optionSize}
          onChange={() => onChange(optionSize)}
        >
          {optionSize} éléments
        </Select.Radio>
      ))}
    </Select>
  );
});
