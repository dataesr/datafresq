import cn from 'classnames';
import type { ReactNode } from 'react';

export interface DropdownHeaderProps {
  children: ReactNode;
  className?: string;
}

export function Header({ children, className }: DropdownHeaderProps) {
  return <div className={cn('dropdown__header', className)}>{children}</div>;
}
