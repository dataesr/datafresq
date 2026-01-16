import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useWorkspacePrograms } from '@/api/workspaces';
import Dropdown from '@/components/Dropdown';
import { PRIVACY_THRESHOLD } from '@/components/insersup';
import { PageSizeSelector, Pagination } from '@/components/table';
import type { InsersupProgramData, InsersupYearStats } from '~/schemas/aggregations';

interface ProgramsTableProps {
  yearData: InsersupYearStats;
}

type MonthKey = 'm6' | 'm12' | 'm18' | 'm24' | 'm30';

interface MonthData {
  count: number | null;
  rate: number | null;
}

interface ProgramTableRow {
  inf: string;
  label: string;
  typeDiplome: string | null;
  etablissement: string | null;
  nbSortants: number;
  nbPoursuivants: number;
  canShowRates: boolean;
  hasInsersupData: boolean;
  emploiSalFr: Record<MonthKey, MonthData>;
  emploiNonSal: Record<MonthKey, MonthData>;
  emploiStable: Record<MonthKey, MonthData>;
}

interface SortableHeaderProps {
  column: {
    getCanSort: () => boolean;
    getIsSorted: () => false | 'asc' | 'desc';
    toggleSorting: () => void;
  };
  children: React.ReactNode;
}

const MONTHS: MonthKey[] = ['m6', 'm12', 'm18', 'm24', 'm30'];

const MONTH_LABELS: Record<MonthKey, string> = {
  m6: '6 mois',
  m12: '12 mois',
  m18: '18 mois',
  m24: '24 mois',
  m30: '30 mois',
};

function SortableHeader({ column, children }: SortableHeaderProps) {
  if (!column.getCanSort()) {
    return <>{children}</>;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting()}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        font: 'inherit',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
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

function formatValue(data: MonthData): React.ReactNode {
  if (data.count === null) {
    return <span className="fr-text--sm fr-text-mention--grey">-</span>;
  }
  return (
    <span className="fr-text--sm">
      {data.count.toLocaleString('fr-FR')}
      {data.rate !== null && <span className="fr-text-mention--grey"> ({data.rate}%)</span>}
    </span>
  );
}

function getMonthData(
  counts: {
    m6: number | null;
    m12: number | null;
    m18: number | null;
    m24: number | null;
    m30: number | null;
  } | null,
  month: MonthKey,
  nbSortants: number,
  canShowRates: boolean,
): MonthData {
  if (!counts || counts[month] === null) {
    return { count: null, rate: null };
  }

  const count = counts[month];
  let rate: number | null = null;

  if (canShowRates && count !== null && nbSortants > 0) {
    rate = Math.round((count / nbSortants) * 100);
  }

  return { count, rate };
}

function createEmptyMonthRecord(): Record<MonthKey, MonthData> {
  return {
    m6: { count: null, rate: null },
    m12: { count: null, rate: null },
    m18: { count: null, rate: null },
    m24: { count: null, rate: null },
    m30: { count: null, rate: null },
  };
}

interface MonthVisibilityToggleProps {
  visibleMonths: Set<MonthKey>;
  onToggleMonth: (month: MonthKey) => void;
}

function MonthVisibilityToggle({ visibleMonths, onToggleMonth }: MonthVisibilityToggleProps) {
  const visibleCount = visibleMonths.size;

  const buttonLabel = (
    <>
      Périodes
      {visibleCount < MONTHS.length && (
        <span className="fr-badge fr-badge--sm fr-badge--no-icon fr-ml-1w">
          {visibleCount}/{MONTHS.length}
        </span>
      )}
    </>
  );

  return (
    <Dropdown
      label={buttonLabel}
      icon="calendar-line"
      size="sm"
      outline={false}
      title="Gérer les périodes visibles"
    >
      {MONTHS.map((month) => {
        const isVisible = visibleMonths.has(month);

        return (
          <div
            key={month}
            role="menuitemcheckbox"
            aria-checked={isVisible}
            className="fx-dropdown__input"
            tabIndex={0}
            onClick={() => onToggleMonth(month)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleMonth(month);
              }
            }}
          >
            <input
              type="checkbox"
              checked={isVisible}
              onChange={() => onToggleMonth(month)}
              tabIndex={-1}
              aria-hidden="true"
              style={{ pointerEvents: 'none' }}
            />
            <span>{MONTH_LABELS[month]}</span>
          </div>
        );
      })}
    </Dropdown>
  );
}

function useProgramTableData(yearData: InsersupYearStats) {
  const { id: workspaceId = '' } = useParams<{ id: string }>();
  const { data: workspacePrograms = [] } = useWorkspacePrograms(workspaceId);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'nbSortants', desc: true }]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [visibleMonths, setVisibleMonths] = useState<Set<MonthKey>>(new Set(MONTHS));

  // Create a lookup map for insersup data by inf
  const insersupLookup = useMemo(() => {
    const map = new Map<string, InsersupProgramData>();
    if (yearData?.programs) {
      for (const prog of yearData.programs) {
        map.set(prog.inf, prog);
      }
    }
    return map;
  }, [yearData]);

  // Build table data from ALL workspace programs
  const programTableData = useMemo((): ProgramTableRow[] => {
    return workspacePrograms.map((prog) => {
      const insersupData = insersupLookup.get(prog.inf);
      const hasInsersupData = !!insersupData;

      const nbSortants = insersupData?.nbSortants ?? 0;
      const nbPoursuivants = insersupData?.nbPoursuivants ?? 0;
      const canShowRates = nbSortants >= PRIVACY_THRESHOLD;

      const firstEtab = prog.etablissements?.[0];

      // Build employment data for all months
      const emploiSalFr: Record<MonthKey, MonthData> = createEmptyMonthRecord();
      const emploiNonSal: Record<MonthKey, MonthData> = createEmptyMonthRecord();
      const emploiStable: Record<MonthKey, MonthData> = createEmptyMonthRecord();

      if (insersupData) {
        for (const month of MONTHS) {
          emploiSalFr[month] = getMonthData(
            insersupData.emploiSalFr,
            month,
            nbSortants,
            canShowRates,
          );
          emploiNonSal[month] = getMonthData(
            insersupData.emploiNonSal,
            month,
            nbSortants,
            canShowRates,
          );
          emploiStable[month] = getMonthData(
            insersupData.emploiStable,
            month,
            nbSortants,
            canShowRates,
          );
        }
      }

      return {
        inf: prog.inf,
        label: prog.label,
        typeDiplome: prog.diploma?.type ?? null,
        etablissement: firstEtab?.name ?? null,
        nbSortants,
        nbPoursuivants,
        canShowRates,
        hasInsersupData,
        emploiSalFr,
        emploiNonSal,
        emploiStable,
      };
    });
  }, [workspacePrograms, insersupLookup]);

  // Build column visibility state based on visible months
  const columnVisibility = useMemo<VisibilityState>(() => {
    const visibility: VisibilityState = {};
    for (const month of MONTHS) {
      const isVisible = visibleMonths.has(month);
      visibility[`emploiSalFr_${month}`] = isVisible;
      visibility[`emploiNonSal_${month}`] = isVisible;
      visibility[`emploiStable_${month}`] = isVisible;
    }
    return visibility;
  }, [visibleMonths]);

  const columns = useMemo<ColumnDef<ProgramTableRow>[]>(() => {
    const baseColumns: ColumnDef<ProgramTableRow>[] = [
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
        id: 'nbSortants',
        accessorKey: 'nbSortants',
        header: 'Sortants',
        size: 90,
        cell: ({ row }) => {
          if (!row.original.hasInsersupData) {
            return <span className="fr-text--sm fr-text-mention--grey">-</span>;
          }
          return (
            <span className="fr-text--sm">{row.original.nbSortants.toLocaleString('fr-FR')}</span>
          );
        },
      },
      {
        id: 'nbPoursuivants',
        accessorKey: 'nbPoursuivants',
        header: 'Poursuivants',
        size: 100,
        cell: ({ row }) => {
          if (!row.original.hasInsersupData) {
            return <span className="fr-text--sm fr-text-mention--grey">-</span>;
          }
          return (
            <span className="fr-text--sm">
              {row.original.nbPoursuivants.toLocaleString('fr-FR')}
            </span>
          );
        },
      },
    ];

    // Add columns for each month
    for (const month of MONTHS) {
      const monthLabel = MONTH_LABELS[month];

      baseColumns.push(
        {
          id: `emploiSalFr_${month}`,
          accessorFn: (row) => row.emploiSalFr[month].count,
          header: `Sal. ${monthLabel}`,
          size: 110,
          sortUndefined: 'last',
          cell: ({ row }) => {
            if (!row.original.hasInsersupData || !row.original.canShowRates) {
              return <span className="fr-text--sm fr-text-mention--grey">-</span>;
            }
            return formatValue(row.original.emploiSalFr[month]);
          },
        },
        {
          id: `emploiNonSal_${month}`,
          accessorFn: (row) => row.emploiNonSal[month].count,
          header: `Non-sal. ${monthLabel}`,
          size: 120,
          sortUndefined: 'last',
          cell: ({ row }) => {
            if (!row.original.hasInsersupData || !row.original.canShowRates) {
              return <span className="fr-text--sm fr-text-mention--grey">-</span>;
            }
            return formatValue(row.original.emploiNonSal[month]);
          },
        },
        {
          id: `emploiStable_${month}`,
          accessorFn: (row) => row.emploiStable[month].count,
          header: `Stable ${monthLabel}`,
          size: 110,
          sortUndefined: 'last',
          cell: ({ row }) => {
            if (!row.original.hasInsersupData || !row.original.canShowRates) {
              return <span className="fr-text--sm fr-text-mention--grey">-</span>;
            }
            return formatValue(row.original.emploiStable[month]);
          },
        },
      );
    }

    return baseColumns;
  }, []);

  const handleToggleMonth = (month: MonthKey) => {
    setVisibleMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) {
        // Don't allow hiding all months
        if (next.size > 1) {
          next.delete(month);
        }
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const table = useReactTable({
    data: programTableData,
    columns,
    state: {
      sorting,
      columnVisibility,
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
    visibleMonths,
    handleToggleMonth,
  };
}

export function ProgramsTable({ yearData }: ProgramsTableProps) {
  const {
    programTableData,
    table,
    pageSize,
    setPageSize,
    pageIndex,
    setPageIndex,
    visibleMonths,
    handleToggleMonth,
  } = useProgramTableData(yearData);

  if (programTableData.length === 0) {
    return null;
  }

  const currentPage = pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="fr-mt-6w" style={{ contain: 'inline-size', overflow: 'clip' }}>
      <div className="fx-spacer fr-mb-2w">
        <h4 className="fr-h6 fr-mb-0">
          Détail par formation ({programTableData.length} formations)
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <PageSizeSelector
            value={String(pageSize)}
            onChange={(size) => {
              setPageSize(Number(size));
              setPageIndex(0);
            }}
          />
          <MonthVisibilityToggle visibleMonths={visibleMonths} onToggleMonth={handleToggleMonth} />
        </div>
      </div>
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <table style={{ whiteSpace: 'nowrap' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      whiteSpace: header.column.id === 'label' ? 'normal' : 'nowrap',
                      minWidth: header.column.columnDef.minSize,
                      width: header.column.id === 'label' ? '30%' : undefined,
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
                  opacity: row.original.hasInsersupData ? 1 : 0.5,
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
