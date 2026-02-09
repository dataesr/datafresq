import { useUpdateWorkspace } from '@/api/workspaces';
import { toast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { ReadWorkspace } from '~/schemas/workspaces';

interface VisibilitySettingsProps {
  workspace: ReadWorkspace;
}

export function VisibilitySettings({ workspace }: VisibilitySettingsProps) {
  const updateWorkspace = useUpdateWorkspace();

  const handleToggle = (isPublic: boolean) => {
    if (isPublic === workspace.isPublic) return;

    const visibilityLabel = isPublic ? 'public' : 'privé';
    toast.promise(updateWorkspace.mutateAsync({ id: workspace.id, isPublic }), {
      loading: { title: 'Modification en cours...' },
      success: { title: `L'espace est maintenant ${visibilityLabel}` },
      error: (err) => ({
        title: 'Erreur',
        description: getErrorMessage(err),
      }),
    });
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
