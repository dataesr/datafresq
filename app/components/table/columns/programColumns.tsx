import type { ColumnDef } from '@tanstack/react-table';
import cn from 'classnames';
import { useId } from 'react';
import { Link } from 'react-router';
import type { ProgramSearch } from '~/schemas/programs';
import { getFieldDisplayName } from '~/utils/search';
import { IndeterminateCheckbox } from '../IndeterminateCheckbox';

/**
 * Score indicator component showing relevance bars
 */
function ScoreIndicator({ score = 0 }: { score?: number }) {
  const id = useId();
  const bars = [0.1, 0.3, 0.5, 0.7, 0.9];

  return (
    <div className="fr-pr-3w" style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
      {bars.map((threshold, index) => (
        <div
          key={`${id}-${bars[index]}`}
          style={{
            borderRadius: '2px',
            height: '12px',
            width: '3px',
            backgroundColor:
              score > threshold ? 'var(--text-default-info)' : 'var(--background-contrast-info)',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Highlight tooltip component for search results
 */
function HighlightTooltip({
  highlight,
  rowId,
}: {
  highlight: Record<string, string[]>;
  rowId: string;
}) {
  const id = useId();
  if (!highlight || Object.keys(highlight).length === 0) return null;

  return (
    <span
      className="fr-tooltip fr-placement"
      id={`tooltip-${rowId}`}
      role="tooltip"
      aria-hidden="true"
    >
      {Object.entries(highlight).map(([key, values]) => (
        <div key={key} className="highlighted-field">
          <span className="fr-mr-1w fr-text--sm highlighted-title">{getFieldDisplayName(key)}</span>
          {values.map((v) => (
            <p
              key={`${id}-${key}-${v}`}
              className="fr-text--xs highlighted"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Highlights
              dangerouslySetInnerHTML={{ __html: v }}
            />
          ))}
        </div>
      ))}
    </span>
  );
}

/**
 * All available column IDs for program tables
 */
export const PROGRAM_COLUMN_IDS = {
  select: 'select',
  officialTitle: 'officialTitle',
  score: 'score',
  cycle: 'cycle',
  degreeTypeCode: 'degreeTypeCode',
  sise: 'sise',
  rncp: 'rncp',
  rome: 'rome',
} as const;

export type ProgramColumnId = (typeof PROGRAM_COLUMN_IDS)[keyof typeof PROGRAM_COLUMN_IDS];

/**
 * Labels for toggleable columns
 */
export const PROGRAM_COLUMN_LABELS: Record<string, string> = {
  [PROGRAM_COLUMN_IDS.score]: 'Score',
  [PROGRAM_COLUMN_IDS.cycle]: 'Cycle',
  [PROGRAM_COLUMN_IDS.degreeTypeCode]: 'Type de diplôme',
  [PROGRAM_COLUMN_IDS.sise]: 'SISE',
  [PROGRAM_COLUMN_IDS.rncp]: 'RNCP',
  [PROGRAM_COLUMN_IDS.rome]: 'ROME',
};

/**
 * All available column definitions for program tables
 * Each table can pick which columns to use
 */
export function getProgramColumns(): Record<ProgramColumnId, ColumnDef<ProgramSearch>> {
  return {
    /**
     * Selection checkbox column
     */
    [PROGRAM_COLUMN_IDS.select]: {
      id: PROGRAM_COLUMN_IDS.select,
      size: 32,
      minSize: 32,
      maxSize: 48,
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: 'fit-content' }}>
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Sélectionner toutes les lignes"
          />
        </div>
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Sélectionner ${row.original.label}`}
        />
      ),
    },

    /**
     * Formation title with establishment
     */
    [PROGRAM_COLUMN_IDS.officialTitle]: {
      id: PROGRAM_COLUMN_IDS.officialTitle,
      accessorKey: 'label',
      size: 400,
      minSize: 300,
      enableHiding: false,
      header: 'Formation',
      cell: ({ row: { original } }) => (
        <div>
          <Link
            to={`/formations/${original.inf}`}
            className="table-link fr-text--sm clamp-1 fr-mb-1v"
            title={original.label}
          >
            {original.label}
          </Link>
          <p
            style={{ width: 'fit-content' }}
            title={original.etablissements
              ?.map((e) => ('paysageElt' in e && e.paysageElt?.name) || e.name)
              .join(', ')}
            className="fr-text--xs fr-text-mention--grey clamp-1 fr-mb-0"
          >
            {original.etablissements
              ?.map((e) => ('paysageElt' in e && e.paysageElt?.name) || e.name)
              .join(', ') || '-'}
          </p>
        </div>
      ),
    },

    /**
     * Relevance score (for search results)
     */
    [PROGRAM_COLUMN_IDS.score]: {
      id: PROGRAM_COLUMN_IDS.score,
      size: 60,
      minSize: 60,
      maxSize: 100,
      enableSorting: false,
      header: '',
      cell: ({ row, table }) => {
        const hasSearchQuery = (table.options.meta as { hasSearchQuery?: boolean })?.hasSearchQuery;
        return (
          <div style={{ visibility: hasSearchQuery ? 'visible' : 'hidden' }}>
            <div aria-describedby={row.original.highlight ? `tooltip-${row.id}` : undefined}>
              <ScoreIndicator score={row.original.score ?? 0} />
            </div>
            {row.original.highlight && (
              <HighlightTooltip highlight={row.original.highlight} rowId={row.id} />
            )}
          </div>
        );
      },
    },

    /**
     * Cycle column (Licence, Master, etc.)
     */
    [PROGRAM_COLUMN_IDS.cycle]: {
      id: PROGRAM_COLUMN_IDS.cycle,
      accessorKey: 'cycle',
      size: 120,
      minSize: 100,
      maxSize: 150,
      header: 'Cycle',
      cell: ({ row }) => (
        <span title={row.original.cycle} className="clamp-1">
          {row.original.cycle || '-'}
        </span>
      ),
    },

    /**
     * Diploma type column
     */
    [PROGRAM_COLUMN_IDS.degreeTypeCode]: {
      id: PROGRAM_COLUMN_IDS.degreeTypeCode,
      accessorKey: 'diploma.type',
      size: 250,
      minSize: 250,
      maxSize: 250,
      header: 'Type de diplôme',
      cell: ({ row }) => (
        <span title={row.original.diploma?.type} className="clamp-1">
          {row.original.diploma?.type || '-'}
        </span>
      ),
    },

    /**
     * SISE info badge
     */
    [PROGRAM_COLUMN_IDS.sise]: {
      id: PROGRAM_COLUMN_IDS.sise,
      accessorKey: 'hasSiseInfos',
      size: 92,
      minSize: 92,
      maxSize: 92,
      enableSorting: false,
      header: 'SISE',
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'start' }}>
          <span
            className={cn('fr-badge fr-badge--sm', {
              'fr-badge--success': row.original.hasSiseInfos,
              'fr-badge--warning': !row.original.hasSiseInfos,
            })}
          >
            {row.original.hasSiseInfos ? 'Oui' : 'Non'}
          </span>
        </div>
      ),
    },

    /**
     * RNCP info badge
     */
    [PROGRAM_COLUMN_IDS.rncp]: {
      id: PROGRAM_COLUMN_IDS.rncp,
      accessorKey: 'hasRncpInfos',
      size: 92,
      minSize: 92,
      maxSize: 92,
      enableSorting: false,
      header: 'RNCP',
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'start' }}>
          <span
            className={cn('fr-badge fr-badge--sm', {
              'fr-badge--success': row.original.hasRncpInfos,
              'fr-badge--warning': !row.original.hasRncpInfos,
            })}
          >
            {row.original.hasRncpInfos ? 'Oui' : 'Non'}
          </span>
        </div>
      ),
    },

    /**
     * ROME info badge
     */
    [PROGRAM_COLUMN_IDS.rome]: {
      id: PROGRAM_COLUMN_IDS.rome,
      accessorKey: 'hasRomeInfos',
      size: 92,
      minSize: 92,
      maxSize: 92,
      enableSorting: false,
      header: 'ROME',
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'start' }}>
          <span
            className={cn('fr-badge fr-badge--sm', {
              'fr-badge--success': row.original.hasRomeInfos,
              'fr-badge--warning': !row.original.hasRomeInfos,
            })}
          >
            {row.original.hasRomeInfos ? 'Oui' : 'Non'}
          </span>
        </div>
      ),
    },
  };
}

/**
 * Helper to create column array from selected column IDs
 *
 * @example
 * const columns = createProgramColumns(['select', 'officialTitle', 'degreeTypeCode', 'sise']);
 */
export function createProgramColumns(columnIds: ProgramColumnId[]): ColumnDef<ProgramSearch>[] {
  const allColumns = getProgramColumns();
  return columnIds.map((id) => allColumns[id]).filter(Boolean);
}

/**
 * Helper to get column labels for visibility toggle
 * Filters out non-toggleable columns
 *
 * @example
 * const labels = getToggleableColumnLabels(['score', 'degreeTypeCode', 'sise']);
 * // Returns { score: 'Score', degreeTypeCode: 'Type de diplôme', sise: 'SISE' }
 */
export function getToggleableColumnLabels(columnIds: ProgramColumnId[]): Record<string, string> {
  const nonToggleable: ProgramColumnId[] = [
    PROGRAM_COLUMN_IDS.select,
    PROGRAM_COLUMN_IDS.officialTitle,
  ];
  return columnIds
    .filter((id) => !nonToggleable.includes(id))
    .reduce(
      (acc, id) => {
        if (PROGRAM_COLUMN_LABELS[id]) {
          acc[id] = PROGRAM_COLUMN_LABELS[id];
        }
        return acc;
      },
      {} as Record<string, string>,
    );
}

/**
 * Helper to create default column visibility state
 *
 * @param availableColumns - All columns available in the table
 * @param defaultVisibleColumns - Columns that should be visible by default
 * @returns VisibilityState object for TanStack Table
 *
 * @example
 * const visibility = createDefaultColumnVisibility(
 *   ['select', 'officialTitle', 'score', 'degreeTypeCode', 'sise', 'rncp', 'rome'],
 *   ['select', 'officialTitle', 'degreeTypeCode', 'sise'] // score, rncp, rome hidden by default
 * );
 */
export function createDefaultColumnVisibility(
  availableColumns: ProgramColumnId[],
  defaultVisibleColumns: ProgramColumnId[],
): Record<string, boolean> {
  return availableColumns.reduce(
    (acc, columnId) => {
      acc[columnId] = defaultVisibleColumns.includes(columnId);
      return acc;
    },
    {} as Record<string, boolean>,
  );
}
