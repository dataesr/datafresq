import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/api/auth';
import { useCreateWorkspace } from '@/api/workspaces';
import { CollaboratorList, usePendingUsers } from '@/components/CollaboratorList';
import ColorPicker from '@/components/ColorPicker';
import { Input } from '@/components/Input';
import { useToast } from '@/hooks/useToast';

export default function NouveauEspacePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const createMutation = useCreateWorkspace();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('yellow-tournesol');
  const [isPublic, setIsPublic] = useState(false);

  const { pendingUsers, addUser, removeUser, changeRole } = usePendingUsers();

  // Exclude current user from search results
  const excludeUserIds = user ? [user.id] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        type: 'error',
        description: "Le nom de l'espace est requis",
      });
      return;
    }

    createMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        isPublic,
        users: pendingUsers.map((u) => ({ userId: u.userId, role: u.role })),
      },
      {
        onSuccess: (data) => {
          toast({
            type: 'success',
            description: `L'espace "${data.name}" a été créé`,
          });
          navigate(`/espaces/${data.id}`);
        },
        onError: (error: Error) => {
          toast({
            type: 'error',
            description: error.message || "Erreur lors de la création de l'espace",
          });
        },
      },
    );
  };

  return (
    <div className="page">
      <nav className="fr-breadcrumb" aria-label="vous êtes ici :">
        <button
          type="button"
          className="fr-breadcrumb__button"
          aria-expanded="false"
          aria-controls="breadcrumb-1"
        >
          Voir le fil d'Ariane
        </button>
        <div className="fr-collapse" id="breadcrumb-1">
          <ol className="fr-breadcrumb__list">
            <li>
              <Link className="fr-breadcrumb__link" to="/">
                Accueil
              </Link>
            </li>
            <li>
              <Link className="fr-breadcrumb__link" to="/espaces">
                Espaces
              </Link>
            </li>
            <li>
              <Link to="#" className="fr-breadcrumb__link" aria-current="page">
                Nouvel espace
              </Link>
            </li>
          </ol>
        </div>
      </nav>

      <h1 className="fr-h2 fr-mb-4w">Créer un espace de travail</h1>

      <form onSubmit={handleSubmit}>
        {/* Général */}
        <div className="fr-grid-row fr-pb-6w">
          <div className="fr-col-12 fr-col-md-4 fr-px-1w">
            <p className="fr-text--lead fr-text--bold fr-mb-1w">Général</p>
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Informations de base de votre espace de travail
            </p>
          </div>
          <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
            <Input
              required
              label="Nom"
              hint="Donnez un nom descriptif à votre espace"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="fr-input-group">
              <label className="fr-label" htmlFor="workspace-description">
                Description
                <span className="fr-hint-text">Optionnel</span>
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
              hint="Pour identifier visuellement cet espace"
              value={color}
              onChange={setColor}
            />
          </div>
        </div>

        <hr />

        {/* Visibilité */}
        <div className="fr-grid-row fr-py-6w">
          <div className="fr-col-12 fr-col-md-4 fr-px-1w">
            <p className="fr-text--lead fr-text--bold fr-mb-1w">Visibilité</p>
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Définissez qui peut voir cet espace
            </p>
          </div>
          <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
            <fieldset className="fr-fieldset">
              <div className="fr-fieldset__content">
                <div className="fr-radio-group">
                  <input
                    type="radio"
                    id="visibility-private"
                    name="visibility"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
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
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
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

        <hr />

        {/* Collaborateurs */}
        <div className="fr-grid-row fr-py-6w">
          <div className="fr-col-12 fr-col-md-4 fr-px-1w">
            <p className="fr-text--lead fr-text--bold fr-mb-1w">Collaborateurs</p>
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Ajoutez des utilisateurs qui pourront accéder à cet espace. Vous pourrez en ajouter
              d'autres plus tard.
            </p>
          </div>
          <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
            <CollaboratorList
              pendingUsers={pendingUsers}
              onAddUser={addUser}
              onRemoveUser={removeUser}
              onRoleChange={changeRole}
              excludeUserIds={excludeUserIds}
            />
          </div>
        </div>

        <hr />

        {/* Actions */}
        <div className="fr-grid-row fr-py-6w">
          <div className="fr-col-12 fr-col-md-4 fr-px-1w" />
          <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Link to="/espaces" className="fr-btn fr-btn--secondary">
                Annuler
              </Link>
              <button
                type="submit"
                className="fr-btn fr-icon-add-circle-line fr-btn--icon-left"
                disabled={createMutation.isPending || !name.trim()}
              >
                {createMutation.isPending ? 'Création...' : "Créer l'espace"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
