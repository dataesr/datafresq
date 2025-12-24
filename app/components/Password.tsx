import cn from 'classnames';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

type PasswordProps = {
  message?: string;
  messageType?: 'error' | 'valid';
  label?: string;
  forgottenPasswordUrl?: string;
  addons?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Password({
  forgottenPasswordUrl,
  message,
  messageType,
  label,
  addons,
  ...rest
}: PasswordProps) {
  const _id = useId();
  const id = rest.id ?? _id;
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div
        className={cn('fr-input-group', {
          [`fr-input-group--${messageType}`]: !!messageType,
          'fr-mb-1v': forgottenPasswordUrl,
        })}
      >
        {label && (
          <label className="fr-label" htmlFor={id}>
            {label}
          </label>
        )}
        <div
          className={cn('fr-input-wrap', {
            'fr-icon-eye-fill': showPassword,
            'fr-icon-eye-off-fill': !showPassword,
          })}
        >
          <input
            className={cn('fr-input', {
              [`fr-input--${messageType}`]: !!messageType,
            })}
            aria-required={rest.required}
            aria-describedby={message ? `${id}-desc` : undefined}
            id={id}
            {...rest}
            type={showPassword ? 'text' : 'password'}
          />
          <input
            aria-label="Afficher le mot de passe"
            type="checkbox"
            onChange={(e) => setShowPassword(e.target.checked)}
            checked={showPassword}
            className="fr-password__show-hide-checkbox"
          />
        </div>
        {message && (
          <div
            id={`${id}-desc`}
            className="fr-messages-group"
            aria-live={messageType === 'error' ? 'assertive' : 'polite'}
            role={messageType === 'error' ? 'alert' : undefined}
          >
            <p
              className={cn('fr-message', {
                [`fr-message--${messageType}`]: messageType,
              })}
            >
              {message}
            </p>
          </div>
        )}
        {addons && addons}
      </div>
      {forgottenPasswordUrl && (
        <p className="fr-mt-1v">
          <Link to={forgottenPasswordUrl} className="fr-link fr-link--xs">
            Mot de passe oublié ?
          </Link>
        </p>
      )}
    </>
  );
}
