import { useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  useAddUsers,
  useDeleteWorkspace,
  useRemoveUsers,
  useUpdateWorkspace,
  useWorkspace,
  useWorkspacePermissions,
} from '@/api/workspaces';
import { Input } from '@/components/Input';
import { Modal, useModal } from '@/components/Modal';
import { useToast } from '@/hooks/useToast';
import type { ReadWorkspace } from '~/schemas/workspaces';

function GeneralSettings({ workspace }: { workspace: ReadWorkspace }) {
  const { toast } = useToast();
  const updateWorkspace = useUpdateWorkspace();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspace.mutate(
      { id: workspace.id, name, description },
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

  const handleRemove = () => {
    removeUsers.mutate(
      { workspaceId, emails: [user.email] },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            description: `${user.email} a été retiré`,
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

  const initials =
    `${user.userInfo?.firstName?.[0] || ''}${user.userInfo?.lastName?.[0] || ''}`.toUpperCase() ||
    user.email?.[0]?.toUpperCase();

  return (
    <li
      className="fr-py-2w"
      style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-default-grey)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'var(--background-action-high-blue-france)',
          color: 'var(--text-inverted-grey)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          marginRight: '1rem',
        }}
      >
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <p className="fr-mb-0 fr-text--bold">
          {user.userInfo?.firstName} {user.userInfo?.lastName}
        </p>
        <p className="fr-mb-0 fr-text--sm fr-text-mention--grey">{user.email}</p>
      </div>
      <span
        className={`fr-badge fr-badge--sm ${user.role === 'editor' ? 'fr-badge--green-emeraude' : 'fr-badge--blue-cumulus'}`}
      >
        {user.role === 'editor' ? 'Éditeur' : 'Lecteur'}
      </span>
      {isOwner && (
        <button
          type="button"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-line fr-ml-2w"
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

function AddUserModal({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const { toast } = useToast();
  const addUsers = useAddUsers();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const emailId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUsers.mutate(
      { workspaceId, users: [{ email, role }] },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            description: `${email} a été ajouté`,
          });
          onClose();
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
    <form onSubmit={handleSubmit}>
      <div className="fr-input-group">
        <label className="fr-label" htmlFor={emailId}>
          Email de l'utilisateur
        </label>
        <input
          id={emailId}
          className="fr-input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="utilisateur@example.com"
        />
      </div>

      <fieldset className="fr-fieldset">
        <legend className="fr-fieldset__legend fr-text--regular">Rôle</legend>
        <div className="fr-fieldset__content">
          <div className="fr-radio-group">
            <input
              type="radio"
              id="role-viewer"
              name="role"
              value="viewer"
              checked={role === 'viewer'}
              onChange={() => setRole('viewer')}
            />
            <label className="fr-label" htmlFor="role-viewer">
              Lecteur
              <span className="fr-hint-text">Peut voir le contenu de l'espace</span>
            </label>
          </div>
          <div className="fr-radio-group">
            <input
              type="radio"
              id="role-editor"
              name="role"
              value="editor"
              checked={role === 'editor'}
              onChange={() => setRole('editor')}
            />
            <label className="fr-label" htmlFor="role-editor">
              Éditeur
              <span className="fr-hint-text">Peut ajouter et retirer des formations</span>
            </label>
          </div>
        </div>
      </fieldset>

      <div className="fr-modal__footer">
        <ul className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg">
          <li>
            <button type="button" className="fr-btn fr-btn--secondary" onClick={onClose}>
              Annuler
            </button>
          </li>
          <li>
            <button
              type="submit"
              className="fr-btn fr-icon-user-add-line fr-btn--icon-left"
              disabled={addUsers.isPending}
            >
              {addUsers.isPending ? 'Ajout...' : 'Ajouter'}
            </button>
          </li>
        </ul>
      </div>
    </form>
  );
}

function UsersSettings({ workspace }: { workspace: ReadWorkspace }) {
  const { modalProps, open, close } = useModal();

  return (
    <div className="fr-grid-row fr-pb-6w">
      <div className="fr-col-12 fr-col-md-4 fr-px-1w">
        <p className="fr-text--lead fr-text--bold fr-mb-1w">Utilisateurs</p>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Les éditeurs peuvent ajouter et retirer des formations. Les lecteurs peuvent uniquement
          consulter le contenu.
        </p>
      </div>
      <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
        {workspace.users.length === 0 ? (
          <p className="fr-text--sm fr-text-mention--grey">Aucun utilisateur ajouté</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {workspace.users.map((user) => (
              <UserRow key={user.email} user={user} workspaceId={workspace.id} isOwner />
            ))}
          </ul>
        )}

        <div className="fr-mt-3w" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="fr-btn fr-btn--sm fr-btn--icon-left fr-icon-user-add-line"
            onClick={open}
          >
            Ajouter un utilisateur
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
                    <h1 className="fr-modal__title">Ajouter un utilisateur</h1>
                    <AddUserModal workspaceId={workspace.id} onClose={close} />
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
// VISIBILITY SETTINGS SECTION
// =============================================================================

function VisibilitySettings({ workspace }: { workspace: ReadWorkspace }) {
  const { toast } = useToast();
  const updateWorkspace = useUpdateWorkspace();

  const handleToggle = () => {
    updateWorkspace.mutate(
      { id: workspace.id, isPublic: !workspace.isPublic },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            description: `L'espace est maintenant ${!workspace.isPublic ? 'public' : 'privé'}`,
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
          Un espace privé n'est visible que par vous et les personnes que vous invitez. Un espace
          public est visible par tous les utilisateurs.
        </p>
      </div>
      <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
        <fieldset
          className="fr-segmented"
          style={{ width: '100%' }}
          disabled={updateWorkspace.isPending}
        >
          <div className="fr-segmented__elements" style={{ width: '100%' }}>
            <div className="fr-segmented__element" style={{ flex: '0 0 50%' }}>
              <input
                type="radio"
                id="visibility-private"
                name="visibility"
                value="private"
                checked={!workspace.isPublic}
                onChange={handleToggle}
              />
              <label
                className={`fr-label ${!workspace.isPublic ? 'fr-icon-check-line' : ''}`}
                htmlFor="visibility-private"
                style={{ padding: '1.5rem', justifyContent: 'center' }}
              >
                <span className="fr-icon-lock-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
                Privé
              </label>
            </div>
            <div className="fr-segmented__element" style={{ flex: '0 0 50%' }}>
              <input
                type="radio"
                id="visibility-public"
                name="visibility"
                value="public"
                checked={workspace.isPublic}
                onChange={handleToggle}
              />
              <label
                className={`fr-label ${workspace.isPublic ? 'fr-icon-check-line' : ''}`}
                htmlFor="visibility-public"
                style={{ padding: '1.5rem', justifyContent: 'center' }}
              >
                <span className="fr-icon-global-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
                Public
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
          Actions irréversibles. Soyez prudent.
        </p>
      </div>
      <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
        <div
          style={{
            padding: '1.5rem',
            border: '1px solid var(--border-default-error)',
            borderRadius: '8px',
          }}
        >
          <p className="fr-text--bold fr-mb-1w">Supprimer cet espace de travail</p>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-2w">
            Cette action est irréversible. Toutes les données associées seront supprimées.
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
  const { id: workspaceId = '' } = useParams<{ id: string }>();

  const { data: workspace } = useWorkspace(workspaceId);
  const { isOwner } = useWorkspacePermissions(workspaceId);

  if (!isOwner) {
    return (
      <div className="fr-py-4w">
        <div className="fr-callout fr-callout--red-marianne">
          <h3 className="fr-callout__title">Accès refusé</h3>
          <p className="fr-callout__text">
            Seul le propriétaire peut modifier les paramètres de cet espace de travail.
          </p>
          <Link to={`/espaces/${workspaceId}`} className="fr-btn fr-btn--secondary">
            Retour à l'espace de travail
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fr-py-4w">
      <GeneralSettings key={`general-settings-${workspaceId}`} workspace={workspace} />
      <hr />
      <UsersSettings key={`users-settings-${workspaceId}`} workspace={workspace} />
      <hr />
      <VisibilitySettings key={`visibility-settings-${workspaceId}`} workspace={workspace} />
      <hr />
      <DangerZone key={`danger-zone-${workspaceId}`} workspace={workspace} />
    </div>
  );
}
