import { useState } from 'react';
import type { UserSearchResult } from '@/api/users';
import { Avatar } from '@/components/Avatar';
import UserSearchSelect from '@/components/UserSearchSelect';
import { Select } from '@/components/ui/Select';

export interface PendingUser {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'viewer' | 'editor';
}

const ROLE_OPTIONS = [
  { id: 'viewer' as const, label: 'Lecteur' },
  { id: 'editor' as const, label: 'Éditeur' },
];

export function getDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}

function PendingUserRow({
  user,
  onRemove,
  onRoleChange,
}: {
  user: PendingUser;
  onRemove: () => void;
  onRoleChange: (role: 'viewer' | 'editor') => void;
}) {
  const displayName = getDisplayName(user);
  const selectedRoleLabel = ROLE_OPTIONS.find((opt) => opt.id === user.role)?.label || 'Lecteur';

  return (
    <li
      className="fr-py-2w"
      style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-default-grey)',
        gap: '.5rem',
      }}
    >
      <Avatar name={displayName} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="fr-mb-0 fr-text--bold"
          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {displayName}
        </p>
        <p
          className="fr-mb-0 fr-text--sm fr-text-mention--grey"
          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {user.email}
        </p>
      </div>
      <Select label={selectedRoleLabel} size="sm" outline>
        {ROLE_OPTIONS.map((option) => (
          <Select.Radio
            key={option.id}
            value={option.id}
            name={`role-${user.userId}`}
            checked={user.role === option.id}
            onChange={() => onRoleChange(option.id)}
          >
            {option.label}
          </Select.Radio>
        ))}
      </Select>
      <button
        type="button"
        className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-line"
        title="Retirer"
        onClick={onRemove}
      >
        Retirer
      </button>
    </li>
  );
}

interface CollaboratorListProps {
  pendingUsers: PendingUser[];
  onAddUser: (user: UserSearchResult) => void;
  onRemoveUser: (userId: string) => void;
  onRoleChange: (userId: string, role: 'viewer' | 'editor') => void;
  excludeUserIds?: string[];
  label?: string;
  hint?: string;
  placeholder?: string;
}

export function CollaboratorList({
  pendingUsers,
  onAddUser,
  onRemoveUser,
  onRoleChange,
  excludeUserIds = [],
  label = 'Ajouter un collaborateur',
  hint = ' - Recherchez par nom ou email',
  placeholder = 'Rechercher un utilisateur...',
}: CollaboratorListProps) {
  const allExcludedIds = [...excludeUserIds, ...pendingUsers.map((u) => u.userId)];

  return (
    <div>
      <UserSearchSelect
        label={label}
        hint={hint}
        placeholder={placeholder}
        onSelect={onAddUser}
        excludeUserIds={allExcludedIds}
      />

      {pendingUsers.length > 0 && (
        <div className="fr-mt-3w">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pendingUsers.map((user) => (
              <PendingUserRow
                key={user.userId}
                user={user}
                onRemove={() => onRemoveUser(user.userId)}
                onRoleChange={(role) => onRoleChange(user.userId, role)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function usePendingUsers(initialUsers: PendingUser[] = []) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(initialUsers);

  const addUser = (user: UserSearchResult) => {
    if (pendingUsers.some((u) => u.userId === user.id)) {
      return;
    }
    setPendingUsers((prev) => [
      ...prev,
      {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'viewer',
      },
    ]);
  };

  const removeUser = (userId: string) => {
    setPendingUsers((prev) => prev.filter((u) => u.userId !== userId));
  };

  const changeRole = (userId: string, role: 'viewer' | 'editor') => {
    setPendingUsers((prev) => prev.map((u) => (u.userId === userId ? { ...u, role } : u)));
  };

  const clear = () => {
    setPendingUsers([]);
  };

  return {
    pendingUsers,
    addUser,
    removeUser,
    changeRole,
    clear,
  };
}

export default CollaboratorList;
