import type { ColumnDef } from '@tanstack/react-table';
import cn from 'classnames';
import type { UserAdmin } from '~/schemas/users';

export const USER_COLUMN_IDS = {
  email: 'email',
  name: 'name',
  role: 'role',
  isActive: 'isActive',
  createdAt: 'createdAt',
  lastLogin: 'lastLogin',
  actions: 'actions',
} as const;

export type UserColumnId = (typeof USER_COLUMN_IDS)[keyof typeof USER_COLUMN_IDS];

export const USER_COLUMN_LABELS: Record<string, string> = {
  [USER_COLUMN_IDS.email]: 'Email',
  [USER_COLUMN_IDS.name]: 'Nom',
  [USER_COLUMN_IDS.role]: 'Rôle',
  [USER_COLUMN_IDS.isActive]: 'Statut',
  [USER_COLUMN_IDS.createdAt]: 'Créé le',
  [USER_COLUMN_IDS.lastLogin]: 'Dernière connexion',
};

const dtOptions: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

function getUserDisplayName(firstName: string | null, lastName: string | null): string {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return '-';
}

export function getUserColumns(): Record<Exclude<UserColumnId, 'actions'>, ColumnDef<UserAdmin>> {
  return {
    [USER_COLUMN_IDS.email]: {
      id: USER_COLUMN_IDS.email,
      accessorKey: 'email',
      size: 280,
      minSize: 200,
      enableHiding: false,
      header: 'Email',
      cell: ({ row }) => (
        <span className="clamp-1" title={row.original.email}>
          {row.original.email}
        </span>
      ),
    },
    [USER_COLUMN_IDS.name]: {
      id: USER_COLUMN_IDS.name,
      accessorFn: (row) => getUserDisplayName(row.firstName, row.lastName),
      size: 200,
      minSize: 150,
      header: 'Nom',
      cell: ({ row }) => (
        <span className="clamp-1">
          {getUserDisplayName(row.original.firstName, row.original.lastName)}
        </span>
      ),
    },
    [USER_COLUMN_IDS.role]: {
      id: USER_COLUMN_IDS.role,
      accessorKey: 'role',
      size: 100,
      minSize: 80,
      maxSize: 120,
      header: 'Rôle',
      cell: ({ row }) => (
        <span
          className={cn('fr-badge', 'fr-badge--sm', {
            'fr-badge--blue-ecume': row.original.role === 'admin',
            'fr-badge--green-emeraude': row.original.role === 'user',
          })}
        >
          {row.original.role === 'admin' ? 'Admin' : 'Utilisateur'}
        </span>
      ),
    },
    [USER_COLUMN_IDS.isActive]: {
      id: USER_COLUMN_IDS.isActive,
      accessorKey: 'isActive',
      size: 100,
      minSize: 80,
      maxSize: 120,
      header: 'Statut',
      cell: ({ row }) => (
        <span
          className={cn('fr-badge', 'fr-badge--sm', {
            'fr-badge--success': row.original.isActive,
            'fr-badge--error': !row.original.isActive,
          })}
        >
          {row.original.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    [USER_COLUMN_IDS.createdAt]: {
      id: USER_COLUMN_IDS.createdAt,
      accessorKey: 'createdAt',
      size: 150,
      minSize: 120,
      header: 'Créé le',
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR', dtOptions);
      },
    },
    [USER_COLUMN_IDS.lastLogin]: {
      id: USER_COLUMN_IDS.lastLogin,
      accessorKey: 'lastLogin',
      size: 150,
      minSize: 120,
      header: 'Dernière connexion',
      cell: ({ row }) => {
        const date = row.original.lastLogin;
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR', dtOptions);
      },
    },
  };
}

export function createUserColumns(
  columnIds: Exclude<UserColumnId, 'actions'>[],
): ColumnDef<UserAdmin>[] {
  const allColumns = getUserColumns();
  return columnIds.map((id) => allColumns[id]).filter(Boolean);
}

/**
 * Helper to get column labels for visibility toggle.
 * Filters out non-toggleable columns.
 *
 * @example
 * const labels = getToggleableUserColumnLabels(['role', 'isActive', 'createdAt']);
 * // Returns { role: 'Rôle', isActive: 'Statut', createdAt: 'Créé le' }
 */
export function getToggleableUserColumnLabels(columnIds: UserColumnId[]): Record<string, string> {
  const nonToggleable: UserColumnId[] = [USER_COLUMN_IDS.email, USER_COLUMN_IDS.actions];
  return columnIds
    .filter((id) => !nonToggleable.includes(id))
    .reduce(
      (acc, id) => {
        if (USER_COLUMN_LABELS[id]) {
          acc[id] = USER_COLUMN_LABELS[id];
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
 * const visibility = createDefaultUserColumnVisibility(
 *   ['email', 'name', 'role', 'isActive', 'createdAt', 'lastLogin'],
 *   ['email', 'name', 'role', 'isActive'] // createdAt, lastLogin hidden by default
 * );
 */
export function createDefaultUserColumnVisibility(
  availableColumns: UserColumnId[],
  defaultVisibleColumns: UserColumnId[],
): Record<string, boolean> {
  return availableColumns.reduce(
    (acc, columnId) => {
      acc[columnId] = defaultVisibleColumns.includes(columnId);
      return acc;
    },
    {} as Record<string, boolean>,
  );
}
