import type { Table } from '@tanstack/react-table';
import { Select } from '@/components/ui/Select';

interface ColumnVisibilityToggleProps<TData> {
  table: Table<TData>;
  columnLabels: Record<string, string>;
}

export function ColumnVisibilityToggle<TData>({
  table,
  columnLabels,
}: ColumnVisibilityToggleProps<TData>) {
  const toggleableColumns = table
    .getAllLeafColumns()
    .filter((column) => Object.keys(columnLabels).includes(column.id));

  const visibleCount = toggleableColumns.filter((col) => col.getIsVisible()).length;

  const buttonLabel = (
    <>
      Colonnes
      {visibleCount < toggleableColumns.length && (
        <span className="fr-badge fr-badge--sm fr-badge--no-icon fr-ml-1w">
          {visibleCount}/{toggleableColumns.length}
        </span>
      )}
    </>
  );

  return (
    <Select
      label={buttonLabel}
      icon="table-line"
      size="sm"
      outline={false}
      title="Gérer les colonnes visibles"
      multiple
    >
      {toggleableColumns.map((column) => (
        <Select.Checkbox
          key={column.id}
          value={column.id}
          checked={column.getIsVisible()}
          onChange={(checked) => column.toggleVisibility(checked)}
        >
          {columnLabels[column.id]}
        </Select.Checkbox>
      ))}
    </Select>
  );
}
