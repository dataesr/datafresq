import cn from 'classnames';
import type { ReactNode } from 'react';

export interface SelectEmptyProps {
  children?: ReactNode;
  className?: string;
}

export function Empty({ children = 'Aucun résultat', className }: SelectEmptyProps) {
  return <div className={cn('fx-select__empty', className)}>{children}</div>;
}
