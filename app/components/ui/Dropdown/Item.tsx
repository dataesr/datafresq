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
  const iconPosClass = icon && iconPosition === 'right' ? 'dropdown__item--icon-right' : null;

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'dropdown__item',
        iconClass,
        iconPosClass,
        {
          'dropdown__item--destructive': destructive,
          'dropdown__item--active': active,
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
