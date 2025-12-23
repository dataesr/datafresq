import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useRegister } from '@/api/invitations';
import { Input } from '@/components/Input';
import { Password } from '@/components/Password';

export default function CreerUnCompte() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const registerMutation = useRegister({
    onSuccess: () => setRegisterSuccess(true),
  });

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (!token) return;
      await registerMutation.mutateAsync({
        token,
        firstName: value.firstName,
        lastName: value.lastName,
        password: value.password,
      });
    },
  });

  if (!token) {
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
          className="fr-icon-error-fill fr-icon--lg fr-mb-2w"
          aria-hidden="true"
          style={{ color: 'var(--text-default-error)' }}
        />
        <h2 className="fr-h4 fr-mb-2w">Lien d'invitation invalide</h2>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
          Le lien d'invitation est invalide ou a expiré. Veuillez contacter un administrateur pour
          recevoir une nouvelle invitation.
        </p>
        <Link to="/auth/se-connecter" className="fr-btn fr-btn--secondary">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  if (registerSuccess) {
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
          className="fr-icon-success-fill fr-icon--lg fr-mb-2w"
          aria-hidden="true"
          style={{ color: 'var(--text-default-success)' }}
        />
        <h2 className="fr-h4 fr-mb-2w">Compte créé avec succès</h2>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-3w">
          Votre compte a été activé. Vous pouvez maintenant vous connecter avec votre adresse email
          et votre mot de passe.
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
      id="register-form"
      noValidate
    >
      <fieldset
        className="fr-fieldset"
        id="register-fieldset"
        aria-labelledby="register-legend"
        disabled={registerMutation.isPending}
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
          <legend id="register-legend">
            <h2 className="fr-h4 fr-my-4w">Créer votre compte</h2>
          </legend>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-3w" style={{ textAlign: 'center' }}>
            Complétez votre inscription en renseignant vos informations.
          </p>
        </div>

        <div className="fr-fieldset__element">
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Prénom requis';
                if (value.length < 2) {
                  return 'Le prénom doit contenir au moins 2 caractères';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                required
                type="text"
                label="Prénom"
                hint="Prénom"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                icon="fr-icon-user-fill"
                autoComplete="given-name"
                autoFocus
                message={field.state.meta.errors?.[0]}
                messageType={field.state.meta.errors?.[0] ? 'error' : undefined}
              />
            )}
          </form.Field>
        </div>
        <div className="fr-fieldset__element">
          <form.Field
            name="lastName"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Nom requis';
                if (value.length < 2) {
                  return 'Le Nom doit contenir au moins 2 caractères';
                }
                if (!/^[\p{L}\s'-]+$/u.test(value)) {
                  return 'Le Nom contient des caractères non autorisés';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                required
                type="text"
                label="Nom"
                hint="Nom"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                icon="fr-icon-user-fill"
                autoComplete="family-name"
                autoFocus
                message={field.state.meta.errors?.[0]}
                messageType={field.state.meta.errors?.[0] ? 'error' : undefined}
              />
            )}
          </form.Field>
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
                label="Mot de passe"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="new-password"
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

        {registerMutation.isError && (
          <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-2w" role="alert">
            <p>{registerMutation.error.message}</p>
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
                    disabled={!canSubmit || isSubmitting || registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <span className="fr-icon-refresh-line fr-icon--sm" aria-hidden="true" />
                        Création en cours...
                      </>
                    ) : (
                      'Créer mon compte'
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
              Vous avez déjà un compte ?{' '}
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
