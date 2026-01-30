import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDeleteWorkspace } from '@/api/workspaces';
import { Input } from '@/components/Input';
import { Modal, useModal } from '@/components/Modal';
import { toast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { ReadWorkspace } from '~/schemas/workspaces';

interface DangerZoneProps {
  workspace: ReadWorkspace;
}

export function DangerZone({ workspace }: DangerZoneProps) {
  const navigate = useNavigate();
  const deleteWorkspace = useDeleteWorkspace();
  const { modalProps, open, close } = useModal();
  const [confirmName, setConfirmName] = useState('');

  const handleDelete = () => {
    toast.promise(deleteWorkspace.mutateAsync(workspace.id), {
      loading: { title: 'Suppression en cours...' },
      success: {
        title: 'Espace de travail supprimé',
      },
      error: (err) => ({
        title: 'Erreur',
        description: getErrorMessage(err),
      }),
    });
    navigate('/espaces');
  };

  const canDelete = confirmName === workspace.name;

  return (
    <div className="fr-grid-row fr-pb-6w">
      <div className="fr-col-12 fr-col-md-4 fr-px-1w">
        <p
          className="fr-text--lead fr-text--bold fr-mb-1w"
          style={{ color: 'var(--text-default-error)' }}
        >
          Zone de danger
        </p>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Actions irréversibles sur cet espace
        </p>
      </div>
      <div className="fr-col-12 fr-col-md-6 fr-col-offset-md-2 fr-px-2w">
        <div
          className="fr-p-6w"
          style={{
            border: '1px solid var(--border-default-error)',
            borderRadius: '0.5rem',
          }}
        >
          <p className="fr-text--bold fr-mb-1w">Supprimer cet espace de travail</p>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-2w">
            Une fois supprimé, l'espace de travail et toutes ses données seront définitivement
            perdus. Cette action est irréversible.
          </p>
          <button
            type="button"
            className="fr-btn fr-btn--sm fr-btn--secondary fr-btn--error"
            onClick={open}
          >
            Supprimer l'espace de travail
          </button>
        </div>

        <Modal {...modalProps}>
          <div className="fr-container fr-container--fluid fr-container-md">
            <div className="fr-grid-row fr-grid-row--center">
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-modal__body">
                  <div className="fr-modal__header">
                    <button
                      type="button"
                      className="fr-btn--close fr-btn"
                      title="Fermer"
                      onClick={close}
                    >
                      Fermer
                    </button>
                  </div>
                  <div className="fr-modal__content">
                    <h1 className="fr-modal__title">
                      <span
                        className="fr-icon-warning-line fr-icon--lg"
                        aria-hidden="true"
                        style={{ color: 'var(--text-default-error)' }}
                      />
                      Confirmer la suppression
                    </h1>

                    <div className="fr-callout fr-callout--red-marianne fr-mb-3w">
                      <p className="fr-callout__text">
                        Cette action est irréversible. L'espace de travail et toutes ses données
                        seront définitivement supprimés.
                      </p>
                    </div>

                    <p className="fr-mb-2w">
                      Pour confirmer, tapez le nom de l'espace : <strong>{workspace.name}</strong>
                    </p>

                    <Input
                      label="Nom de l'espace"
                      type="text"
                      value={confirmName}
                      onChange={(e) => setConfirmName(e.target.value)}
                      placeholder={workspace.name}
                    />
                  </div>
                  <div className="fr-modal__footer">
                    <ul className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg">
                      <li>
                        <button type="button" className="fr-btn fr-btn--secondary" onClick={close}>
                          Annuler
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="fr-btn fr-btn--error"
                          disabled={!canDelete || deleteWorkspace.isPending}
                          onClick={handleDelete}
                        >
                          {deleteWorkspace.isPending
                            ? 'Suppression...'
                            : 'Supprimer définitivement'}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
