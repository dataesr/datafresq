import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useWorkspace, useWorkspacePrograms } from '@/api/workspaces';
import { ExportButton, PageSizeSelector, Pagination } from '@/components/table';
import { type ExportColumn, exportToXlsx, toSnakeCase } from '@/utils/export-xlsx';
import type { SiseProgramData, SiseYearStats } from '~/schemas/aggregations';

interface ProgramsTableProps {
  yearData: SiseYearStats;
}

interface ExportRow extends ProgramTableRow {
  workspaceName: string;
  exportDate: string;
}

interface ProgramTableRow {
  inf: string;
  label: string;
  typeDiplome: string | null;
  etablissement: string | null;
  cycle: string | null;
  hasSiseData: boolean;
  totalStudents: number;
  totalFemale: number;
  totalMale: number;
  femalePercent: number | null;
}

interface SortableHeaderProps {
  column: {
    getCanSort: () => boolean;
    getIsSorted: () => false | 'asc' | 'desc';
    toggleSorting: () => void;
  };
  children: React.ReactNode;
}

function SortableHeader({ column, children }: SortableHeaderProps) {
  if (!column.getCanSort()) {
    return <>{children}</>;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting()}
      className="fx-flex fx-items-center fx-gap-1w"
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        font: 'inherit',
        cursor: 'pointer',
      }}
    >
      {children}
      {sorted === 'asc' && <span className="fr-icon-arrow-up-line fr-icon--sm" />}
      {sorted === 'desc' && <span className="fr-icon-arrow-down-line fr-icon--sm" />}
      {!sorted && (
        <span className="fr-icon-arrow-up-down-line fr-icon--sm" style={{ opacity: 0.3 }} />
      )}
    </button>
  );
}

function useProgramTableData(yearData: SiseYearStats) {
  const { id: workspaceId = '' } = useParams<{ id: string }>();
  const { data: workspacePrograms = [] } = useWorkspacePrograms(workspaceId);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'totalStudents', desc: true }]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const siseDataLookup = useMemo(() => {
    const map = new Map<string, SiseProgramData>();
    for (const prog of yearData.programs) {
      map.set(prog.inf, prog);
    }
    return map;
  }, [yearData]);

  const programTableData = useMemo((): ProgramTableRow[] => {
    return workspacePrograms.map((prog) => {
      const firstEtab = prog.etablissements?.[0];
      const siseData = siseDataLookup.get(prog.inf);
      const hasSiseData = !!siseData;

      const totalStudents = siseData?.totalStudents ?? 0;
      const totalFemale = siseData?.totalFemale ?? 0;
      const totalMale = siseData?.totalMale ?? 0;
      const femalePercent =
        hasSiseData && totalStudents > 0 ? Math.round((totalFemale / totalStudents) * 100) : null;

      return {
        inf: prog.inf,
        label: prog.label,
        typeDiplome: prog.diploma?.type ?? null,
        etablissement: firstEtab?.name ?? null,
        cycle: prog.cycle ?? null,
        hasSiseData,
        totalStudents,
        totalFemale,
        totalMale,
        femalePercent,
      };
    });
  }, [workspacePrograms, siseDataLookup]);

  const columns = useMemo<ColumnDef<ProgramTableRow>[]>(() => {
    return [
      {
        id: 'label',
        accessorKey: 'label',
        header: 'Formation',
        size: 400,
        minSize: 300,
        cell: ({ row }) => (
          <div style={{ maxWidth: '400px', whiteSpace: 'normal' }}>
            <Link
              to={`/formations/${row.original.inf}`}
              className="fr-text--sm"
              style={{ wordBreak: 'break-word' }}
            >
              {row.original.label || row.original.inf}
            </Link>
            {row.original.etablissement && (
              <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                {row.original.etablissement}
              </p>
            )}
            {row.original.typeDiplome && (
              <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                {row.original.typeDiplome}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'cycle',
        accessorKey: 'cycle',
        header: 'Cycle',
        size: 80,
        cell: ({ row }) => <span className="fr-text--sm">{row.original.cycle || '-'}</span>,
      },
      {
        id: 'totalStudents',
        accessorKey: 'totalStudents',
        header: 'Effectif',
        size: 100,
        cell: ({ row }) => {
          if (!row.original.hasSiseData) {
            return <span className="fr-text--sm fr-text-mention--grey">-</span>;
          }
          return (
            <span className="fr-text--sm fr-text--bold">
              {row.original.totalStudents.toLocaleString('fr-FR')}
            </span>
          );
        },
      },
      {
        id: 'totalFemale',
        accessorKey: 'totalFemale',
        header: 'Femmes',
        size: 100,
        cell: ({ row }) => {
          if (!row.original.hasSiseData) {
            return <span className="fr-text--sm fr-text-mention--grey">-</span>;
          }
          return (
            <span className="fr-text--sm">
              {row.original.totalFemale.toLocaleString('fr-FR')}
              {row.original.femalePercent !== null && (
                <span className="fr-text-mention--grey"> ({row.original.femalePercent}%)</span>
              )}
            </span>
          );
        },
      },
      {
        id: 'totalMale',
        accessorKey: 'totalMale',
        header: 'Hommes',
        size: 100,
        cell: ({ row }) => {
          if (!row.original.hasSiseData) {
            return <span className="fr-text--sm fr-text-mention--grey">-</span>;
          }
          const malePercent =
            row.original.totalStudents > 0
              ? Math.round((row.original.totalMale / row.original.totalStudents) * 100)
              : null;
          return (
            <span className="fr-text--sm">
              {row.original.totalMale.toLocaleString('fr-FR')}
              {malePercent !== null && (
                <span className="fr-text-mention--grey"> ({malePercent}%)</span>
              )}
            </span>
          );
        },
      },
      {
        id: 'hasSiseData',
        accessorKey: 'hasSiseData',
        header: 'Données',
        size: 100,
        cell: ({ row }) => (
          <span
            className={`fr-badge fr-badge--sm ${
              row.original.hasSiseData ? 'fr-badge--success' : 'fr-badge--grey'
            }`}
          >
            {row.original.hasSiseData ? 'SISE' : 'Non dispo.'}
          </span>
        ),
      },
    ];
  }, []);

  const table = useReactTable({
    data: programTableData,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.inf,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
  });

  return {
    programTableData,
    table,
    pageSize,
    setPageSize,
    pageIndex,
    setPageIndex,
    programsWithSiseCount: siseDataLookup.size,
  };
}

const EXPORT_COLUMNS: ExportColumn<ExportRow>[] = [
  { key: 'workspaceName', header: 'Espace de travail' },
  { key: 'exportDate', header: "Date d'export" },
  { key: 'inf', header: 'Identifiant' },
  { key: 'label', header: 'Formation' },
  { key: 'etablissement', header: 'Établissement' },
  { key: 'typeDiplome', header: 'Type de diplôme' },
  { key: 'cycle', header: 'Cycle' },
  { key: 'hasSiseData', header: 'Données SISE disponibles' },
  { key: 'totalStudents', header: 'Effectif total' },
  { key: 'totalFemale', header: 'Effectif femmes' },
  { key: 'totalMale', header: 'Effectif hommes' },
  {
    key: 'femalePercent',
    header: '% Femmes',
    accessor: (row) => (row.femalePercent !== null ? `${row.femalePercent}%` : ''),
  },
];

export function ProgramsTable({ yearData }: ProgramsTableProps) {
  const { id: workspaceId = '' } = useParams<{ id: string }>();
  const { data: workspace } = useWorkspace(workspaceId);

  const {
    programTableData,
    table,
    pageSize,
    setPageSize,
    pageIndex,
    setPageIndex,
    programsWithSiseCount,
  } = useProgramTableData(yearData);

  const handleExport = useCallback(() => {
    const exportDate = new Date().toISOString().slice(0, 10);
    const sortedData = table.getSortedRowModel().rows.map((row) => row.original);

    const exportData: ExportRow[] = sortedData.map((row) => ({
      ...row,
      workspaceName: workspace.name,
      exportDate,
    }));

    const filename = `${toSnakeCase(workspace.name)}_effectifs_${yearData.year}.xlsx`;

    exportToXlsx({
      data: exportData,
      columns: EXPORT_COLUMNS,
      filename,
      sheetName: `Effectifs ${yearData.year}`,
    });
  }, [table, yearData.year, workspace.name]);

  if (programTableData.length === 0) {
    return null;
  }

  const currentPage = pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="fr-mt-6w" style={{ contain: 'inline-size', overflow: 'clip' }}>
      <div className="fx-spacer fr-mb-2w">
        <h4 className="fr-h6 fr-mb-0">
          Détail par formation ({programsWithSiseCount}/{programTableData.length} avec données SISE
          pour {yearData.year})
        </h4>
        <div className="fx-flex fx-gap-2w fx-items-center">
          <PageSizeSelector
            value={String(pageSize)}
            onChange={(size) => {
              setPageSize(Number(size));
              setPageIndex(0);
            }}
          />
          <ExportButton onExport={handleExport} disabled={programTableData.length === 0} />
        </div>
      </div>
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <table className="fr-table fr-table--bordered" style={{ whiteSpace: 'nowrap' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      whiteSpace: header.column.id === 'label' ? 'normal' : 'nowrap',
                      minWidth: header.column.columnDef.minSize,
                      width: header.column.id === 'label' ? '40%' : undefined,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <SortableHeader column={header.column}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </SortableHeader>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                style={{
                  opacity: row.original.hasSiseData ? 1 : 0.5,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      minWidth: cell.column.columnDef.minSize,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="fr-mt-2w">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={programTableData.length}
          onPageChange={(page) => setPageIndex(page - 1)}
        />
      </div>
    </div>
  );
}
