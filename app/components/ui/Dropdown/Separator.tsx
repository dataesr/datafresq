import cn from 'classnames';

export interface DropdownSeparatorProps {
  className?: string;
}

export function Separator({ className }: DropdownSeparatorProps) {
  return <hr className={cn('dropdown__separator', className)} />;
}
