import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useResetPassword } from '@/api/auth';
import { Password } from '@/components/Password';

export default function ReinitialiserMotDePasse() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resetSuccess, setResetSuccess] = useState(false);

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => setResetSuccess(true),
  });

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (!token) return;
      await resetPasswordMutation.mutateAsync({
        token,
        password: value.password,
      });
    },
  });

  if (!token) {
    return (
      <div
        className="fx-flex fx-flex-col fx-items-center fx-justify-center fr-p-4w"
        style={{
          textAlign: 'center',
        }}
      >
        <span
          className="fr-icon-error-fill fr-icon--lg fr-mb-2w"
          aria-hidden="true"
          style={{ color: 'var(--text-default-error)' }}
        />
        <h2 className="fr-h4 fr-mb-2w">Lien invalide</h2>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
          Le lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link to="/auth/mot-de-passe-oublie" className="fr-btn fr-btn--secondary">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div
        className="fx-flex fx-flex-col fx-items-center fx-justify-center fr-p-4w"
        style={{
          textAlign: 'center',
        }}
      >
        <span
          className="fr-icon-success-fill fr-icon--lg fr-mb-2w"
          aria-hidden="true"
          style={{ color: 'var(--text-default-success)' }}
        />
        <h2 className="fr-h4 fr-mb-2w">Mot de passe réinitialisé</h2>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
          Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec
          votre nouveau mot de passe.
        </p>
        <Link to="/auth/se-connecter" className="fr-btn">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      id="reset-password-form"
      noValidate
    >
      <fieldset
        className="fr-fieldset"
        id="reset-password-fieldset"
        aria-labelledby="reset-password-legend"
        disabled={resetPasswordMutation.isPending}
      >
        <div
          className="fx-flex fx-flex-col fx-items-center fx-justify-center"
          style={{
            width: '100%',
          }}
        >
          <legend id="reset-password-legend">
            <h2 className="fr-h4 fr-my-4w">Nouveau mot de passe</h2>
          </legend>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-3w" style={{ textAlign: 'center' }}>
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </p>
        </div>

        <div className="fr-fieldset__element">
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Mot de passe requis';
                if (value.length < 8) {
                  return 'Le mot de passe doit contenir au moins 8 caractères';
                }
                if (!/(?=.*[A-Z])/.test(value)) {
                  return 'Le mot de passe doit contenir au moins une majuscule';
                }
                if (!/(?=.*[a-z])/.test(value)) {
                  return 'Le mot de passe doit contenir au moins une minuscule';
                }
                if (!/(?=.*[0-9])/.test(value)) {
                  return 'Le mot de passe doit contenir au moins un chiffre';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Password
                required
                label="Nouveau mot de passe"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="new-password"
                autoFocus
                message={field.state.meta.errors?.[0]}
                messageType={field.state.meta.errors?.[0] ? 'error' : undefined}
                addons={
                  <p className="fr-hint-text fr-mt-1v">
                    8 caractères minimum, une majuscule, une minuscule et un chiffre
                  </p>
                }
              />
            )}
          </form.Field>
        </div>

        <div className="fr-fieldset__element">
          <form.Field
            name="confirmPassword"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) => {
                if (!value) return 'Confirmation requise';
                const password = fieldApi.form.getFieldValue('password');
                if (value !== password) {
                  return 'Les mots de passe ne correspondent pas';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Password
                required
                label="Confirmer le mot de passe"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="new-password"
                message={field.state.meta.errors?.[0]}
                messageType={field.state.meta.errors?.[0] ? 'error' : undefined}
              />
            )}
          </form.Field>
        </div>

        {resetPasswordMutation.isError && (
          <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-2w" role="alert">
            <p>{resetPasswordMutation.error.message}</p>
          </div>
        )}

        <div className="fr-fieldset__element">
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <ul className="fr-btns-group">
                <li>
                  <button
                    type="submit"
                    className="fr-btn fr-btn--lg fr-mt-2w"
                    disabled={!canSubmit || isSubmitting || resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <span className="fr-icon-refresh-line fr-icon--sm" aria-hidden="true" />
                        Réinitialisation...
                      </>
                    ) : (
                      'Réinitialiser le mot de passe'
                    )}
                  </button>
                </li>
              </ul>
            )}
          </form.Subscribe>
        </div>

        <div className="fr-fieldset__element">
          <div className="fr-grid-row fr-mt-2w">
            <p className="fr-text--sm">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link to="/auth/se-connecter" className="fr-link fr-text--sm">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
