import { useState } from 'react';
import type { UserSearchResult } from '@/api/users';
import type { UserRole } from './constants';
import { UserListItem } from './UserListItem';
import UserSearchSelect from './UserSearchSelect';

export interface PendingUser {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

interface PendingUserManagerProps {
  pendingUsers: PendingUser[];
  onAddUser: (user: UserSearchResult) => void;
  onRemoveUser: (userId: string) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
  excludeUserIds?: string[];
}

export function PendingUserManager({
  pendingUsers,
  onAddUser,
  onRemoveUser,
  onRoleChange,
  excludeUserIds = [],
}: PendingUserManagerProps) {
  const allExcludedIds = [...excludeUserIds, ...pendingUsers.map((u) => u.userId)];

  return (
    <div>
      <UserSearchSelect
        label="Ajouter un collaborateur"
        hint="Recherchez par nom ou email"
        placeholder="Rechercher un utilisateur..."
        onSelect={onAddUser}
        excludeUserIds={allExcludedIds}
      />

      {pendingUsers.length > 0 && (
        <div className="fr-mt-3w">
          <ul className="fx-reset-list fx-separated-list">
            {pendingUsers.map((user) => (
              <UserListItem
                key={user.userId}
                user={user}
                role={user.role}
                onRoleChange={(role) => onRoleChange(user.userId, role)}
                onRemove={() => onRemoveUser(user.userId)}
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

  const changeRole = (userId: string, role: UserRole) => {
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
