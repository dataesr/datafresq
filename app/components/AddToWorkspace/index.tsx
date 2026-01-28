import cn from 'classnames';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { useAddPrograms, useWorkspaces } from '@/api/workspaces';
import { Modal, useModal } from '@/components/Modal';
import './styles.css';
import { useToast } from '@/hooks/useToast';

interface AddToWorkspaceProps {
  formationIds: string[];
  disabled?: boolean;
  onSuccess?: () => void;
}

export default function AddToWorkspace({
  formationIds,
  disabled = false,
  onSuccess,
}: AddToWorkspaceProps) {
  const { toast } = useToast();
  const { modalProps, modalId, open, close } = useModal();
  const { data: workspaces } = useWorkspaces();
  const addPrograms = useAddPrograms();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchValue, setSearchValue] = useState('');
  const workspaceButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredWorkspaces = workspaces?.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredWorkspaces || filteredWorkspaces.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev === filteredWorkspaces.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev === 0 ? filteredWorkspaces.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      workspaceButtonsRef.current[focusedIndex]?.click();
    } else {
      setFocusedIndex(-1);
    }
  };

  const handleAddToWorkspace = (workspaceId: string) => {
    addPrograms.mutate(
      {
        workspaceId,
        programIds: formationIds,
      },
      {
        onSuccess: () => {
          close();
          const message =
            formationIds.length === 1
              ? 'Formation ajoutée avec succès'
              : `${formationIds.length} formations ajoutées avec succès`;
          toast({
            type: 'success',
            description: message,
          });
          onSuccess?.();
        },
        onError: (error) => {
          toast({
            type: 'error',
            description: error.message || "Erreur lors de l'ajout des formations",
          });
        },
      },
    );
  };

  return (
    <>
      <button
        disabled={disabled || formationIds.length === 0}
        type="button"
        className="fr-btn fr-btn--secondary fr-btn--success fr-btn--sm fr-icon-add-line fr-btn--icon-left"
        onClick={open}
      >
        Ajouter à un espace
        {formationIds.length > 1 && ` (${formationIds.length})`}
      </button>

      <Modal {...modalProps} className="atw-modal">
        <div className="awt-wrapper">
          <div className="fr-input-group fr-mb-0 fr-p-1v awt-input-group">
            <div
              className={cn('fr-input-wrap', {
                'fr-icon-search-line': !searchValue,
                'fr-icon-close-line': searchValue,
              })}
            >
              <input
                className="fr-input awt-input"
                ref={inputRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Rechercher un espace"
                aria-autocomplete="list"
                aria-controls={`${modalId}-workspace-list`}
                aria-activedescendant={
                  focusedIndex >= 0 && filteredWorkspaces?.[focusedIndex]
                    ? `workspace-${filteredWorkspaces[focusedIndex].id}`
                    : undefined
                }
              />

              {!!searchValue && (
                <button
                  type="button"
                  aria-label="Réinitialiser"
                  onClick={() => {
                    setSearchValue('');
                    inputRef.current?.focus();
                  }}
                  className="awt-input-clear-btn"
                />
              )}
            </div>
          </div>
          <div className="awt-listbox" role="listbox" id={`${modalId}-workspace-list`}>
            {filteredWorkspaces?.length === 0 && (
              <div className="fr-p-4w fx-flex fx-items-start fx-flex-col">
                <i>Aucun espace trouvé</i>
              </div>
            )}
            {filteredWorkspaces?.map((workspace, index) => (
              <button
                key={workspace.id}
                role="option"
                type="button"
                id={`workspace-${workspace.id}`}
                className="fr-px-2w fr-py-1w awt-workspace-btn"
                aria-selected={focusedIndex === index}
                tabIndex={-1}
                ref={(el) => {
                  workspaceButtonsRef.current[index] = el;
                }}
                onClick={() => handleAddToWorkspace(workspace.id)}
                disabled={addPrograms.isPending}
              >
                <div className="fx-clamp-1 fr-text--sm fr-mb-0">{workspace.name}</div>
                <div className="fx-clamp-1 fr-text-mention--grey fr-text--xs fr-mb-0">
                  par {workspace.ownerInfo?.firstName} {workspace.ownerInfo?.lastName}
                  {' -- '}
                  {workspace.programs?.length || 0}
                  {' formation'}
                </div>
              </button>
            ))}
          </div>
          <div className="fr-py-3v fr-px-2w fx-flex fx-items-center fx-justify-between fx-shadow-border-top">
            <button
              type="button"
              className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
              onClick={close}
            >
              Annuler
            </button>
            <Link
              to={`/espaces/nouveau?formationIds=${formationIds.join(',')}`}
              className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--icon-left"
            >
              Créer un espace
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
