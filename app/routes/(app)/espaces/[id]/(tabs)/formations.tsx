import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type RowSelectionState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { Activity, useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  useRemovePrograms,
  useWorkspace,
  useWorkspacePermissions,
  useWorkspacePrograms,
} from '@/api/workspaces';
import {
  ColumnVisibilityToggle,
  createDefaultColumnVisibility,
  createProgramColumns,
  ExportButton,
  getToggleableColumnLabels,
  PageSizeSelector,
  Pagination,
  PROGRAM_COLUMN_IDS,
  type ProgramColumnId,
} from '@/components/table';
import { toast } from '@/components/ui/Toast';
import { type ExportColumn, exportToXlsx, toSnakeCase } from '@/utils/export-xlsx';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { ProgramLight } from '~/schemas/programs';

const AVAILABLE_COLUMNS: ProgramColumnId[] = [
  PROGRAM_COLUMN_IDS.select,
  PROGRAM_COLUMN_IDS.officialTitle,
  PROGRAM_COLUMN_IDS.cycle,
  PROGRAM_COLUMN_IDS.degreeTypeCode,
  PROGRAM_COLUMN_IDS.sise,
  PROGRAM_COLUMN_IDS.rncp,
  PROGRAM_COLUMN_IDS.rome,
];

const DEFAULT_VISIBLE_COLUMNS: ProgramColumnId[] = [
  PROGRAM_COLUMN_IDS.select,
  PROGRAM_COLUMN_IDS.officialTitle,
  PROGRAM_COLUMN_IDS.degreeTypeCode,
  PROGRAM_COLUMN_IDS.sise,
];

const TOGGLEABLE_COLUMNS: ProgramColumnId[] = [
  PROGRAM_COLUMN_IDS.cycle,
  PROGRAM_COLUMN_IDS.degreeTypeCode,
  PROGRAM_COLUMN_IDS.sise,
  PROGRAM_COLUMN_IDS.rncp,
  PROGRAM_COLUMN_IDS.rome,
];

interface ExportRow {
  workspaceName: string;
  exportDate: string;
  inf: string;
  label: string;
  cycle: string;
  diplomaType: string;
  diplomaCode: string;
  diplomaCategory: string;
  accreditationStart: string;
  accreditationEnd: string;
  etablissementUai: string;
  etablissementName: string;
  hasSiseInfos: boolean;
  hasRncpInfos: boolean;
  hasRomeInfos: boolean;
}

const EXPORT_COLUMNS: ExportColumn<ExportRow>[] = [
  { key: 'workspaceName', header: 'Espace de travail' },
  { key: 'exportDate', header: "Date d'export" },
  { key: 'inf', header: 'Identifiant' },
  { key: 'label', header: 'Intitulé' },
  { key: 'cycle', header: 'Cycle' },
  { key: 'diplomaType', header: 'Type de diplôme' },
  { key: 'diplomaCode', header: 'Code diplôme' },
  { key: 'diplomaCategory', header: 'Catégorie diplôme' },
  { key: 'accreditationStart', header: 'Début accréditation' },
  { key: 'accreditationEnd', header: 'Fin accréditation' },
  { key: 'etablissementUai', header: 'UAI établissement' },
  { key: 'etablissementName', header: 'Nom établissement' },
  { key: 'hasSiseInfos', header: 'Données SISE' },
  { key: 'hasRncpInfos', header: 'Données RNCP' },
  { key: 'hasRomeInfos', header: 'Données ROME' },
];

function programToExportRow(
  program: ProgramLight,
  workspaceName: string,
  exportDate: string,
): ExportRow {
  const firstEtab = program.etablissements?.[0];
  return {
    workspaceName,
    exportDate,
    inf: program.inf,
    label: program.label,
    cycle: program.cycle,
    diplomaType: program.diploma?.type ?? '',
    diplomaCode: program.diploma?.code ?? '',
    diplomaCategory: program.diploma?.category ?? '',
    accreditationStart: program.accreditation?.startDate ?? '',
    accreditationEnd: program.accreditation?.endDate ?? '',
    etablissementUai: firstEtab?.uai ?? '',
    etablissementName: firstEtab?.name ?? '',
    hasSiseInfos: program.hasSiseInfos,
    hasRncpInfos: program.hasRncpInfos,
    hasRomeInfos: program.hasRomeInfos,
  };
}

export default function Formations() {
  const { id: workspaceId = '' } = useParams<{ id: string }>();

  const { data: workspace } = useWorkspace(workspaceId);
  const { data: programs = [] } = useWorkspacePrograms(workspaceId);
  const { canEdit } = useWorkspacePermissions(workspaceId);
  const removePrograms = useRemovePrograms();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pageSize, setPageSize] = useState(25);
  const [pageIndex, setPageIndex] = useState(0);

  const selectedPrograms = useMemo(
    () => Object.keys(rowSelection).filter((key) => rowSelection[key]),
    [rowSelection],
  );

  const columns = useMemo(() => {
    const columnsToShow = canEdit
      ? AVAILABLE_COLUMNS
      : AVAILABLE_COLUMNS.filter((id) => id !== PROGRAM_COLUMN_IDS.select);
    return createProgramColumns(columnsToShow);
  }, [canEdit]);

  const columnLabels = useMemo(() => getToggleableColumnLabels(TOGGLEABLE_COLUMNS), []);

  const defaultColumnVisibility: VisibilityState = useMemo(() => {
    const defaultVisibleWithEdit = canEdit
      ? DEFAULT_VISIBLE_COLUMNS
      : DEFAULT_VISIBLE_COLUMNS.filter((id) => id !== PROGRAM_COLUMN_IDS.select);
    return createDefaultColumnVisibility(AVAILABLE_COLUMNS, defaultVisibleWithEdit);
  }, [canEdit]);

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(defaultColumnVisibility);

  const handleRemoveSelected = () => {
    if (selectedPrograms.length === 0) return;

    const message =
      selectedPrograms.length === 1
        ? 'Formation retirée avec succès'
        : `${selectedPrograms.length} formations retirées avec succès`;

    toast.promise(removePrograms.mutateAsync({ workspaceId, programIds: selectedPrograms }), {
      loading: { title: 'Suppression en cours...' },
      success: {
        title: message,
      },
      error: (err) => ({
        title: 'Erreur',
        description: getErrorMessage(err),
      }),
    });
    setRowSelection({});
  };

  const handleExport = useCallback(() => {
    const exportDate = new Date().toISOString().slice(0, 10);
    const exportData = programs.map((program) =>
      programToExportRow(program, workspace.name, exportDate),
    );

    const filename = `${toSnakeCase(workspace.name)}_formations.xlsx`;

    exportToXlsx({
      data: exportData,
      columns: EXPORT_COLUMNS,
      filename,
      sheetName: 'Formations',
    });
  }, [programs, workspace.name]);

  const table = useReactTable({
    columns,
    data: programs,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.inf,
    enableRowSelection: canEdit,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      rowSelection,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
    enableColumnResizing: false,
    defaultColumn: {
      minSize: 50,
      maxSize: 1000,
    },
  });

  if (!programs?.length) {
    return (
      <div className="fr-my-12w">
        <p className="fr-text-mention--grey">
          <i>Cet espace de travail ne contient pas encore de formations.</i>
          <br />
          {canEdit && <i>Rendez-vous dans la section explorer pour ajouter des formations.</i>}
        </p>
        {canEdit && (
          <Link to="/formations" className="fr-btn fr-btn--secondary">
            Explorer les formations
          </Link>
        )}
      </div>
    );
  }

  const currentPage = pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="fr-pb-4w">
      <div className="fx-spacer">
        <div>
          <Activity mode={selectedPrograms.length && canEdit ? 'visible' : 'hidden'}>
            <button
              type="button"
              className="fr-btn fr-btn--sm fr-btn--secondary fr-btn--error fr-icon-delete-line fr-btn--icon-left"
              onClick={handleRemoveSelected}
              disabled={removePrograms.isPending}
            >
              Retirer {selectedPrograms.length > 1 ? `(${selectedPrograms.length})` : ''}
            </button>
          </Activity>
        </div>
        <div className="fx-flex fx-gap-2w fx-items-center">
          <PageSizeSelector
            value={String(pageSize)}
            onChange={(size) => setPageSize(Number(size))}
          />
          <ColumnVisibilityToggle table={table} columnLabels={columnLabels} />
          <ExportButton onExport={handleExport} disabled={programs.length === 0} />
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
        totalCount={programs.length}
        onPageChange={(page) => setPageIndex(page - 1)}
      />
    </div>
  );
}
