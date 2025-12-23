import type { Table } from '@tanstack/react-table';
import { useId } from 'react';
import Dropdown from '@/components/Dropdown';

interface ColumnVisibilityToggleProps<TData> {
  table: Table<TData>;
  columnLabels: Record<string, string>;
}

export function ColumnVisibilityToggle<TData>({
  table,
  columnLabels,
}: ColumnVisibilityToggleProps<TData>) {
  const id = useId();

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

  const handleToggle = (column: (typeof toggleableColumns)[number]) => {
    column.toggleVisibility(!column.getIsVisible());
  };

  return (
    <Dropdown
      label={buttonLabel}
      icon="table-line"
      size="sm"
      outline={false}
      title="Gérer les colonnes visibles"
    >
      {toggleableColumns.map((column, index) => {
        const isVisible = column.getIsVisible();
        const inputId = `${id}-col-${index}`;

        return (
          <div
            key={column.id}
            role="menuitemcheckbox"
            aria-checked={isVisible}
            className="fx-dropdown__input"
            tabIndex={0}
            onClick={() => handleToggle(column)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle(column);
              }
            }}
          >
            <input
              type="checkbox"
              id={inputId}
              checked={isVisible}
              onChange={() => handleToggle(column)}
              tabIndex={-1}
              aria-hidden="true"
            />
            <span>{columnLabels[column.id]}</span>
          </div>
        );
      })}
    </Dropdown>
  );
}
