import cn from 'classnames';
import { useId } from 'react';

type InputProps = {
  message?: string;
  messageType?: 'error' | 'valid';
  hint?: string;
  label?: string;
  icon?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ message, messageType, hint, label, icon, ...rest }: InputProps) {
  const _id = useId();
  const id = rest.id ?? _id;
  return (
    <div className={cn('fr-input-group', { [`fr-input-group--${messageType}`]: !!messageType })}>
      {label && (
        <label className="fr-label" htmlFor={id}>
          {label}
          {hint && <span className="fr-hint-text">{hint}</span>}
        </label>
      )}
      <div className={cn('fr-input-wrap', { [`${icon}`]: icon })}>
        <input
          {...rest}
          className={cn('fr-input', { [`fr-input--${messageType}`]: !!messageType })}
          aria-required={rest.required}
          aria-describedby={message ? `${id}-desc` : undefined}
          id={id}
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
    </div>
  );
}
