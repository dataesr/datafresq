import { Link, useLocation } from 'react-router';
import { getNavItems } from '../guide-utils';
import type { NavItem } from '../types';

const NAV_ITEMS = getNavItems();

function isInSection(pathname: string, href: string): boolean {
  if (href === '/guide') return pathname === '/guide';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidemenuItem({ item, idPrefix }: { item: NavItem; idPrefix: string }) {
  const { pathname } = useLocation();
  const isCurrent = pathname === item.href;
  const isActive = isInSection(pathname, item.href);
  const hasChildren = item.children && item.children.length > 0;
  const collapseId = `${idPrefix}-${item.id}`;

  if (!hasChildren) {
    return (
      <li className="fr-sidemenu__item">
        <Link
          className="fr-sidemenu__link"
          to={item.href}
          aria-current={isCurrent ? 'page' : undefined}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="fr-sidemenu__item">
      <button
        type="button"
        className="fr-sidemenu__btn"
        aria-current={isActive ? 'true' : undefined}
        aria-expanded={isActive ? 'true' : 'false'}
        aria-controls={collapseId}
      >
        {item.label}
      </button>
      <div className="fr-collapse" id={collapseId}>
        <ul className="fr-sidemenu__list">
          <li className="fr-sidemenu__item">
            <Link
              className="fr-sidemenu__link"
              to={item.href}
              aria-current={isCurrent ? 'page' : undefined}
            >
              Vue d'ensemble
            </Link>
          </li>
          {item.children!.map((child) => (
            <SidemenuItem key={child.href} item={child} idPrefix={idPrefix} />
          ))}
        </ul>
      </div>
    </li>
  );
}

interface DocSidemenuProps {
  idPrefix?: string;
}

export default function DocSidemenu({ idPrefix = 'sidemenu' }: DocSidemenuProps) {
  const titleId = `${idPrefix}-title`;

  return (
    <nav className="fr-pr-0 fr-sidemenu fr-sidemenu--sticky-full-height" aria-labelledby={titleId}>
      <div className="fr-sidemenu__inner fr-pt-3v fr-px-1v">
        <Link
          to="/"
          className="fr-link fr-link--sm fr-btn--tertiary-no-outline fr-icon-arrow-left-line fr-link--icon-left fr-pl-2w"
        >
          Retour à l'application
        </Link>
        <p className="fr-text--lg fr-text--bold fr-pl-2w fr-mt-3w fr-mb-0" id={titleId}>
          Guide d'utilisation
        </p>
        <p className="fr-text--sm fr-text-mention--grey fr-pl-2w fr-pb-2w fr-mb-1w fx-shadow-border-bottom">
          dataFRESQ - version 1.0.0
        </p>
        <ul className="fr-sidemenu__list">
          {NAV_ITEMS.map((item) => (
            <SidemenuItem key={item.href} item={item} idPrefix={idPrefix} />
          ))}
        </ul>
      </div>
    </nav>
  );
}
