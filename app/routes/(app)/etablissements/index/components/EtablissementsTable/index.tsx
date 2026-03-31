import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import cn from 'classnames';
import { useMemo, useState } from 'react';
import { useEtablissementsSearch } from '@/api/etablissements';
import {
  ColumnVisibilityToggle,
  createDefaultEtablissementColumnVisibility,
  createEtablissementColumns,
  ETABLISSEMENT_COLUMN_IDS,
  type EtablissementColumnId,
  getToggleableEtablissementColumnLabels,
  PageSizeSelector,
  Pagination,
} from '@/components/table';
import { useEtablissementsFilters } from '../../hooks/useEtablissementsFilters';

const AVAILABLE_COLUMNS: EtablissementColumnId[] = [
  ETABLISSEMENT_COLUMN_IDS.name,
  ETABLISSEMENT_COLUMN_IDS.type,
  ETABLISSEMENT_COLUMN_IDS.commune,
  ETABLISSEMENT_COLUMN_IDS.academie,
  ETABLISSEMENT_COLUMN_IDS.region,
  ETABLISSEMENT_COLUMN_IDS.lastYearStudents,
];

const DEFAULT_VISIBLE_COLUMNS: EtablissementColumnId[] = [
  ETABLISSEMENT_COLUMN_IDS.name,
  ETABLISSEMENT_COLUMN_IDS.type,
  ETABLISSEMENT_COLUMN_IDS.academie,
  ETABLISSEMENT_COLUMN_IDS.lastYearStudents,
];

const TOGGLEABLE_COLUMNS: EtablissementColumnId[] = [
  ETABLISSEMENT_COLUMN_IDS.type,
  ETABLISSEMENT_COLUMN_IDS.commune,
  ETABLISSEMENT_COLUMN_IDS.academie,
  ETABLISSEMENT_COLUMN_IDS.region,
  ETABLISSEMENT_COLUMN_IDS.lastYearStudents,
];

export default function EtablissementsTable() {
  const { params, currentFilters, handlePageChange, handlePageSizeChange } =
    useEtablissementsFilters();

  const { etablissements, totalCount, isFetching } = useEtablissementsSearch({
    query: params.q,
    page: params.page,
    pageSize: Number(params.pageSize),
    filters: currentFilters,
    sort: params.sort,
  });

  const columns = useMemo(() => createEtablissementColumns(AVAILABLE_COLUMNS), []);

  const columnLabels = useMemo(
    () => getToggleableEtablissementColumnLabels(TOGGLEABLE_COLUMNS),
    [],
  );

  const defaultColumnVisibility = useMemo(
    () => createDefaultEtablissementColumnVisibility(AVAILABLE_COLUMNS, DEFAULT_VISIBLE_COLUMNS),
    [],
  );

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(defaultColumnVisibility);

  const table = useReactTable({
    columns,
    data: etablissements,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.paysageId,
    manualPagination: true,
    manualSorting: true,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
    meta: {
      isLoading: isFetching,
    },
  });

  const pageSize = Number(params.pageSize);
  const currentPage = params.page;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (etablissements.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="fx-spacer">
        <div />
        <div className="fx-flex fx-gap-2w fx-items-center">
          <PageSizeSelector onChange={handlePageSizeChange} value={pageSize.toString()} />
          <ColumnVisibilityToggle table={table} columnLabels={columnLabels} />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          className={cn('fr-table fr-my-1w', { 'table--loading': isFetching })}
          style={{ width: '100%' }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.column.columnDef.id === 'name' ? 'auto' : header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    <p
                      className="fr-mb-0 fr-text-title--grey"
                      style={{ fontSize: '.875rem', fontWeight: '500' }}
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
              <tr key={row.id} style={{ minHeight: '52px' }}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.id === 'name' ? 'auto' : cell.column.getSize(),
                      minWidth: cell.column.columnDef.minSize,
                      maxWidth: cell.column.columnDef.maxSize,
                    }}
                  >
                    {isFetching ? (
                      cell.column.id === 'name' ? (
                        <span className="skeleton-text skeleton-text--xl" />
                      ) : (
                        <span className="skeleton-text skeleton-text--md" />
                      )
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
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
