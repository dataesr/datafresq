import cn from 'classnames';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: string;
  iconPosition?: 'left' | 'right';
  destructive?: boolean;
  active?: boolean;
}

export function Item({
  children,
  icon,
  iconPosition = 'left',
  destructive = false,
  active = false,
  className,
  ...props
}: DropdownItemProps) {
  const iconClass = icon ? `fr-icon-${icon}` : null;
  const iconPosClass = icon && iconPosition === 'right' ? 'fx-dropdown__item--icon-right' : null;

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'fx-dropdown__item',
        iconClass,
        iconPosClass,
        {
          'fx-dropdown__item--destructive': destructive,
          'fx-dropdown__item--active': active,
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
