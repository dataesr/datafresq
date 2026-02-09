import cn from 'classnames';
import type { ReactNode } from 'react';

export interface DropdownFooterProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'between';
}

export function Footer({ children, className, align = 'between' }: DropdownFooterProps) {
  return (
    <div
      className={cn(
        'dropdown__footer',
        align !== 'between' && `dropdown__footer--${align}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
