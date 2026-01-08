import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useAuth } from '@/api/auth';
import type { UserSearchResult } from '@/api/users';
import {
  useAddUsers,
  useDeleteWorkspace,
  useRemoveUsers,
  useUpdateUserRole,
  useUpdateWorkspace,
  useWorkspace,
  useWorkspacePermissions,
} from '@/api/workspaces';
import { Avatar } from '@/components/Avatar';
import { getDisplayName } from '@/components/CollaboratorList';
import ColorPicker from '@/components/ColorPicker';
import { Dropdown } from '@/components/Dropdown';
import { Input } from '@/components/Input';
import { Modal, useModal } from '@/components/Modal';
import UserSearchSelect from '@/components/UserSearchSelect';
import { useToast } from '@/hooks/useToast';
import type { ReadWorkspace } from '~/schemas/workspaces';

const ROLE_OPTIONS = [
  { id: 'viewer' as const, label: 'Lecteur' },
  { id: 'editor' as const, label: 'Éditeur' },
];

function GeneralSettings({ workspace }: { workspace: ReadWorkspace }) {
  const { toast } = useToast();
  const updateWorkspace = useUpdateWorkspace();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  const [color, setColor] = useState(workspace.color);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspace.mutate(
      { id: workspace.id, name, description, color },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            description: 'Informations mises à jour',
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
        <p className="fr-text--lead fr-text--bold fr-mb-1w">Général</p>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Créé le {new Date(workspace.createdAt).toLocaleDateString('fr-FR')}
          <br />
          Mis à jour le {new Date(workspace.updatedAt).toLocaleDateString('fr-FR')}
        </p>
      </div>
      <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
        <form onSubmit={handleSubmit}>
          <Input
            required
            label="Nom"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="fr-input-group">
            <label className="fr-label" htmlFor="workspace-description">
              Description
            </label>
            <textarea
              id="workspace-description"
              className="fr-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <ColorPicker
            label="Couleur"
            hint="Choisissez une couleur pour identifier cet espace"
            value={color}
            onChange={setColor}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="fr-btn fr-btn--sm fr-icon-save-line fr-btn--icon-left"
              disabled={updateWorkspace.isPending}
            >
              {updateWorkspace.isPending ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// USERS SETTINGS SECTION
// =============================================================================

function UserRow({
  user,
  workspaceId,
  isOwner,
}: {
  user: ReadWorkspace['users'][number];
  workspaceId: string;
  isOwner: boolean;
}) {
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

function UsersSettings({ workspace }: { workspace: ReadWorkspace }) {
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

// =============================================================================
// VISIBILITY SETTINGS SECTION
// =============================================================================

function VisibilitySettings({ workspace }: { workspace: ReadWorkspace }) {
  const { toast } = useToast();
  const updateWorkspace = useUpdateWorkspace();

  const handleToggle = (isPublic: boolean) => {
    if (isPublic === workspace.isPublic) return;

    updateWorkspace.mutate(
      { id: workspace.id, isPublic },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            description: `L'espace est maintenant ${isPublic ? 'public' : 'privé'}`,
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
        <p className="fr-text--lead fr-text--bold fr-mb-1w">Visibilité</p>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Définissez qui peut voir cet espace
        </p>
      </div>
      <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
        <fieldset className="fr-fieldset" disabled={updateWorkspace.isPending}>
          <div className="fr-fieldset__content">
            <div className="fr-radio-group">
              <input
                type="radio"
                id="visibility-private"
                name="visibility"
                checked={!workspace.isPublic}
                onChange={() => handleToggle(false)}
              />
              <label className="fr-label" htmlFor="visibility-private">
                Privé
                <span className="fr-hint-text">
                  Seuls vous et les collaborateurs invités peuvent y accéder
                </span>
              </label>
            </div>
            <div className="fr-radio-group">
              <input
                type="radio"
                id="visibility-public"
                name="visibility"
                checked={workspace.isPublic}
                onChange={() => handleToggle(true)}
              />
              <label className="fr-label" htmlFor="visibility-public">
                Public
                <span className="fr-hint-text">Visible par tous les utilisateurs</span>
              </label>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
}

// =============================================================================
// DANGER ZONE SECTION
// =============================================================================

function DangerZone({ workspace }: { workspace: ReadWorkspace }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const deleteWorkspace = useDeleteWorkspace();
  const { modalProps, open, close } = useModal();
  const [confirmName, setConfirmName] = useState('');

  const handleDelete = () => {
    deleteWorkspace.mutate(workspace.id, {
      onSuccess: () => {
        toast({
          type: 'success',
          description: 'Espace de travail supprimé',
        });
        navigate('/espaces');
      },
      onError: (error) => {
        toast({
          type: 'error',
          description: error.message,
        });
      },
    });
  };

  const canDelete = confirmName === workspace.name;

  return (
    <div className="fr-grid-row fr-pb-6w">
      <div className="fr-col-12 fr-col-md-4 fr-px-1w">
        <p
          className="fr-text--lead fr-text--bold fr-mb-1w"
          style={{ color: 'var(--text-default-error)' }}
        >
          Zone de danger
        </p>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Actions irréversibles sur cet espace
        </p>
      </div>
      <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
        <div
          style={{
            padding: '1.5rem',
            border: '1px solid var(--border-default-error)',
            borderRadius: '0.5rem',
          }}
        >
          <p className="fr-text--bold fr-mb-1w">Supprimer cet espace de travail</p>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-2w">
            Une fois supprimé, l'espace de travail et toutes ses données seront définitivement
            perdus. Cette action est irréversible.
          </p>
          <button
            type="button"
            className="fr-btn fr-btn--sm fr-btn--secondary fr-btn--error"
            onClick={open}
          >
            Supprimer l'espace de travail
          </button>
        </div>

        <Modal {...modalProps}>
          <div className="fr-container fr-container--fluid fr-container-md">
            <div className="fr-grid-row fr-grid-row--center">
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-modal__body">
                  <div className="fr-modal__header">
                    <button
                      type="button"
                      className="fr-btn--close fr-btn"
                      title="Fermer"
                      onClick={close}
                    >
                      Fermer
                    </button>
                  </div>
                  <div className="fr-modal__content">
                    <h1 className="fr-modal__title">
                      <span
                        className="fr-icon-warning-line fr-icon--lg"
                        aria-hidden="true"
                        style={{ color: 'var(--text-default-error)' }}
                      />
                      Confirmer la suppression
                    </h1>

                    <div className="fr-callout fr-callout--red-marianne fr-mb-3w">
                      <p className="fr-callout__text">
                        Cette action est irréversible. L'espace de travail et toutes ses données
                        seront définitivement supprimés.
                      </p>
                    </div>

                    <p className="fr-mb-2w">
                      Pour confirmer, tapez le nom de l'espace : <strong>{workspace.name}</strong>
                    </p>

                    <Input
                      label="Nom de l'espace"
                      type="text"
                      value={confirmName}
                      onChange={(e) => setConfirmName(e.target.value)}
                      placeholder={workspace.name}
                    />
                  </div>
                  <div className="fr-modal__footer">
                    <ul className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg">
                      <li>
                        <button type="button" className="fr-btn fr-btn--secondary" onClick={close}>
                          Annuler
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="fr-btn fr-btn--error"
                          disabled={!canDelete || deleteWorkspace.isPending}
                          onClick={handleDelete}
                        >
                          {deleteWorkspace.isPending
                            ? 'Suppression...'
                            : 'Supprimer définitivement'}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Parametres() {
  const { id: workspaceId } = useParams();
  const { data: workspace, isLoading, isError } = useWorkspace(workspaceId!);
  const { isOwner } = useWorkspacePermissions(workspaceId!);

  if (isLoading) {
    return <div className="fr-py-4w">Chargement...</div>;
  }

  if (isError || !workspace) {
    return (
      <div className="fr-py-4w">
        <p className="fr-text--error">Impossible de charger les paramètres de l'espace.</p>
        <Link to="/espaces" className="fr-btn fr-btn--secondary">
          Retour aux espaces
        </Link>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="fr-py-4w">
        <p className="fr-text--error">
          Vous n'avez pas les droits pour modifier les paramètres de cet espace.
        </p>
        <Link to={`/espaces/${workspaceId}`} className="fr-btn fr-btn--secondary">
          Retour à l'espace
        </Link>
      </div>
    );
  }

  return (
    <div className="fr-pb-4w fr-pt-4w">
      <GeneralSettings key={`general-${workspaceId}`} workspace={workspace} />
      <hr />
      <UsersSettings key={`users-${workspaceId}`} workspace={workspace} />
      <hr />
      <VisibilitySettings key={`visibility-${workspaceId}`} workspace={workspace} />
      <hr />
      <DangerZone key={`danger-${workspaceId}`} workspace={workspace} />
    </div>
  );
}
