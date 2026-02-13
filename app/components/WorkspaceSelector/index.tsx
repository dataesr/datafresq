import cn from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEditableWorkspaces } from '@/api/workspaces';
import SearchModal, { useSearchModal } from '@/components/SearchModal';
import { useActiveWorkspace } from '@/contexts/ActiveWorkspaceContext';
import './styles.css';

interface WorkspaceSelectorProps {
  label?: string;
  title?: string;
  buttonIcon: string;
  disabled?: boolean;
  outline?: boolean;
}

export function WorkspaceSelector({
  label,
  title = 'Sélectionner un espace de travail',
  buttonIcon = 'fr-icon-refresh-line',
  disabled = false,
  outline = false,
}: WorkspaceSelectorProps) {
  const { data: allWorkspaces } = useEditableWorkspaces();
  const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();
  const [searchValue, setSearchValue] = useState('');

  const filteredWorkspaces = useMemo(
    () =>
      allWorkspaces.filter((workspace) =>
        workspace.name.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [allWorkspaces, searchValue],
  );

  const handleSelect = useCallback(
    (index: number) => {
      const workspace = filteredWorkspaces[index];
      if (workspace) setActiveWorkspace(workspace);
    },
    [filteredWorkspaces, setActiveWorkspace],
  );

  const search = useSearchModal({
    itemCount: filteredWorkspaces.length,
    onSelect: handleSelect,
    onClose: () => setSearchValue(''),
  });

  useEffect(() => {
    search.resetFocus();
  }, [searchValue, search.resetFocus]);

  const focusedItem = search.focusedIndex >= 0 ? filteredWorkspaces[search.focusedIndex] : undefined;
  const focusedWorkspace = focusedItem ? `workspace-${focusedItem.id}` : undefined;

  return (
    <>
      <button
        type="button"
        className={cn('fr-btn fr-btn--sm', buttonIcon, {
          'fr-btn--icon-left': label,
          'fr-btn--tertiary': outline,
          'fr-btn--tertiary-no-outline': !outline,
        })}
        title={label ? undefined : title}
        aria-label={label ? undefined : title}
        disabled={disabled}
        onClick={search.open}
      >
        {label}
      </button>

      <SearchModal
        modalProps={search.modalProps}
        query={searchValue}
        onQueryChange={setSearchValue}
        inputRef={search.inputRef}
        onInputKeyDown={search.handleInputKeyDown}
        placeholder="Rechercher un espace"
        listboxId="workspace-selector-listbox"
        activedescendant={focusedWorkspace}
        footer={
          <>
            <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
              <SearchModal.Kbd>↑↓</SearchModal.Kbd> naviguer
              {' · '}
              <SearchModal.Kbd>↩</SearchModal.Kbd> sélectionner
              {' · '}
              <SearchModal.Kbd>esc</SearchModal.Kbd> fermer
            </p>
          </>
        }
      >
        {filteredWorkspaces.length === 0 && (
          <SearchModal.Empty>Aucun espace trouvé</SearchModal.Empty>
        )}

        {filteredWorkspaces.map((workspace, index) => (
          <SearchModal.Item
            key={workspace.id}
            id={`workspace-${workspace.id}`}
            focused={search.focusedIndex === index}
            ref={(el) => search.setItemRef(index, el)}
            onClick={() => search.select(index)}
          >
            <div className="fx-flex fx-items-center fx-gap-2w fx-width-100">
              <span
                className="ws-selector-color fx-flex-shrink-0 fx-self-start fr-pt-1v"
                style={{
                  backgroundColor: `var(--artwork-minor-${workspace.color})`,
                }}
                aria-hidden="true"
              />
              <div className="fx-flex fx-flex-col fx-items-start fx-gap-1w fx-flex-grow">
                <p className="fx-clamp-1 fr-text--sm fr-mb-0">{workspace.name}</p>
                <p className="fx-clamp-1 fr-text-mention--grey fr-text--xs fr-mb-0">
                  {workspace.ownerInfo?.firstName} {workspace.ownerInfo?.lastName}
                  {' — '}
                  {workspace.programs?.length || 0} formation
                  {(workspace.programs?.length || 0) > 1 ? 's' : ''}
                </p>
              </div>
              {activeWorkspace?.id === workspace.id && (
                <span
                  className="fr-icon-check-line fr-text-label--blue-france fx-flex-shrink-0"
                  aria-label="Espace actif"
                />
              )}
            </div>
          </SearchModal.Item>
        ))}
      </SearchModal>
    </>
  );
}

export default WorkspaceSelector;
