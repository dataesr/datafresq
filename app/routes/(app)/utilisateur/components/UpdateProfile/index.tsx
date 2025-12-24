import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

import { useCurrentUser, useUpdateProfile } from '@/api/users';
import { Input } from '@/components/Input';
import { useToast } from '@/hooks/useToast';

// Zod schemas for validation
const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function UpdateProfile() {
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    } as ProfileForm,
    onSubmit: async ({ value }) => {
      updateProfile(value, {
        onSuccess: () => {
          toast({ type: 'success', title: 'Profil mis à jour avec succès' });
        },
        onError: (error: Error) => {
          toast({ type: 'error', title: error.message });
        },
      });
    },
    validators: {
      onBlur: profileSchema,
    },
  });

  return (
    <div className="settings-card settings-card--horizontal">
      <div className="settings-card__main">
        <div className="settings-card__header">
          <p className="fr-h6 fr-mb-0">Informations personnelles</p>
          <p className="fr-text--sm fr-mb-0">Modifier vos informations personnelles</p>
        </div>
        <div className="settings-card__content">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="fr-fieldset fr-mb-0">
              <div className="fr-fieldset__element">
                <form.Field name="firstName">
                  {(field) => (
                    <Input
                      label="Prénom"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      message={field.state.meta.errors?.[0]?.message}
                      messageType={field.state.meta.errors?.length ? 'error' : undefined}
                    />
                  )}
                </form.Field>
              </div>
              <div className="fr-fieldset__element">
                <form.Field name="lastName">
                  {(field) => (
                    <Input
                      label="Nom"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      message={field.state.meta.errors?.[0]?.message}
                      messageType={field.state.meta.errors?.length ? 'error' : undefined}
                    />
                  )}
                </form.Field>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="settings-card__footer">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
        >
          {([canSubmit, isSubmitting, isPristine]) => (
            <button
              disabled={!canSubmit || isSubmitting || isPending || isPristine}
              type="submit"
              className="fr-btn fr-btn--secondary"
              onClick={() => form.handleSubmit()}
            >
              {isSubmitting || isPending ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          )}
        </form.Subscribe>
      </div>
    </div>
  );
}
