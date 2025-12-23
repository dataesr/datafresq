import cn, { type Argument } from 'classnames';
import { forwardRef } from 'react';
import type { DSFRColors } from './types';

export type ButtonProps = {
  className?: Argument;
  color?: DSFRColors | 'default';
  icon?: string;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'tertiary' | 'text';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      color = 'default',
      icon,
      iconPosition = 'left',
      size = 'md',
      variant = 'default',
      children,
      ...props
    },
    ref,
  ) => {
    const _classes = cn(
      'fr-btn',
      {
        [`fr-btn--${size}`]: size !== 'md',
        [`fr-btn--${color}`]: !!color && color !== 'default',
        'fr-btn--secondary': variant === 'secondary',
        'fr-btn--tertiary': variant === 'tertiary',
        'fr-btn--tertiary-no-outline': variant === 'text',
        [`fr-icon-${icon}`]: !!icon,
        [`fr-btn--icon-${iconPosition}`]: icon && children,
        'fr-btn--icon': icon && !children,
      },
      className,
    );
    return (
      <button className={_classes} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);
