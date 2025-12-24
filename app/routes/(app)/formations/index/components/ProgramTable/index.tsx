import {
  flexRender,
  getCoreRowModel,
  type RowSelectionState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { Activity, useEffect, useMemo, useState } from 'react';
import { useProgramsSearch } from '@/api/programs';
import AddToWorkspace from '@/components/AddToWorkspace';
import {
  ColumnVisibilityToggle,
  createDefaultColumnVisibility,
  createProgramColumns,
  getToggleableColumnLabels,
  PageSizeSelector,
  Pagination,
  PROGRAM_COLUMN_IDS,
  type ProgramColumnId,
} from '@/components/table';
import { useProgramsFilters } from '../../hooks/useProgramsFilters';

interface ProgramsTableProps {
  selectedPrograms: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

// All columns available in this table
const AVAILABLE_COLUMNS: ProgramColumnId[] = [
  PROGRAM_COLUMN_IDS.select,
  PROGRAM_COLUMN_IDS.officialTitle,
  PROGRAM_COLUMN_IDS.score,
  PROGRAM_COLUMN_IDS.cycle,
  PROGRAM_COLUMN_IDS.degreeTypeCode,
  PROGRAM_COLUMN_IDS.sise,
  PROGRAM_COLUMN_IDS.rncp,
  PROGRAM_COLUMN_IDS.rome,
];

// Columns visible by default (user can show others via toggle)
const DEFAULT_VISIBLE_COLUMNS: ProgramColumnId[] = [
  PROGRAM_COLUMN_IDS.select,
  PROGRAM_COLUMN_IDS.officialTitle,
  PROGRAM_COLUMN_IDS.score,
  PROGRAM_COLUMN_IDS.degreeTypeCode,
  PROGRAM_COLUMN_IDS.sise,
];

// Columns users can toggle visibility for
const TOGGLEABLE_COLUMNS: ProgramColumnId[] = [
  PROGRAM_COLUMN_IDS.score,
  PROGRAM_COLUMN_IDS.cycle,
  PROGRAM_COLUMN_IDS.degreeTypeCode,
  PROGRAM_COLUMN_IDS.sise,
  PROGRAM_COLUMN_IDS.rncp,
  PROGRAM_COLUMN_IDS.rome,
];

export default function ProgramsTable({ selectedPrograms, onSelectionChange }: ProgramsTableProps) {
  const { params, currentFilters, handlePageChange, handlePageSizeChange } = useProgramsFilters();
  const { programs, totalCount } = useProgramsSearch({
    query: params.q,
    page: params.page,
    pageSize: Number(params.pageSize),
    filters: currentFilters,
  });

  const data = programs;

  // Convert selectedPrograms array to rowSelection object
  const rowSelection = useMemo<RowSelectionState>(() => {
    return selectedPrograms.reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {} as RowSelectionState);
  }, [selectedPrograms]);

  const handleRowSelectionChange = (
    updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState),
  ) => {
    const newSelection =
      typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
    const selectedIds = Object.keys(newSelection).filter((key) => newSelection[key]);
    onSelectionChange?.(selectedIds);
  };

  // Get columns from shared definitions
  const columns = useMemo(() => createProgramColumns(AVAILABLE_COLUMNS), []);

  // Get labels for toggleable columns
  const columnLabels = useMemo(() => getToggleableColumnLabels(TOGGLEABLE_COLUMNS), []);

  // Define default column visibility
  const defaultColumnVisibility = useMemo(
    () => createDefaultColumnVisibility(AVAILABLE_COLUMNS, DEFAULT_VISIBLE_COLUMNS),
    [],
  );

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(defaultColumnVisibility);

  // Update score column visibility when data changes (only show if scores exist)
  useEffect(() => {
    const hasScores = data.length > 0 && data[0]?.score !== undefined;
    setColumnVisibility((prev) => ({
      ...prev,
      // Only auto-hide score if no scores exist; don't override user choice to show it
      ...(hasScores ? {} : { [PROGRAM_COLUMN_IDS.score]: false }),
    }));
  }, [data]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.inf,
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: true,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      rowSelection,
      columnVisibility,
    },
    enableColumnResizing: false,
    defaultColumn: {
      minSize: 50,
      maxSize: 1000,
    },
    columnResizeMode: 'onChange',
  });

  // Pagination values
  const pageSize = Number(params.pageSize);
  const currentPage = params.page;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Empty state
  if (data.length === 0) {
    return (
      <div className="fr-py-6w" style={{ textAlign: 'center' }}>
        <p className="fr-text--lg fr-text-mention--grey">Aucun résultat trouvé</p>
      </div>
    );
  }

  return (
    <div>
      <div className="fx-spacer">
        <div>
          <Activity mode={selectedPrograms.length ? 'visible' : 'hidden'}>
            <AddToWorkspace
              formationIds={selectedPrograms}
              onSuccess={() => onSelectionChange([])}
            />
          </Activity>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <PageSizeSelector onChange={handlePageSizeChange} value={pageSize.toString()} />
          <ColumnVisibilityToggle table={table} columnLabels={columnLabels} />
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="fr-table fr-my-1w" style={{ width: '100%' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width:
                        header.column.columnDef.id === 'officialTitle' ? 'auto' : header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    <p
                      className="fr-mb-0 fr-text-title--grey"
                      style={{
                        fontSize: '.875rem',
                        fontWeight: '500',
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </p>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr className={row.getIsSelected() ? 'selected-row' : 'unselected-row'} key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.id === 'officialTitle' ? 'auto' : cell.column.getSize(),
                      minWidth: cell.column.columnDef.minSize,
                      maxWidth: cell.column.columnDef.maxSize,
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
