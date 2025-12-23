import { useForm } from '@tanstack/react-form';
import cn from 'classnames';
import { z } from 'zod';
import { useCreateWorkspace } from '@/api/workspaces';
import { Input } from '@/components/Input';
import { Modal, useModal } from '@/components/Modal';
import { useToast } from '@/hooks/useToast';

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom de l'espace est requis")
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  description: z
    .string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
});

export default function CreateWorkspaceForm({ triggerLabel }: { triggerLabel?: string }) {
  const { modalProps, modalId, open, close } = useModal();
  const { toast } = useToast();
  const createMutation = useCreateWorkspace();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      const validation = createWorkspaceSchema.safeParse(value);
      if (!validation.success) {
        toast({
          type: 'error',
          title: 'Erreur de validation',
          description: validation.error.errors[0]?.message ?? 'Erreur de validation',
        });
        return;
      }

      createMutation.mutate(
        {
          name: value.name,
          description: value.description || undefined,
        },
        {
          onSuccess: (data) => {
            toast({
              type: 'success',
              title: 'Espace créé',
              description: `L'espace de travail "${data.name}" a été créé avec succès.`,
            });
            form.reset();
            close();
          },
          onError: (error: Error) => {
            toast({
              type: 'error',
              title: 'Erreur',
              description:
                error.message || "Une erreur est survenue lors de la création de l'espace.",
            });
          },
        },
      );
    },
  });

  return (
    <>
      <button
        type="button"
        className={cn('fr-btn fr-btn--tertiary-no-outline fr-icon-add-line', {
          'fr-btn--icon-left': triggerLabel,
        })}
        title="Créer un nouvel espace de travail"
        aria-label="Créer un nouvel espace de travail"
        onClick={open}
      >
        {triggerLabel || 'Créer un nouvel espace de travail'}
      </button>

      <Modal {...modalProps}>
        <div className="fr-container fr-container--fluid fr-container-md">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
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
                    <h1 id={`${modalId}-title`} className="fr-modal__title">
                      Créer un nouvel espace de travail
                    </h1>

                    <fieldset className="fr-fieldset" disabled={createMutation.isPending}>
                      <div className="fr-fieldset__element">
                        <form.Field
                          name="name"
                          validators={{
                            onBlur: ({ value }) => {
                              if (!value) return "Le nom de l'espace est requis";
                              if (value.length > 255)
                                return 'Le nom ne peut pas dépasser 255 caractères';
                              return undefined;
                            },
                          }}
                        >
                          {(field) => (
                            <Input
                              required
                              type="text"
                              label="Nom de l'espace"
                              hint="Donnez un nom descriptif à votre espace de travail"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              message={field.state.meta.errors?.[0]}
                              messageType={field.state.meta.errors?.length ? 'error' : undefined}
                            />
                          )}
                        </form.Field>
                      </div>

                      <div className="fr-fieldset__element">
                        <form.Field name="description">
                          {(field) => (
                            <div className="fr-input-group">
                              <label className="fr-label" htmlFor={`${modalId}-description`}>
                                Description
                                <span className="fr-hint-text">
                                  Optionnel - Décrivez l'objectif de cet espace
                                </span>
                              </label>
                              <textarea
                                id={`${modalId}-description`}
                                className="fr-input"
                                rows={3}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                              />
                            </div>
                          )}
                        </form.Field>
                      </div>

                      {createMutation.isError && (
                        <div className="fr-messages-group fr-mb-2w" role="alert">
                          <p className="fr-error-text">{createMutation.error.message}</p>
                        </div>
                      )}
                    </fieldset>
                  </div>
                  <div className="fr-modal__footer">
                    <ul className="fr-btns-group fr-btns-group--sm fr-btns-group--right fr-btns-group--inline-lg">
                      <li>
                        <button type="button" className="fr-btn fr-btn--secondary" onClick={close}>
                          Annuler
                        </button>
                      </li>
                      <li>
                        <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
                          {([isSubmitting, canSubmit]) => (
                            <button
                              type="submit"
                              className="fr-btn"
                              disabled={!canSubmit || isSubmitting || createMutation.isPending}
                            >
                              {createMutation.isPending ? 'Création...' : "Créer l'espace"}
                            </button>
                          )}
                        </form.Subscribe>
                      </li>
                    </ul>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
