import cn from 'classnames';
import { useCallback } from 'react';
import { Link } from 'react-router';
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
  const { activeWorkspace, clearActiveWorkspace } = useActiveWorkspace();
  const { isOpen } = useDropdownContext();
  const addPrograms = useAddPrograms();

  const hasSelection = programIds && programIds.length > 0;

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

  const canAdd = (hasSelection || (preview && preview.toAdd > 0)) && !isPending && !isError;

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
    clearActiveWorkspace,
    hasSelection,
    preview,
    isPending,
    isError,
    canAdd,
    isAdding: addPrograms.isPending,
    handleAdd,
  };
}

function AddToActiveWorkspaceInner({
  programIds,
  searchParams,
  onSuccess,
}: UseAddToWorkspaceOptions) {
  const {
    activeWorkspace,
    clearActiveWorkspace,
    hasSelection,
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
            buttonIcon="fr-icon-arrow-left-right-fill"
          />
          {activeWorkspace && (
            <button
              type="button"
              className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-close-line"
              title="Désélectionner l'espace actif"
              aria-label="Désélectionner l'espace actif"
              onClick={(e) => {
                e.stopPropagation();
                clearActiveWorkspace();
              }}
            />
          )}
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

function buildNouveauUrl(programIds?: string[], searchParams?: WorkspaceSearchParams): string {
  const url = new URL('/espaces/nouveau', window.location.origin);

  const hasSelection = programIds && programIds.length > 0;

  if (hasSelection) {
    url.searchParams.set('formationIds', programIds.join(','));
  } else if (searchParams) {
    url.searchParams.set('searchQuery', JSON.stringify(searchParams));
  }

  url.searchParams.set('returnTo', window.location.pathname + window.location.search);

  return url.pathname + url.search;
}

interface CreateWorkspaceInnerProps {
  programIds?: string[];
  searchParams?: WorkspaceSearchParams;
  totalCount: number;
}

function CreateWorkspaceInner({ programIds, searchParams, totalCount }: CreateWorkspaceInnerProps) {
  const hasSelection = programIds && programIds.length > 0;
  const count = hasSelection ? programIds.length : totalCount;

  const nouveauUrl = buildNouveauUrl(
    hasSelection ? programIds : undefined,
    hasSelection ? undefined : searchParams,
  );

  return (
    <>
      <Dropdown.Header className="ataw-header">
        <p className="fr-text-mention--grey fr-text--xs fr-mb-0 fx-text--logo">NOUVEL ESPACE</p>
        <div className="fx-flex fx-items-center fx-gap-2w">
          <span className="fr-text--sm fx-flex-grow fr-mb-0">
            Créer un espace ou en sélectionner un existant
          </span>
          <WorkspaceSelector
            title="Sélectionner un espace existant"
            label="Espace existant"
            buttonIcon="fr-icon-arrow-left-right-fill"
          />
        </div>
      </Dropdown.Header>

      <Dropdown.Content className="fr-px-2w fr-py-1w ataw-content fx-flex fx-flex-col fx-justify-center">
        <div className="fx-flex fx-gap-2w fx-items-start">
          <span className="fr-icon-bar-chart-box-line" aria-hidden="true" />
          <span className="fr-text--sm fr-mb-0">
            <strong>{count.toLocaleString('fr-FR')}</strong> formation
            {count > 1 ? 's' : ''} {hasSelection ? 'sélectionnée' : 'trouvée'}
            {count > 1 ? 's' : ''}
          </span>
        </div>

        {count > WARNING_THRESHOLD && (
          <div className="ataw-warning-text fr-my-3v">
            <span className="fr-icon-warning-line" aria-hidden="true" />
            <span>Ajout volumineux ({count.toLocaleString('fr-FR')} formations)</span>
          </div>
        )}
      </Dropdown.Content>

      <Dropdown.Footer className="fr-p-2w" align="end">
        <Link
          to={nouveauUrl}
          className="fr-btn fr-btn--sm fr-icon-add-circle-line fr-btn--icon-left"
        >
          Créer un espace
        </Link>
      </Dropdown.Footer>
    </>
  );
}

export function AddToWorkspace({
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
      <Dropdown
        label="Nouvel espace"
        icon="add-line"
        size="sm"
        outline
        closeOnAction={false}
        disabled={disabled || exceedsLimit}
      >
        <CreateWorkspaceInner
          programIds={programIds}
          searchParams={searchParams}
          totalCount={totalCount}
        />
      </Dropdown>
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
      <AddToActiveWorkspaceInner
        programIds={programIds}
        searchParams={searchParams}
        onSuccess={onSuccess}
      />
    </Dropdown>
  );
}

export default AddToWorkspace;
