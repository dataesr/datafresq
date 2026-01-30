import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { type FilterState } from '@/api/programs';
import { useCreateWorkspaceFromSearch } from '@/api/workspaces';
import { Modal, useModal } from '@/components/Modal';
import { toast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/utils/getErrorMessage';

const WARNING_THRESHOLD = 1000;
const MAX_PROGRAMS = 5000;

interface CreateWorkspaceFromSearchModalProps {
  searchQuery: string;
  filters: FilterState;
  totalCount: number;
  disabled?: boolean;
}

function filtersToSearchParams(query: string, filters: FilterState) {
  return {
    q: query || undefined,
    cycle: filters.cycle.length > 0 ? filters.cycle : undefined,
    diplomaType: filters.diplomaType.length > 0 ? filters.diplomaType : undefined,
    diplomaCategory: filters.diplomaCategory.length > 0 ? filters.diplomaCategory : undefined,
    academy: filters.academy.length > 0 ? filters.academy : undefined,
    region: filters.region.length > 0 ? filters.region : undefined,
    paysageId: filters.paysageId.length > 0 ? filters.paysageId : undefined,
    sector: filters.sector.length > 0 ? filters.sector : undefined,
    disciplinarySector:
      filters.disciplinarySector.length > 0 ? filters.disciplinarySector : undefined,
    domain: filters.domain.length > 0 ? filters.domain : undefined,
    hasSiseInfos: filters.hasSiseInfos || undefined,
    hasRncpInfos: filters.hasRncpInfos || undefined,
    hasRomeInfos: filters.hasRomeInfos || undefined,
  };
}

export function CreateWorkspaceFromSearchModal({
  searchQuery,
  filters,
  totalCount,
  disabled = false,
}: CreateWorkspaceFromSearchModalProps) {
  const navigate = useNavigate();
  const { modalProps, open, close } = useModal();
  const createWorkspace = useCreateWorkspaceFromSearch();

  const [name, setName] = useState('');

  const hasQuery = searchQuery.trim().length > 0;
  const hasFilters = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== null && v !== ''
  );
  const canCreate = hasQuery || hasFilters;
  const exceedsLimit = totalCount > MAX_PROGRAMS;
  const showWarning = totalCount > WARNING_THRESHOLD && !exceedsLimit;

  const handleOpen = useCallback(() => {
    setName('');
    open();
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim() || exceedsLimit) return;

      const searchParams = filtersToSearchParams(searchQuery, filters);

      toast.promise(
        createWorkspace.mutateAsync({
          name: name.trim(),
          searchParams,
        }),
        {
          loading: { title: 'Création en cours...' },
          success: (result) => {
            close();
            navigate(`/espaces/${result.id}/formations`);
            return {
              title: 'Espace de travail créé',
              description: `${result.programCount.toLocaleString('fr-FR')} formations ajoutées`,
            };
          },
          error: (err) => ({
            title: 'Erreur',
            description: getErrorMessage(err),
          }),
        }
      );
    },
    [name, searchQuery, filters, exceedsLimit, createWorkspace, close, navigate]
  );

  return (
    <>
      <button
        type="button"
        className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-btn--icon-left fr-icon-folder-add-line"
        onClick={handleOpen}
        disabled={disabled || !canCreate || totalCount === 0}
        title={
          !canCreate
            ? 'Effectuez une recherche ou appliquez des filtres pour créer un espace'
            : undefined
        }
      >
        Créer un espace
      </button>

      <Modal {...modalProps} aria-labelledby="create-workspace-modal-title">
        <div className="fr-container fr-container--fluid fr-container-md">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
              <div className="fr-modal__body">
                <div className="fr-modal__header">
                  <button
                    type="button"
                    className="fr-btn--close fr-btn"
                    title="Fermer"
                    aria-label="Fermer"
                    onClick={close}
                  >
                    Fermer
                  </button>
                </div>
                <div className="fr-modal__content">
                  <h1 id="create-workspace-modal-title" className="fr-modal__title">
                    <span
                      className="fr-icon-folder-add-line fr-icon--lg fr-mr-1w"
                      aria-hidden="true"
                    />
                    Créer un espace de travail
                  </h1>

                  {exceedsLimit ? (
                    <div className="fr-alert fr-alert--error fr-mb-3w">
                      <p className="fr-alert__title">Trop de formations</p>
                      <p>
                        Cette recherche contient{' '}
                        <strong>{totalCount.toLocaleString('fr-FR')}</strong> formations, ce qui
                        dépasse la limite de {MAX_PROGRAMS.toLocaleString('fr-FR')}.
                      </p>
                      <p className="fr-mb-0">
                        Veuillez affiner votre recherche avec des filtres supplémentaires.
                      </p>
                    </div>
                  ) : (
                    <>
                      {showWarning && (
                        <div className="fr-alert fr-alert--warning fr-mb-3w">
                          <p className="fr-alert__title">Espace volumineux</p>
                          <p className="fr-mb-0">
                            Cette recherche contient{' '}
                            <strong>{totalCount.toLocaleString('fr-FR')}</strong> formations. La
                            création peut prendre quelques instants.
                          </p>
                        </div>
                      )}

                      <div className="fr-callout fr-callout--blue-ecume fr-mb-3w">
                        <p className="fr-callout__text">
                          <strong>{totalCount.toLocaleString('fr-FR')}</strong> formations seront
                          ajoutées à ce nouvel espace de travail.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <div className="fr-input-group">
                          <label className="fr-label" htmlFor="workspace-name">
                            Nom de l'espace de travail
                            <span className="fr-hint-text">Obligatoire</span>
                          </label>
                          <input
                            className="fr-input"
                            type="text"
                            id="workspace-name"
                            name="workspace-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Mon espace de travail"
                            required
                            autoFocus
                          />
                        </div>
                      </form>
                    </>
                  )}
                </div>
                <div className="fr-modal__footer">
                  <ul className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg">
                    <li>
                      <button type="button" className="fr-btn fr-btn--secondary" onClick={close}>
                        Annuler
                      </button>
                    </li>
                    {!exceedsLimit && (
                      <li>
                        <button
                          type="button"
                          className="fr-btn fr-icon-check-line fr-btn--icon-left"
                          onClick={handleSubmit}
                          disabled={!name.trim() || createWorkspace.isPending}
                        >
                          Créer l'espace
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
