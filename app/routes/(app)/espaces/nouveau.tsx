import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/api/auth';
import { useCreateWorkspace } from '@/api/workspaces';
import { Breadcrumb } from '@/components/Breadcrumb';
import ColorPicker from '@/components/ColorPicker';
import { Input } from '@/components/Input';
import { toast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { WorkspaceSearchParams } from '~/schemas/workspaces';
import { PendingUserManager, usePendingUsers } from './components/PendingUserManager';

function parseSearchQuery(raw: string | null): WorkspaceSearchParams | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WorkspaceSearchParams;
  } catch {
    return null;
  }
}

export default function NouveauEspacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createMutation = useCreateWorkspace();
  const [urlSearchParams] = useSearchParams();

  const formationIdsParam = urlSearchParams.get('formationIds');
  const formationIds = formationIdsParam ? formationIdsParam.split(',').filter(Boolean) : [];

  const searchQuery = parseSearchQuery(urlSearchParams.get('searchQuery'));
  const returnTo = urlSearchParams.get('returnTo');
  const hasSearchContext = formationIds.length > 0 || !!searchQuery;
  const cancelHref = returnTo || '/espaces';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('yellow-tournesol');
  const [isPublic, setIsPublic] = useState(false);

  const { pendingUsers, addUser, removeUser, changeRole } = usePendingUsers();

  const excludeUserIds = user ? [user.id] : [];

  const isPending = createMutation.isPending;
  const postActionRef = useRef<'view' | 'return'>('view');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error({ title: "Le nom de l'espace est requis" });
      return;
    }

    const action = postActionRef.current;

    const navigateAfter = (id: string) => {
      if (action === 'return' && returnTo) {
        navigate(returnTo);
      } else {
        navigate(`/espaces/${id}`);
      }
    };

    toast.promise(
      createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        isPublic,
        users: pendingUsers.map((u) => ({ userId: u.userId, role: u.role })),
        programs: formationIds.length > 0 ? formationIds : undefined,
        searchParams: searchQuery ?? undefined,
      }),
      {
        loading: { title: "Création de l'espace..." },
        success: (data) => {
          const count = data.programs.length;
          const successMessage =
            count > 0
              ? `L'espace "${data.name}" a été créé avec ${count} formation${count > 1 ? 's' : ''}`
              : `L'espace "${data.name}" a été créé`;
          navigateAfter(data.id);
          return { title: successMessage };
        },
        error: (err) => ({
          title: 'Erreur lors de la création',
          description: getErrorMessage(err),
        }),
      },
    );
  };

  return (
    <div className="fx-content-container">
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Espaces', href: '/espaces' },
          { label: 'Nouvel espace', current: true },
        ]}
      />

      <h1 className="fr-h2">Créer un espace de travail</h1>
      <hr className="fr-mt-6w fr-pb-6w" />

      {formationIds.length > 0 && (
        <div className="fr-alert fr-alert--info fr-mb-3w">
          <p className="fr-alert__title">
            {formationIds.length} formation{formationIds.length > 1 ? 's' : ''} sera
            {formationIds.length > 1 ? 'ont' : ''} ajoutée{formationIds.length > 1 ? 's' : ''} à cet
            espace
          </p>
        </div>
      )}

      {searchQuery && (
        <div className="fr-alert fr-alert--info fr-mb-3w">
          <p className="fr-alert__title">
            Les formations correspondant à votre recherche seront ajoutées à cet espace
          </p>
          {searchQuery.q && (
            <p>
              Recherche : <strong>« {searchQuery.q} »</strong>
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <p className="fr-text--lead fr-text--bold fr-mb-1w">Général</p>
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Informations de base de votre espace de travail
            </p>
          </div>
          <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2">
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

        <hr className="fr-mt-6w fr-pb-6w" />

        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <p className="fr-text--lead fr-text--bold fr-mb-1w">Visibilité</p>
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Définissez qui peut voir cet espace
            </p>
          </div>
          <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2">
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

        <hr className="fr-mt-6w fr-pb-6w" />

        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <p className="fr-text--lead fr-text--bold fr-mb-1w">Collaborateurs</p>
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Ajoutez des utilisateurs qui pourront accéder à cet espace. Vous pourrez en ajouter
              d'autres plus tard.
            </p>
          </div>
          <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2">
            <PendingUserManager
              pendingUsers={pendingUsers}
              onAddUser={addUser}
              onRemoveUser={removeUser}
              onRoleChange={changeRole}
              excludeUserIds={excludeUserIds}
            />
          </div>
        </div>

        <hr className="fr-mt-6w fr-pb-6w" />

        <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--right">
          <div className="fr-col-12">
            <div className="fx-flex fx-gap-4w fx-justify-end">
              <Link to={cancelHref} className="fr-btn fr-btn--secondary">
                Annuler
              </Link>
              {hasSearchContext && returnTo ? (
                <>
                  <button
                    type="submit"
                    className="fr-btn fr-btn--tertiary fr-icon-arrow-go-back-line fr-btn--icon-left"
                    disabled={isPending || !name.trim()}
                    onClick={() => {
                      postActionRef.current = 'return';
                    }}
                  >
                    {isPending ? 'Création...' : 'Créer et revenir à la recherche'}
                  </button>
                  <button
                    type="submit"
                    className="fr-btn fr-icon-add-circle-line fr-btn--icon-left"
                    disabled={isPending || !name.trim()}
                    onClick={() => {
                      postActionRef.current = 'view';
                    }}
                  >
                    {isPending ? 'Création...' : "Créer et voir l'espace"}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="fr-btn fr-icon-add-circle-line fr-btn--icon-left"
                  disabled={isPending || !name.trim()}
                  onClick={() => {
                    postActionRef.current = 'view';
                  }}
                >
                  {isPending ? 'Création...' : "Créer l'espace"}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
