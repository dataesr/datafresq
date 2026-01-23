import cn from 'classnames';
import type { InputHTMLAttributes } from 'react';
import { useSelectContext } from './context';

export interface SelectSearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  className?: string;
}

export function Search({ className, placeholder = 'Rechercher...', ...props }: SelectSearchProps) {
  const { size } = useSelectContext();

  const sizeClass = size !== 'md' ? `fx-select__search--${size}` : null;

  return (
    <div className={cn('fx-select__search', sizeClass, className)}>
      <input
        type="search"
        data-autofocus
        placeholder={placeholder}
        className="fx-select__search-input"
        {...props}
      />
    </div>
  );
}
