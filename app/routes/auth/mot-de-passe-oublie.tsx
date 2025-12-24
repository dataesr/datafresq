import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link } from 'react-router';
import { useForgotPassword } from '@/api/auth';
import { Input } from '@/components/Input';

export default function MotDePasseOublie() {
  const [emailSent, setEmailSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword({
    onSuccess: () => setEmailSent(true),
  });

  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      await forgotPasswordMutation.mutateAsync(value);
    },
  });

  if (emailSent) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <span
          className="fr-icon-mail-fill fr-icon--lg fr-mb-2w"
          aria-hidden="true"
          style={{ color: 'var(--text-default-success)' }}
        />
        <h2 className="fr-h4 fr-mb-2w">Email envoyé</h2>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
          Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser
          votre mot de passe.
        </p>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
          Pensez à vérifier vos spams si vous ne recevez pas l'email.
        </p>
        <Link to="/auth/se-connecter" className="fr-btn fr-btn--secondary">
          Retour à la connexion
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
      id="forgot-password-form"
      noValidate
    >
      <fieldset
        className="fr-fieldset"
        id="forgot-password-fieldset"
        aria-labelledby="forgot-password-legend"
        disabled={forgotPasswordMutation.isPending}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <legend id="forgot-password-legend">
            <h2 className="fr-h4 fr-my-4w">Mot de passe oublié</h2>
          </legend>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-3w" style={{ textAlign: 'center' }}>
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot
            de passe.
          </p>
        </div>

        <div className="fr-fieldset__element">
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Email requis';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return 'Adresse email invalide';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                required
                type="email"
                label="Adresse email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                icon="fr-icon-mail-fill"
                autoComplete="email"
                autoFocus
                message={field.state.meta.errors?.[0]}
                messageType={field.state.meta.errors?.[0] ? 'error' : undefined}
              />
            )}
          </form.Field>
        </div>

        {forgotPasswordMutation.isError && (
          <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-2w" role="alert">
            <p>{forgotPasswordMutation.error.message}</p>
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
                    disabled={!canSubmit || isSubmitting || forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <span className="fr-icon-refresh-line fr-icon--sm" aria-hidden="true" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer le lien'
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
