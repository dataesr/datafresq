import { useMemo, useState } from 'react';
import PillsTitle from '@/components/PillsTitle';
import { SearchInput } from '@/components/SearchInput';
import type { Program } from '~/schemas/programs';

type RomeInfo = NonNullable<Program['romeInfos']>[number];

interface DebouchesProps {
  romeInfos?: RomeInfo[];
}

interface TreeNode {
  level1: Map<
    string,
    {
      name: string;
      level3: Map<
        string,
        {
          name: string;
          jobs: RomeInfo[];
        }
      >;
    }
  >;
}

function buildTree(romeInfos: RomeInfo[]): TreeNode {
  const tree: TreeNode = { level1: new Map() };

  romeInfos.forEach((info) => {
    if (!tree.level1.has(info.idLevel1)) {
      tree.level1.set(info.idLevel1, {
        name: info.level1,
        level3: new Map(),
      });
    }
    const level1Node = tree.level1.get(info.idLevel1)!;

    if (!level1Node.level3.has(info.level3)) {
      level1Node.level3.set(info.level3, {
        name: info.level3,
        jobs: [],
      });
    }
    const level3Node = level1Node.level3.get(info.level3)!;

    level3Node.jobs.push(info);
  });

  return tree;
}

function highlightText(text: string, search: string): React.ReactElement {
  if (!search) return <>{text}</>;

  const regex = new RegExp(`(${search})`, 'gi');
  const parts = text.split(regex).map((part, index) => [part, index] as const);

  return (
    <>
      {parts.map((part) =>
        regex.test(part[0]) ? (
          <mark key={part[1]} className="">
            {part[0]}
          </mark>
        ) : (
          <span key={part[1]}>{part[0]}</span>
        ),
      )}
    </>
  );
}

function TreeLevel3({
  name,
  jobs,
  searchQuery,
  hasMatches,
}: {
  name: string;
  jobs: RomeInfo[];
  searchQuery: string;
  hasMatches: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const shouldBeOpen = searchQuery ? hasMatches : isOpen;

  return (
    <div className="fr-ml-4w">
      <button
        type="button"
        className={`fr-btn fr-btn--icon-left fr-btn--tertiary-no-outline fr-icon-${shouldBeOpen ? 'arrow-down' : 'arrow-right'}-s-line fr-mb-1w`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={shouldBeOpen}
      >
        <strong className="fr-text-default--grey">{highlightText(name, searchQuery)}&nbsp;</strong>{' '}
        <span className="fr-text-mention--grey fr-text--xs">
          ({jobs.length} {jobs.length > 1 ? 'métiers' : 'métier'})
        </span>
      </button>
      {shouldBeOpen && (
        <ul className="fr-ml-4w fr-mb-2w">
          {jobs.map((job) => (
            <li key={job.ogr} className="fr-text--sm fr-mb-1v">
              {highlightText(job.label, searchQuery)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TreeLevel1({
  name,
  level3Map,
  searchQuery,
  hasMatches,
}: {
  name: string;
  level3Map: Map<string, { name: string; jobs: RomeInfo[] }>;
  searchQuery: string;
  hasMatches: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const totalJobs = Array.from(level3Map.values()).reduce(
    (sum, level3) => sum + level3.jobs.length,
    0,
  );

  const shouldBeOpen = searchQuery ? hasMatches : isOpen;

  return (
    <div>
      <button
        type="button"
        className={`fr-btn fr-btn--icon-left fr-btn--tertiary-no-outline fr-icon-${shouldBeOpen ? 'arrow-down' : 'arrow-right'}-s-line fr-mb-1w`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={shouldBeOpen}
      >
        <strong className="fr-text-title--grey">{highlightText(name, searchQuery)}&nbsp;</strong>{' '}
        <span className="fr-text-mention--grey fr-text--xs">
          ({totalJobs} {totalJobs > 1 ? 'métiers' : 'métier'})
        </span>
      </button>
      {shouldBeOpen && (
        <div>
          {Array.from(level3Map.entries()).map(([level3Name, level3Data]) => {
            const level3HasMatches =
              searchQuery &&
              (level3Data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                level3Data.jobs.some((job) =>
                  job.label.toLowerCase().includes(searchQuery.toLowerCase()),
                ));

            if (searchQuery && !level3HasMatches) return null;

            return (
              <TreeLevel3
                key={level3Name}
                name={level3Data.name}
                jobs={level3Data.jobs.filter(
                  (job) =>
                    !searchQuery || job.label.toLowerCase().includes(searchQuery.toLowerCase()),
                )}
                searchQuery={searchQuery}
                hasMatches={!!level3HasMatches}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Debouches({ romeInfos }: DebouchesProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const tree = useMemo(() => {
    if (!romeInfos || romeInfos.length === 0) {
      return { level1: new Map() };
    }
    return buildTree(romeInfos);
  }, [romeInfos]) as TreeNode;

  const filteredTree = useMemo(() => {
    if (!searchQuery) return tree;

    const filtered: TreeNode = { level1: new Map() };
    const lowerSearch = searchQuery.toLowerCase();

    tree.level1.forEach((level1Data, level1Id) => {
      const level1Matches = level1Data.name.toLowerCase().includes(lowerSearch);
      const level3Filtered = new Map<string, { name: string; jobs: RomeInfo[] }>();

      level1Data.level3.forEach((level3Data, level3Name) => {
        const level3Matches = level3Data.name.toLowerCase().includes(lowerSearch);
        const matchedJobs = level3Data.jobs.filter((job) =>
          job.label.toLowerCase().includes(lowerSearch),
        );

        if (level1Matches || level3Matches || matchedJobs.length > 0) {
          level3Filtered.set(level3Name, {
            name: level3Data.name,
            jobs: level1Matches || level3Matches ? level3Data.jobs : matchedJobs,
          });
        }
      });

      if (level3Filtered.size > 0) {
        filtered.level1.set(level1Id, {
          name: level1Data.name,
          level3: level3Filtered,
        });
      }
    });

    return filtered;
  }, [tree, searchQuery]);

  const totalFilteredJobs = useMemo(() => {
    let count = 0;
    filteredTree.level1.forEach((level1Data) => {
      level1Data.level3.forEach((level3Data) => {
        count += level3Data.jobs.length;
      });
    });
    return count;
  }, [filteredTree]);

  // Now do conditional rendering
  if (romeInfos && romeInfos.length > 0) {
    return (
      <section id="debouches" className="formation-section">
        <PillsTitle as="h2" icon="fr-icon-briefcase-line">
          Débouchés professionnels
        </PillsTitle>

        <div className="fr-mb-3w">
          <p>
            Cette formation ouvre l'accès à <strong>{romeInfos.length} métiers</strong> répertoriés
            dans le Répertoire Opérationnel des Métiers et des Emplois (ROME).
          </p>
        </div>

        <SearchInput
          size="sm"
          placeholder="Rechercher un métier -- Ex: ingénieur, développeur, chimiste..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="fr-mb-2w"
        />

        {searchQuery && (
          <p className="fr-text--sm fr-mb-2w">
            <strong>{totalFilteredJobs}</strong> résultat{totalFilteredJobs > 1 ? 's' : ''} pour "
            <em>{searchQuery}</em>"
          </p>
        )}

        {filteredTree.level1.size === 0 ? (
          <div className="fr-callout">
            <p className="fr-callout__text">
              Aucun métier ne correspond à votre recherche "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="fr-accordions-group">
            {Array.from(filteredTree.level1.entries()).map(([level1Id, level1Data]) => {
              const level1HasMatches =
                searchQuery &&
                (level1Data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  Array.from(level1Data.level3.values()).some(
                    (level3) =>
                      level3.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      level3.jobs.some((job) =>
                        job.label.toLowerCase().includes(searchQuery.toLowerCase()),
                      ),
                  ));

              return (
                <TreeLevel1
                  key={level1Id}
                  name={level1Data.name}
                  level3Map={level1Data.level3}
                  searchQuery={searchQuery}
                  hasMatches={!!level1HasMatches}
                />
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <section id="debouches" className="formation-section">
      <PillsTitle as="h2" icon="fr-icon-briefcase-line">
        Débouchés professionnels
      </PillsTitle>

      <div className="fr-callout">
        <p>Aucune donnée disponible.</p>
      </div>
    </section>
  );
}
