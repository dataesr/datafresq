import cn from 'classnames';
import type { CSSProperties, ReactNode } from 'react';

export interface DropdownContentProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}

export function Content({ children, className, maxHeight }: DropdownContentProps) {
  const style: CSSProperties | undefined = maxHeight ? { maxHeight } : undefined;

  return (
    <div className={cn('dropdown__content', className)} style={style}>
      {children}
    </div>
  );
}
