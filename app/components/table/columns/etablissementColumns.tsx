import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router';
import type { EtablissementSummary } from '~/schemas/etablissements';

export const ETABLISSEMENT_COLUMN_IDS = {
  name: 'name',
  type: 'type',
  commune: 'commune',
  academie: 'academie',
  region: 'region',
  lastYearStudents: 'lastYearStudents',
} as const;

export type EtablissementColumnId =
  (typeof ETABLISSEMENT_COLUMN_IDS)[keyof typeof ETABLISSEMENT_COLUMN_IDS];

export const ETABLISSEMENT_COLUMN_LABELS: Record<EtablissementColumnId, string> = {
  name: 'Nom',
  type: 'Type',
  commune: 'Commune',
  academie: 'Académie',
  region: 'Région',
  lastYearStudents: 'Effectifs',
};

export function getEtablissementColumns(): Record<
  EtablissementColumnId,
  ColumnDef<EtablissementSummary>
> {
  return {
    name: {
      id: ETABLISSEMENT_COLUMN_IDS.name,
      accessorKey: 'name',
      header: 'Nom',
      cell: ({ row }) => (
        <Link
          to={`/etablissements/${row.original.paysageId}`}
          className="table-link fr-text--sm fx-clamp-1"
        >
          {row.original.name}
        </Link>
      ),
      size: 300,
      minSize: 200,
    },

    type: {
      id: ETABLISSEMENT_COLUMN_IDS.type,
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <span className="fr-text--sm">{row.original.type || '—'}</span>,
      size: 180,
      minSize: 120,
    },

    commune: {
      id: ETABLISSEMENT_COLUMN_IDS.commune,
      accessorKey: 'commune',
      header: 'Commune',
      cell: ({ row }) => <span className="fr-text--sm">{row.original.commune || '—'}</span>,
      size: 150,
      minSize: 100,
    },

    academie: {
      id: ETABLISSEMENT_COLUMN_IDS.academie,
      accessorKey: 'academie',
      header: 'Académie',
      cell: ({ row }) => <span className="fr-text--sm">{row.original.academie || '—'}</span>,
      size: 150,
      minSize: 100,
    },

    region: {
      id: ETABLISSEMENT_COLUMN_IDS.region,
      accessorKey: 'region',
      header: 'Région',
      cell: ({ row }) => <span className="fr-text--sm">{row.original.region || '—'}</span>,
      size: 180,
      minSize: 120,
    },

    lastYearStudents: {
      id: ETABLISSEMENT_COLUMN_IDS.lastYearStudents,
      accessorKey: 'lastYearStudents',
      header: 'Effectifs',
      cell: ({ row }) => (
        <div>
          <span className="fr-text--bold">
            {row.original.lastYearStudents.toLocaleString('fr-FR')}
          </span>
          {row.original.lastYear && (
            <span className="fr-text--xs fr-text-mention--grey fr-ml-1v">
              ({row.original.lastYear})
            </span>
          )}
        </div>
      ),
      size: 140,
      minSize: 100,
    },
  };
}

export function createEtablissementColumns(
  columnIds: EtablissementColumnId[],
): ColumnDef<EtablissementSummary>[] {
  const allColumns = getEtablissementColumns();
  return columnIds.map((id) => allColumns[id]);
}

export function createDefaultEtablissementColumnVisibility(
  available: EtablissementColumnId[],
  visible: EtablissementColumnId[],
) {
  const visibility: Record<string, boolean> = {};
  for (const id of available) {
    visibility[id] = visible.includes(id);
  }
  return visibility;
}

export function getToggleableEtablissementColumnLabels(
  toggleable: EtablissementColumnId[],
): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const id of toggleable) {
    labels[id] = ETABLISSEMENT_COLUMN_LABELS[id];
  }
  return labels;
}
