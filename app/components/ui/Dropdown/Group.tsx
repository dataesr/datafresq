import cn from 'classnames';
import type { ReactNode } from 'react';

export interface DropdownGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function Group({ label, children, className }: DropdownGroupProps) {
  return (
    /* biome-ignore lint/a11y/useSemanticElements: role="group" is intentional */
    <div role="group" aria-label={label} className={cn('fx-dropdown__group', className)}>
      {label && <div className="fx-dropdown__group-label">{label}</div>}
      <div className="fx-dropdown__group-content">{children}</div>
    </div>
  );
}
