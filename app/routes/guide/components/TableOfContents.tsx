import { useEffect, useState } from 'react';
import type { TocEntry } from '../guide-content.generated';

interface TocNode {
  entry: TocEntry;
  children: TocNode[];
}

function buildTocTree(entries: TocEntry[]): TocNode[] {
  const roots: TocNode[] = [];
  const ancestors: TocNode[] = [];

  for (const entry of entries) {
    const node: TocNode = { entry, children: [] };

    while (ancestors.length > 0 && ancestors[ancestors.length - 1]!.entry.level >= entry.level) {
      ancestors.pop();
    }

    const parent = ancestors[ancestors.length - 1];
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }

    ancestors.push(node);
  }

  return roots;
}

/**
 * Tracks which heading is currently visible in the viewport.
 *
 * Uses the IntersectionObserver API to monitor all heading elements matching
 * the given IDs. The observer is configured with:
 *
 * - `rootMargin: '0px 0px -80% 0px'` — shrinks the observed area by 80% from
 *   the bottom, so only the top 20% of the viewport counts as the "active zone".
 *   A heading becomes active when it scrolls into this top strip.
 *
 * - `threshold: 0` — fires as soon as any part of the heading crosses the zone
 *   boundary (entering or leaving).
 *
 * When multiple headings enter the zone (e.g. short sections), the last one to
 * fire an `isIntersecting` event wins, which naturally corresponds to the
 * heading the user just scrolled to.
 *
 * The observer is rebuilt whenever the list of IDs changes, and disconnected
 * on cleanup to avoid memory leaks.
 */
function useActiveHeading(ids: string[]): string {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

function TocList({ nodes, activeId }: { nodes: TocNode[]; activeId: string }) {
  return (
    <ol className="fr-summary__list">
      {nodes.map((node) => (
        <li key={node.entry.id}>
          <a
            className="fr-summary__link"
            href={`#${node.entry.id}`}
            aria-current={activeId === node.entry.id ? 'true' : undefined}
          >
            {node.entry.text}
          </a>
          {node.children.length > 0 && (
            <TocList nodes={node.children} activeId={activeId} />
          )}
        </li>
      ))}
    </ol>
  );
}

interface TableOfContentsProps {
  entries: TocEntry[];
}

export default function TableOfContents({ entries }: TableOfContentsProps) {
  const ids = entries.map((e) => e.id);
  const activeId = useActiveHeading(ids);

  if (entries.length === 0) return null;

  const tree = buildTocTree(entries);

  return (
    <nav className="fr-summary docs-toc" role="navigation" aria-label="Sommaire">
      <p className="fr-summary__title">Sur cette page</p>
      <TocList nodes={tree} activeId={activeId} />
    </nav>
  );
}
