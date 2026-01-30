import { useForm } from '@tanstack/react-form';
import { useSignIn } from '@/api/auth';
import { Input } from '@/components/Input';
import { Password } from '@/components/Password';
import { toast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default function SignIn() {
  const signInMutation = useSignIn();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      toast.promise(signInMutation.mutateAsync(value), {
        loading: { title: 'Connexion en cours...' },
        success: { title: 'Connexion réussie', description: 'Bienvenue !' },
        error: (err) => ({
          duration: 0,
          title: 'Échec de la connexion',
          description: getErrorMessage(err),
        }),
      });
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
          className="fx-flex fx-flex-col fx-items-center fx-justify-center"
          style={{ width: '100%' }}
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
                    Se connecter
                  </button>
                </li>
              </ul>
            )}
          </form.Subscribe>
        </div>
      </fieldset>
    </form>
  );
}
