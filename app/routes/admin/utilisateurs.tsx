import { useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import {
  adminQueryKeys,
  useAdminUsers,
  useChangeUserRole,
  useDeleteUser,
  useRevokeUserSessions,
} from '@/api/admin';
import { useInviteUser } from '@/api/invitations';
import { DebouncedInput } from '@/components/debounced-input';
import { Modal, useModal } from '@/components/Modal';
import {
  ColumnVisibilityToggle,
  createDefaultUserColumnVisibility,
  createUserColumns,
  getToggleableUserColumnLabels,
  PageSizeSelector,
  Pagination,
  USER_COLUMN_IDS,
  type UserColumnId,
} from '@/components/table';
import { Dropdown } from '@/components/ui/Dropdown';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import type { UserAdmin } from '~/schemas/users';

// All columns available in this table
const AVAILABLE_COLUMNS: Exclude<UserColumnId, 'actions'>[] = [
  USER_COLUMN_IDS.email,
  USER_COLUMN_IDS.name,
  USER_COLUMN_IDS.role,
  USER_COLUMN_IDS.isActive,
  USER_COLUMN_IDS.createdAt,
  USER_COLUMN_IDS.lastLogin,
];

// Columns visible by default (user can show others via toggle)
const DEFAULT_VISIBLE_COLUMNS: UserColumnId[] = [
  USER_COLUMN_IDS.email,
  USER_COLUMN_IDS.name,
  USER_COLUMN_IDS.role,
  USER_COLUMN_IDS.isActive,
  USER_COLUMN_IDS.actions,
];

// Columns users can toggle visibility for
const TOGGLEABLE_COLUMNS: UserColumnId[] = [
  USER_COLUMN_IDS.name,
  USER_COLUMN_IDS.role,
  USER_COLUMN_IDS.isActive,
  USER_COLUMN_IDS.createdAt,
  USER_COLUMN_IDS.lastLogin,
];

// Role filter options
const ROLE_FILTER_OPTIONS = ['all', 'admin', 'user'] as const;
const ROLE_FILTER_LABELS: Record<string, string> = {
  all: 'Tous les rôles',
  admin: 'Administrateurs',
  user: 'Utilisateurs',
};

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { users, isLoading } = useAdminUsers();

  // Mutations
  const changeRole = useChangeUserRole();
  const deleteUser = useDeleteUser();
  const revokeSessions = useRevokeUserSessions();
  const inviteUser = useInviteUser({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users });
    },
  });

  // Invite modal
  const {
    modalProps: inviteModalProps,
    open: openInviteModal,
    close: closeInviteModal,
  } = useModal();
  const [inviteEmail, setInviteEmail] = useState('');

  // Table state
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pageSize, setPageSize] = useState(25);
  const [pageIndex, setPageIndex] = useState(0);

  // Filter users by role
  const filteredUsers = useMemo(() => {
    if (roleFilter === 'all') return users;
    return users.filter((user) => user.role === roleFilter);
  }, [users, roleFilter]);

  // Handle role change
  const handleRoleChange = useCallback(
    (userId: string, newRole: 'user' | 'admin') => {
      changeRole.mutate(
        { userId, role: newRole },
        {
          onSuccess: () => {
            toast({
              type: 'success',
              description: 'Rôle modifié avec succès',
            });
          },
          onError: (error) => {
            toast({
              type: 'error',
              description: error.message || 'Erreur lors de la modification du rôle',
            });
          },
        },
      );
    },
    [changeRole, toast],
  );

  // Handle user deletion
  const handleDeleteUser = useCallback(
    (userId: string) => {
      if (!confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) return;

      deleteUser.mutate(userId, {
        onSuccess: () => {
          toast({
            type: 'success',
            description: 'Utilisateur désactivé avec succès',
          });
        },
        onError: (error) => {
          toast({
            type: 'error',
            description: error.message || "Erreur lors de la désactivation de l'utilisateur",
          });
        },
      });
    },
    [deleteUser, toast],
  );

  // Handle session revocation
  const handleRevokeSessions = useCallback(
    (userId: string) => {
      revokeSessions.mutate(userId, {
        onSuccess: (data) => {
          toast({
            type: 'success',
            description: data.message || 'Sessions révoquées avec succès',
          });
        },
        onError: (error) => {
          toast({
            type: 'error',
            description: error.message || 'Erreur lors de la révocation des sessions',
          });
        },
      });
    },
    [revokeSessions, toast],
  );

  // Handle invite
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    inviteUser.mutate(
      { email: inviteEmail.trim().toLowerCase() },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            description: 'Invitation envoyée avec succès',
          });
          setInviteEmail('');
          closeInviteModal();
        },
        onError: (error) => {
          toast({
            type: 'error',
            description: error.message || "Erreur lors de l'envoi de l'invitation",
          });
        },
      },
    );
  };

  // Create columns with actions
  const columns = useMemo<ColumnDef<UserAdmin>[]>(() => {
    const baseColumns = createUserColumns(AVAILABLE_COLUMNS);

    // Add actions column
    const actionsColumn: ColumnDef<UserAdmin> = {
      id: USER_COLUMN_IDS.actions,
      size: 80,
      minSize: 80,
      maxSize: 100,
      enableSorting: false,
      enableHiding: false,
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        const isAdmin = user.role === 'admin';

        return (
          <Dropdown icon="more-fill" size="sm" outline={false} title="Actions" aria-label="Actions">
            <Dropdown.Item
              icon={isAdmin ? 'user-line' : 'admin-line'}
              onClick={() => handleRoleChange(user.id, isAdmin ? 'user' : 'admin')}
              disabled={changeRole.isPending}
            >
              {isAdmin ? 'Rétrograder en utilisateur' : 'Promouvoir admin'}
            </Dropdown.Item>
            <Dropdown.Item
              icon="logout-box-line"
              onClick={() => handleRevokeSessions(user.id)}
              disabled={revokeSessions.isPending}
            >
              Révoquer les sessions
            </Dropdown.Item>
            <Dropdown.Separator />
            <Dropdown.Item
              icon="delete-line"
              destructive
              onClick={() => handleDeleteUser(user.id)}
              disabled={deleteUser.isPending || !user.isActive}
            >
              Désactiver
            </Dropdown.Item>
          </Dropdown>
        );
      },
    };

    return [...baseColumns, actionsColumn];
  }, [
    changeRole.isPending,
    deleteUser.isPending,
    revokeSessions.isPending,
    handleRoleChange,
    handleRevokeSessions,
    handleDeleteUser,
  ]);

  // Get labels for toggleable columns
  const columnLabels = useMemo(() => getToggleableUserColumnLabels(TOGGLEABLE_COLUMNS), []);

  // Define default column visibility
  const defaultColumnVisibility: VisibilityState = useMemo(
    () =>
      createDefaultUserColumnVisibility(
        [...AVAILABLE_COLUMNS, USER_COLUMN_IDS.actions],
        DEFAULT_VISIBLE_COLUMNS,
      ),
    [],
  );

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(defaultColumnVisibility);

  const table = useReactTable({
    columns,
    data: filteredUsers,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
    enableColumnResizing: false,
  });

  const currentPage = pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="fr-py-4w">
      <div
        className="fr-mb-3w"
        style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}
      >
        <button
          type="button"
          className="fr-btn fr-btn--secondary fr-btn--sm fr-icon-mail-add-line fr-btn--icon-left"
          onClick={openInviteModal}
        >
          Inviter
        </button>
        <div style={{ width: '1px', height: '1.5rem', background: 'var(--border-default-grey)' }} />
        <DebouncedInput
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Rechercher..."
          size="sm"
          type="text"
          value={globalFilter}
        />
        <Select
          label={ROLE_FILTER_LABELS[roleFilter] || 'Tous les rôles'}
          size="sm"
          outline={false}
          title="Filtrer par rôle"
        >
          {ROLE_FILTER_OPTIONS.map((role) => (
            <Select.Radio
              key={role}
              value={role}
              name="role-filter"
              checked={roleFilter === role}
              onChange={() => {
                setRoleFilter(role);
                setPageIndex(0);
              }}
            >
              {ROLE_FILTER_LABELS[role]}
            </Select.Radio>
          ))}
        </Select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <PageSizeSelector
            value={String(pageSize)}
            onChange={(size) => setPageSize(Number(size))}
          />
          <ColumnVisibilityToggle table={table} columnLabels={columnLabels} />
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="fr-py-8w" style={{ textAlign: 'center' }}>
          <p className="fr-text-mention--grey">Chargement...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="fr-py-8w" style={{ textAlign: 'center' }}>
          <p className="fr-text-mention--grey">
            {globalFilter || roleFilter !== 'all'
              ? 'Aucun utilisateur trouvé pour ces critères.'
              : 'Aucun utilisateur enregistré.'}
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
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
                          width: header.column.id === 'email' ? 'auto' : header.getSize(),
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
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          width: cell.column.id === 'email' ? 'auto' : cell.column.getSize(),
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

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={filteredUsers.length}
            onPageChange={(page) => setPageIndex(page - 1)}
          />
        </>
      )}

      {/* Invite Modal */}
      <Modal {...inviteModalProps}>
        <div className="fr-container fr-container--fluid fr-container-md">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
              <div className="fr-modal__body">
                <div className="fr-modal__header">
                  <button
                    type="button"
                    className="fr-btn--close fr-btn"
                    title="Fermer"
                    aria-label="Fermer"
                    onClick={closeInviteModal}
                  >
                    Fermer
                  </button>
                </div>
                <div className="fr-modal__content">
                  <h1 id="invite-modal-title" className="fr-modal__title">
                    <span className="fr-icon-mail-add-line fr-mr-1w" aria-hidden="true" />
                    Inviter un utilisateur
                  </h1>
                  <form onSubmit={handleInvite}>
                    <div className="fr-input-group">
                      <label className="fr-label" htmlFor="invite-email">
                        Adresse email
                        <span className="fr-hint-text">
                          L'utilisateur recevra un email d'invitation
                        </span>
                      </label>
                      <input
                        className="fr-input"
                        type="email"
                        id="invite-email"
                        name="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="utilisateur@exemple.fr"
                        required
                      />
                    </div>
                    <div className="fr-btns-group fr-btns-group--right fr-mt-4w">
                      <button
                        type="button"
                        className="fr-btn fr-btn--secondary"
                        onClick={closeInviteModal}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="fr-btn"
                        disabled={inviteUser.isPending || !inviteEmail.trim()}
                      >
                        {inviteUser.isPending ? 'Envoi...' : "Envoyer l'invitation"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
