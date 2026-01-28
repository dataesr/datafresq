import cn from 'classnames';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router';

export interface DropdownLinkProps extends Omit<RouterLinkProps, 'className'> {
  children: ReactNode;
  icon?: string;
  iconPosition?: 'left' | 'right';
  className?: string;
  active?: boolean;
}

export interface DropdownExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  icon?: string;
  iconPosition?: 'left' | 'right';
  external: true;
  active?: boolean;
}

type LinkComponentProps = DropdownLinkProps | DropdownExternalLinkProps;

function isExternalLink(props: LinkComponentProps): props is DropdownExternalLinkProps {
  return 'external' in props && props.external === true;
}

export function Link(props: LinkComponentProps) {
  const { children, icon, iconPosition = 'left', className, active = false, ...rest } = props;

  const iconClass = icon ? `fr-icon-${icon}` : null;
  const iconPosClass = icon && iconPosition === 'right' ? 'fx-dropdown__item--icon-right' : null;

  const classes = cn(
    'fx-dropdown__item',
    iconClass,
    iconPosClass,
    {
      'fx-dropdown__item--active': active,
    },
    className,
  );

  if (isExternalLink(props)) {
    const { external: _, ...anchorProps } = rest as DropdownExternalLinkProps;
    return (
      <a role="menuitem" className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink role="menuitem" className={classes} {...(rest as RouterLinkProps)}>
      {children}
    </RouterLink>
  );
}
