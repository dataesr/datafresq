import { useForm } from '@tanstack/react-form';
import { Activity } from 'react';
import { Link } from 'react-router';
import { useSignIn } from '@/api/auth';
import { Input } from '@/components/Input';
import { Password } from '@/components/Password';
import { useToast } from '@/hooks/useToast';

export default function SignIn() {
  const { toast } = useToast();
  const signInMutation = useSignIn({
    onSuccess: () => {
      toast({
        type: 'success',
        title: 'Succès!',
        description: 'Connexion réussie',
        autoDismissAfter: 0,
      });
    },
  });

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await signInMutation.mutateAsync(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      id="login-form"
      noValidate
    >
      <fieldset
        className="fr-fieldset"
        id="login-fieldset"
        aria-labelledby="login-legend"
        disabled={signInMutation.isPending}
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
          <legend id="login-legend">
            <h2 className="fr-h4 fr-my-4w">Connexion</h2>
          </legend>
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
                autoComplete="current-password"
                forgottenPasswordUrl="/auth/mot-de-passe-oublie"
                message={field.state.meta.errors?.[0]}
              />
            )}
          </form.Field>
        </div>

        <Activity mode={signInMutation.isError ? 'visible' : 'hidden'}>
          <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-2w" role="alert">
            <p>{signInMutation.error?.message}</p>
          </div>
        </Activity>

        <div className="fr-fieldset__element">
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <ul className="fr-btns-group">
                <li>
                  <button
                    type="submit"
                    className="fr-btn fr-btn--lg fr-mt-2w"
                    disabled={!canSubmit || isSubmitting || signInMutation.isPending}
                  >
                    {signInMutation.isPending ? (
                      <>
                        <span className="fr-icon-refresh-line fr-icon--sm" aria-hidden="true" />
                        Connexion en cours...
                      </>
                    ) : (
                      'Se connecter'
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
              Pas encore de compte ?{' '}
              <Link to="/auth/creer-un-compte" className="fr-link fr-text--sm">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
