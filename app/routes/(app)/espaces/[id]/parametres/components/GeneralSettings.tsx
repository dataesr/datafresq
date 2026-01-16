import { useState } from 'react';
import { useUpdateWorkspace } from '@/api/workspaces';
import ColorPicker from '@/components/ColorPicker';
import { Input } from '@/components/Input';
import { useToast } from '@/hooks/useToast';
import type { ReadWorkspace } from '~/schemas/workspaces';

interface GeneralSettingsProps {
  workspace: ReadWorkspace;
}

export function GeneralSettings({ workspace }: GeneralSettingsProps) {
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
