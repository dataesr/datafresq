import { Link } from 'react-router';

const SOURCES = {
  sise: { label: 'SISE (MESR)', href: '/guide/donnees/sise' },
  insersup: { label: 'InserSup (MESR)', href: '/guide/donnees/insersup' },
  fresq: { label: 'Fresq (MESR)', href: '/guide/donnees/fresq' },
  paysage: { label: 'Paysage', href: '/guide/donnees/paysage' },
  rome: { label: 'ROME (France Travail)', href: '/guide/donnees/rome' },
} as const;

export type SourceKey = keyof typeof SOURCES;

export type SourceRef = SourceKey | React.ReactNode;

export function isSourceKey(value: unknown): value is SourceKey {
  return typeof value === 'string' && value in SOURCES;
}

function SourceLink({ sourceKey }: { sourceKey: SourceKey }) {
  const source = SOURCES[sourceKey];
  return <Link to={source.href}>{source.label}</Link>;
}

export function renderSource(ref: SourceRef): React.ReactNode {
  if (isSourceKey(ref)) {
    return <SourceLink sourceKey={ref} />;
  }
  return ref;
}

export function renderSources(source: SourceRef | SourceRef[]): React.ReactNode {
  const refs = Array.isArray(source) ? source : [source];
  return refs.map((ref, i) => (
    <span key={isSourceKey(ref) ? ref : i}>
      {i > 0 && ', '}
      {renderSource(ref)}
    </span>
  ));
}
