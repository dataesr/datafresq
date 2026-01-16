import { useUpdateWorkspace } from '@/api/workspaces';
import { useToast } from '@/hooks/useToast';
import type { ReadWorkspace } from '~/schemas/workspaces';

interface VisibilitySettingsProps {
  workspace: ReadWorkspace;
}

export function VisibilitySettings({ workspace }: VisibilitySettingsProps) {
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
