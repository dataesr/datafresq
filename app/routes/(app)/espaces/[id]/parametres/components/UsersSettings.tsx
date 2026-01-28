import { useAuth } from '@/api/auth';
import type { UserSearchResult } from '@/api/users';
import { useAddUsers, useRemoveUsers, useUpdateUserRole } from '@/api/workspaces';
import { useToast } from '@/hooks/useToast';
import type { ReadWorkspace } from '~/schemas/workspaces';
import { getDisplayName, type UserRole } from '../../../components/constants';
import { UserListItem } from '../../../components/UserListItem';
import UserSearchSelect from '../../../components/UserSearchSelect';

interface UsersSettingsProps {
  workspace: ReadWorkspace;
}

export function UsersSettings({ workspace }: UsersSettingsProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const addUsers = useAddUsers();
  const removeUsers = useRemoveUsers();
  const updateUserRole = useUpdateUserRole();

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

  const handleRemove = (userId: string, displayName: string) => {
    removeUsers.mutate(
      { workspaceId: workspace.id, userIds: [userId] },
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

  const handleRoleChange = (userId: string, newRole: UserRole, displayName: string) => {
    updateUserRole.mutate(
      { workspaceId: workspace.id, userId, role: newRole },
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
        <UserSearchSelect
          label="Ajouter un collaborateur"
          hint="Recherchez par nom ou email"
          placeholder="Rechercher un utilisateur..."
          onSelect={handleUserSelect}
          excludeUserIds={excludeUserIds}
        />

        {workspace.users.length > 0 && (
          <div className="fr-mt-3w">
            <ul className="fx-reset-list fx-separated-list">
              {workspace.users.map((user) => {
                const displayName = user.userInfo
                  ? getDisplayName({
                      firstName: user.userInfo.firstName,
                      lastName: user.userInfo.lastName,
                      email: user.userInfo.email,
                    })
                  : user.userId;

                return (
                  <UserListItem
                    key={user.userId}
                    user={{
                      userId: user.userId,
                      email: user.userInfo?.email || '',
                      firstName: user.userInfo?.firstName,
                      lastName: user.userInfo?.lastName,
                    }}
                    role={user.role}
                    onRoleChange={(role) => handleRoleChange(user.userId, role, displayName)}
                    onRemove={() => handleRemove(user.userId, displayName)}
                    disabled={removeUsers.isPending || updateUserRole.isPending}
                  />
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
