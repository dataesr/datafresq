import { Link } from 'react-router';
import { getChildren } from '../guide-utils';

interface SectionLinksProps {
  sectionHref: string;
  title?: string;
}

export default function SectionLinks({
  sectionHref,
  title = 'Dans cette section',
}: SectionLinksProps) {
  const children = getChildren(sectionHref);
  if (children.length === 0) return null;

  return (
    <div>
      <h2 className="fr-text--lg fr-text--bold fr-mb-2w">{title}</h2>
      <ul className="fx-flex fx-flex-col fx-gap-3w fr-raw-list">
        {children.map((child) => (
          <li key={child.href}>
            <Link to={child.href} className="fr-link">
              {child.title}
            </Link>
            <span
              className="fr-text--sm fr-text-mention--grey fr-mb-0"
              style={{ display: 'block' }}
            >
              {child.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
