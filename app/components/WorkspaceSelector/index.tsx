import cn from 'classnames';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { useSharedWorkspaces, useWorkspaces } from '@/api/workspaces';
import { Modal, useModal } from '@/components/Modal';
import './styles.css';
import { useActiveWorkspace } from '@/contexts/ActiveWorkspaceContext';
import type { ReadWorkspace } from '~/schemas/workspaces';

interface WorkspaceSelectorProps {
  label?: string;
  title?: string;
  description?: string;
  showCreateLink?: boolean;
  buttonIcon: string;
  disabled?: boolean;
  outline?: boolean;
}

export function WorkspaceSelector({
  label,
  title = 'Sélectionner un espace de travail',
  description,
  showCreateLink = true,
  buttonIcon = 'fr-icon-refresh-line',
  disabled = false,
  outline = false,
}: WorkspaceSelectorProps) {
  const { modalProps, modalId, open, close } = useModal();
  const { data: workspaces } = useWorkspaces();
  const { data: sharedWorkspaces } = useSharedWorkspaces();
  const { setActiveWorkspace } = useActiveWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchValue, setSearchValue] = useState('');
  const workspaceButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const allWorkspaces = [...workspaces, ...sharedWorkspaces];

  const filteredWorkspaces = allWorkspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleSelect = (workspace: ReadWorkspace) => {
    setActiveWorkspace(workspace);
    close();
    setSearchValue('');
    setFocusedIndex(-1);
  };

  const handleClose = () => {
    close();
    setSearchValue('');
    setFocusedIndex(-1);
  };

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
        onClick={open}
      >
        {label}
      </button>
      <Modal {...modalProps}>
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div className="fr-modal__body">
            <div className="fr-modal__header fx-shadow-border-bottom">
              <div className="fx-flex fx-justify-between fx-items-start fx-gap-4w">
                <div>
                  <p className="fr-text--lead fr-text--bold fr-mb-0">{title}</p>
                  {description && (
                    <p className="fr-text--sm fr-text-mention--grey fr-mb-0">{description}</p>
                  )}
                </div>
                <div>
                <button
                  type="button"
                  className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-close-line"
                  aria-label="Fermer"
                  onClick={handleClose}
                >
                  Fermer
                </button>
                </div>
              </div>
            </div>

            <div className="fr-modal__content fr-px-0 fr-pb-1w">
              <div className="fr-input-group">
                <div
                  className={cn('fr-input-wrap', {
                    'fr-icon-search-line': !searchValue,
                    'fr-icon-close-line': searchValue,
                  })}
                >
                  <input
                    className="fr-input ws-search-input"
                    type="search"
                    ref={inputRef}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
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
                      className="fr-btn--tertiary-no-outline ws-selector-input-clear-btn"
                    />
                  )}
                </div>
                <div
                  className="ws-selector-listbox"
                  role="listbox"
                  id={`${modalId}-workspace-list`}
                  style={{ height: '16rem', overflowY: 'auto', overflowX: 'hidden' }}
                >
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
                      className="fr-px-2w fr-py-1w ws-selector-workspace-btn"
                      aria-selected={focusedIndex === index}
                      ref={(el) => {
                        workspaceButtonsRef.current[index] = el;
                      }}
                      onClick={() => handleSelect(workspace)}
                    >
                      <div className="fx-flex fx-items-baseline fx-gap-3w">
                        <span
                          className="ws-selector-color"
                          style={{
                            backgroundColor: `var(--artwork-minor-${workspace.color})`,
                          }}
                          aria-hidden="true"
                        />
                        <div className="fx-flex fx-flex-col fx-items-start fx-gap-1w">
                          <p className="fx-clamp-1 fr-text--sm fr-mb-0">{workspace.name}</p>
                          <p className="fx-clamp-1 fr-text-mention--grey fr-text--xs fr-mb-0">
                            {workspace.ownerInfo?.firstName} {workspace.ownerInfo?.lastName}
                            {' — '}
                            {workspace.programs?.length || 0} formation
                            {(workspace.programs?.length || 0) > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="fr-modal__footer fx-justify-between fx-shadow-border-top fr-px-2w fr-py-3v">
              <button
                type="button"
                className="fr-btn fr-btn--tertiary-no-outline"
                onClick={handleClose}
              >
                Annuler
              </button>
              {showCreateLink && (
                <Link
                  to="/espaces/nouveau"
                  className="fr-btn fr-btn--tertiary-no-outline fr-icon-add-line fr-btn--icon-left"
                  onClick={handleClose}
                >
                  Créer un espace
                </Link>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default WorkspaceSelector;
