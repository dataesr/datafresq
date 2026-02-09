import cn from 'classnames';
import { useCallback, useState } from 'react';
import { useAddPrograms, usePreviewAddPrograms } from '@/api/workspaces';
import { Dropdown, useDropdownContext } from '@/components/ui/Dropdown';
import { toast } from '@/components/ui/Toast';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { useActiveWorkspace } from '@/contexts/ActiveWorkspaceContext';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { WorkspaceSearchParams } from '~/schemas/workspaces';
import './styles.css';

const WARNING_THRESHOLD = 1000;
const MAX_PROGRAMS = 5000;

interface AddToActiveWorkspaceProps {
  programIds?: string[];
  searchParams?: WorkspaceSearchParams;
  totalCount: number;
  onSuccess?: () => void;
  disabled?: boolean;
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

interface UseAddToWorkspaceOptions {
  programIds?: string[];
  searchParams?: WorkspaceSearchParams;
  onSuccess?: () => void;
}

function useAddToWorkspace({ programIds, searchParams, onSuccess }: UseAddToWorkspaceOptions) {
  const { activeWorkspace } = useActiveWorkspace();
  const { isOpen } = useDropdownContext();
  const addPrograms = useAddPrograms();

  const hasSelection = programIds && programIds.length > 0;
  const [confirmed, setConfirmed] = useState(() => hasSelection);

  const {
    data: preview,
    isPending,
    isError,
  } = usePreviewAddPrograms(
    activeWorkspace?.id ?? '',
    hasSelection ? programIds : undefined,
    hasSelection ? undefined : searchParams,
    isOpen && !!activeWorkspace,
  );

  const canAdd =
    (hasSelection || confirmed) && !isPending && !isError && preview && preview.toAdd > 0;

  const handleAdd = useCallback(() => {
    if (!activeWorkspace || !preview) return;

    const count = preview.toAdd;
    const message = `${count} formation${count === 1 ? '' : 's'} ajoutée${count === 1 ? '' : 's'} avec succès`;

    toast.promise(
      addPrograms.mutateAsync({
        workspaceId: activeWorkspace.id,
        ...(hasSelection ? { programIds } : { searchParams }),
      }),
      {
        loading: { title: 'Ajout en cours...' },
        success: { title: message },
        error: (err) => ({
          title: "Erreur lors de l'ajout",
          description: getErrorMessage(err),
        }),
      },
    );

    onSuccess?.();
  }, [activeWorkspace, preview, hasSelection, programIds, searchParams, addPrograms, onSuccess]);

  return {
    activeWorkspace,
    hasSelection,
    confirmed,
    setConfirmed,
    preview,
    isPending,
    isError,
    canAdd,
    isAdding: addPrograms.isPending,
    handleAdd,
  };
}

function DropdownInner({ programIds, searchParams, onSuccess }: UseAddToWorkspaceOptions) {
  const {
    activeWorkspace,
    hasSelection,
    confirmed,
    setConfirmed,
    preview,
    isPending,
    isError,
    canAdd,
    isAdding,
    handleAdd,
  } = useAddToWorkspace({ programIds, searchParams, onSuccess });

  if (!activeWorkspace) return null;

  return (
    <>
      <Dropdown.Header className="ataw-header">
        <p className="fr-text-mention--grey fr-text--xs fr-mb-0 fx-text--logo">ESPACE ACTIF</p>
        <div className="fx-flex fx-items-center fx-gap-2w">
          <span
            className="ataw-color"
            style={{ backgroundColor: `var(--artwork-minor-${activeWorkspace.color})` }}
            aria-hidden="true"
          />
          <span className="fr-text--bold fx-flex-grow fr-mb-0">
            {truncate(activeWorkspace.name, 20)}
          </span>
          <WorkspaceSelector
            title="Changer d'espace actif"
            label="Changer"
            buttonIcon="fr-icon-arrow-left-right-fill"
          />
        </div>
      </Dropdown.Header>

      <Dropdown.Content className="fr-px-2w fr-py-1w ataw-content fx-flex fx-flex-col fx-justify-center">
        {isPending && (
          <div className="fx-flex fx-items-center fx-gap-2w fr-py-1w">
            <span className="fr-icon-refresh-line fr-icon--spin fr-icon--sm" aria-hidden="true" />
            <i className="fr-mb-0">Calcul en cours...</i>
          </div>
        )}

        {isError && (
          <div className="fx-flex fx-items-center fx-gap-2w fr-py-1w">
            <span className="fr-icon-close-circle-line fr-icon--sm" aria-hidden="true" />
            <i className="fr-mb-0">Une erreur est survenue lors du calcul</i>
          </div>
        )}

        {preview && (
          <>
            <div className="fx-flex fx-gap-2w fx-items-start">
              <span className="fr-icon-bar-chart-box-line" aria-hidden="true" />
              <span className="fr-text--sm fr-mb-0">
                <strong>{preview.total.toLocaleString('fr-FR')}</strong> formation
                {preview.total > 1 ? 's' : ''} {hasSelection ? 'sélectionnée' : 'trouvée'}
                {preview.total > 1 ? 's' : ''}
                <br />
                {!!preview.alreadyPresent && (
                  <>
                    <strong className="fr-label--error">
                      {preview.alreadyPresent.toLocaleString('fr-FR')}
                    </strong>{' '}
                    déjà présente{preview.alreadyPresent > 1 ? 's' : ''} (ignorée
                    {preview.alreadyPresent > 1 ? 's' : ''})
                    <br />
                    <strong className="fr-label--success">
                      {preview.toAdd.toLocaleString('fr-FR')}
                    </strong>{' '}
                    {preview.toAdd > 1 ? 'seront ajoutées' : 'sera ajoutée'}
                  </>
                )}
              </span>
            </div>
            {preview.toAdd > WARNING_THRESHOLD && (
              <div className="ataw-warning-text fr-my-3v">
                <span className="fr-icon-warning-line" aria-hidden="true" />
                <span>Ajout volumineux ({preview.toAdd.toLocaleString('fr-FR')} formations)</span>
              </div>
            )}
          </>
        )}
        {!hasSelection && (
          <div className="fr-checkbox-group fr-checkbox-group--sm fr-my-2w">
            <input
              type="checkbox"
              id="ataw-confirm"
              disabled={!preview}
              checked={confirmed}
              className="fr-checkbox"
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <label htmlFor="ataw-confirm" className="ataw-confirm-label fr-label">
              Je souhaite ajouter tous les résultats de la recherche
            </label>
          </div>
        )}
      </Dropdown.Content>

      <Dropdown.Footer className="fr-p-2w" align="end">
        <button
          type="button"
          className={cn('fr-btn fr-btn--sm')}
          disabled={!canAdd || isAdding}
          onClick={handleAdd}
        >
          Ajouter {preview?.toAdd.toLocaleString('fr-FR') ?? '...'} formation
          {(preview?.toAdd ?? 0) > 1 ? 's' : ''}
        </button>
      </Dropdown.Footer>
    </>
  );
}

export function AddToActiveWorkspace({
  programIds,
  searchParams,
  totalCount,
  onSuccess,
  disabled = false,
}: AddToActiveWorkspaceProps) {
  const { activeWorkspace } = useActiveWorkspace();

  const hasSelection = programIds && programIds.length > 0;
  const exceedsLimit = !hasSelection && totalCount > MAX_PROGRAMS;

  if (!activeWorkspace) {
    return (
      <WorkspaceSelector
        label="Définir un espace actif"
        title="Définir l'espace actif"
        description="Sélectionnez un espace pour y ajouter des formations"
        buttonIcon="fr-icon-arrow-left-right-fill"
        disabled={exceedsLimit}
        outline
      />
    );
  }

  return (
    <Dropdown
      label={`Ajouter à ${truncate(activeWorkspace.name, 20)}`}
      icon="add-line"
      size="sm"
      outline
      disabled={disabled || exceedsLimit}
    >
      <DropdownInner programIds={programIds} searchParams={searchParams} onSuccess={onSuccess} />
    </Dropdown>
  );
}

export default AddToActiveWorkspace;
