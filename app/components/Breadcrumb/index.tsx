import { useEffect, useId } from 'react';
import { Link } from 'react-router';
import './styles.css';

const APP_NAME = 'DataFresq';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  hidden?: boolean;
}

export function Breadcrumb({ items, hidden = false }: BreadcrumbProps) {
  const breadcrumbId = useId();

  useEffect(() => {
    const pageTitle = items
      .map((item) => item.label)
      .filter((label) => label !== 'Accueil')
      .reverse()
      .join(' - ');

    document.title = pageTitle ? `${pageTitle} - ${APP_NAME}` : APP_NAME;
  }, [items]);

  if (hidden) {
    return (
      <nav className="fr-sr-only" aria-label="vous êtes ici :">
        <ol>
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              {item.href ? (
                <Link to={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={item.current ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <nav className="fr-breadcrumb fx-breadcrumb" aria-label="vous êtes ici :">
      <button
        type="button"
        className="fr-breadcrumb__button"
        aria-expanded="false"
        aria-controls={breadcrumbId}
      >
        Voir le fil d'Ariane
      </button>
      <div className="fr-collapse" id={breadcrumbId}>
        <ol className="fr-breadcrumb__list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isCurrent = item.current ?? isLast;

            return (
              <li key={`${item.label}-${index}`}>
                {item.href && !isCurrent ? (
                  <Link className="fr-breadcrumb__link" to={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="fr-breadcrumb__link"
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export default Breadcrumb;
