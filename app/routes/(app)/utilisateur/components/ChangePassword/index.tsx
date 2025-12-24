import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

import { useChangePassword } from '@/api/users';
import { Button } from '@/components/Button';
import { Password } from '@/components/Password';
import { useToast } from '@/hooks/useToast';
import { passwordSchema as passwordFieldSchema } from '@/utils/password';

const passwordSchema = z
  .object({
    currentPassword: passwordFieldSchema,
    newPassword: passwordFieldSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

export default function ChangePassword() {
  const { toast } = useToast();
  const { mutate: changePassword, isPending } = useChangePassword();

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      changePassword(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        },
        {
          onSuccess: () => {
            toast({ type: 'success', description: 'Mot de passe modifié avec succès' });
            passwordForm.reset();
          },
          onError: (error: Error) => {
            toast({ type: 'error', description: error.message });
          },
        },
      );
    },
    validators: {
      onSubmit: passwordSchema,
    },
  });

  return (
    <div className="settings-card">
      <div className="settings-card__main settings-card__main--horizontal">
        <div className="settings-card__header">
          <p className="fr-h6 fr-mb-0">Changer de mot de passe</p>
          <p className="fr-text--sm fr-mb-0">
            Il est recommandé de changer votre mot de passe toutes les 90 jours.
          </p>
        </div>
        <div className="settings-card__content">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              passwordForm.handleSubmit();
            }}
          >
            <fieldset className="fr-fieldset">
              <div className="fr-fieldset__element">
                <passwordForm.Field name="currentPassword">
                  {(field) => (
                    <Password
                      label="Mot de passe actuel"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      message={field.state.meta.errors?.[0]?.message}
                      messageType={field.state.meta.errors?.length ? 'error' : undefined}
                    />
                  )}
                </passwordForm.Field>
              </div>
              <div className="fr-fieldset__element">
                <passwordForm.Field name="newPassword">
                  {(field) => (
                    <Password
                      label="Nouveau mot de passe"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </passwordForm.Field>
              </div>
              <div className="fr-fieldset__element">
                <passwordForm.Field name="confirmPassword">
                  {(field) => (
                    <Password
                      label="Confirmer le nouveau mot de passe"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      message={field.state.meta.errors?.[0]?.message}
                      messageType={field.state.meta.errors?.length ? 'error' : undefined}
                    />
                  )}
                </passwordForm.Field>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <div className="settings-card__footer">
        <passwordForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
        >
          {([canSubmit, isSubmitting, isPristine]) => (
            <Button
              size="sm"
              type="submit"
              variant="secondary"
              disabled={!canSubmit || isSubmitting || isPending || isPristine}
              onClick={() => passwordForm.handleSubmit()}
            >
              {isSubmitting || isPending ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          )}
        </passwordForm.Subscribe>
      </div>
    </div>
  );
}
