import { useAuth } from '@/api/auth';
import type { UserSearchResult } from '@/api/users';
import { useAddUsers, useRemoveUsers, useUpdateUserRole } from '@/api/workspaces';
import { Avatar } from '@/components/Avatar';
import { getDisplayName } from '@/components/CollaboratorList';
import { Dropdown } from '@/components/Dropdown';
import UserSearchSelect from '@/components/UserSearchSelect';
import { useToast } from '@/hooks/useToast';
import type { ReadWorkspace } from '~/schemas/workspaces';

const ROLE_OPTIONS = [
  { id: 'viewer' as const, label: 'Lecteur' },
  { id: 'editor' as const, label: 'Éditeur' },
];

interface UserRowProps {
  user: ReadWorkspace['users'][number];
  workspaceId: string;
  isOwner: boolean;
}

function UserRow({ user, workspaceId, isOwner }: UserRowProps) {
  const { toast } = useToast();
  const removeUsers = useRemoveUsers();
  const updateUserRole = useUpdateUserRole();

  const displayName = user.userInfo
    ? getDisplayName({
        firstName: user.userInfo.firstName,
        lastName: user.userInfo.lastName,
        email: user.userInfo.email,
      })
    : user.userId;

  const handleRemove = () => {
    removeUsers.mutate(
      { workspaceId, userIds: [user.userId] },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            description: `${displayName} a été retiré`,
          });
        },
        onError: (error) => {
          toast({
            type: 'error',
            description: error.message,
          });
        },
      },
    );
  };

  const handleRoleChange = (newRole: 'viewer' | 'editor') => {
    if (newRole === user.role) return;

    updateUserRole.mutate(
      { workspaceId, userId: user.userId, role: newRole },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            description: `${displayName} est maintenant ${newRole === 'editor' ? 'éditeur' : 'lecteur'}`,
          });
        },
        onError: (error) => {
          toast({
            type: 'error',
            description: error.message,
          });
        },
      },
    );
  };

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
          {user.userInfo?.email}
        </p>
      </div>
      {isOwner ? (
        <Dropdown label={selectedRoleLabel} size="sm" outline disabled={updateUserRole.isPending}>
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitem"
              className={`fx-dropdown__item ${user.role === option.id ? 'fx-dropdown__item--active' : ''}`}
              onClick={() => handleRoleChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </Dropdown>
      ) : (
        <span
          className={`fr-badge fr-badge--sm ${user.role === 'editor' ? 'fr-badge--green-emeraude' : 'fr-badge--blue-cumulus'}`}
        >
          {user.role === 'editor' ? 'Éditeur' : 'Lecteur'}
        </span>
      )}
      {isOwner && (
        <button
          type="button"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-line"
          title="Retirer cet utilisateur"
          onClick={handleRemove}
          disabled={removeUsers.isPending}
        >
          Retirer
        </button>
      )}
    </li>
  );
}

interface UsersSettingsProps {
  workspace: ReadWorkspace;
}

export function UsersSettings({ workspace }: UsersSettingsProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const addUsers = useAddUsers();

  // Exclude existing users, the owner, and the current user
  const existingUserIds = workspace.users.map((u) => u.userId);
  const excludeUserIds = [
    ...existingUserIds,
    workspace.owner,
    ...(currentUser ? [currentUser.id] : []),
  ];

  const handleUserSelect = (user: UserSearchResult) => {
    addUsers.mutate(
      {
        workspaceId: workspace.id,
        users: [{ userId: user.id, role: 'viewer' }],
      },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            description: `${getDisplayName({ firstName: user.firstName, lastName: user.lastName, email: user.email })} a été ajouté comme lecteur`,
          });
        },
        onError: (error) => {
          toast({
            type: 'error',
            description: error.message,
          });
        },
      },
    );
  };

  return (
    <div className="fr-grid-row fr-pb-6w">
      <div className="fr-col-12 fr-col-md-4 fr-px-1w">
        <p className="fr-text--lead fr-text--bold fr-mb-1w">Collaborateurs</p>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Les éditeurs peuvent ajouter et retirer des formations. Les lecteurs peuvent uniquement
          consulter le contenu.
        </p>
      </div>
      <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
        {/* Add new users section */}
        <UserSearchSelect
          label="Ajouter un collaborateur"
          hint=" - Recherchez par nom ou email"
          placeholder="Rechercher un utilisateur..."
          onSelect={handleUserSelect}
          excludeUserIds={excludeUserIds}
        />

        {/* Existing users */}
        {workspace.users.length > 0 && (
          <div className="fr-mt-3w">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {workspace.users.map((user) => (
                <UserRow key={user.userId} user={user} workspaceId={workspace.id} isOwner />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
