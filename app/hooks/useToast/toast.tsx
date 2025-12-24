import { useCallback, useEffect } from 'react';
import type { ToastItem, ToastVariant } from './types';
import usePausableTimer from './use-pausable-timer';
import { useToast } from './use-toast';

/**
 * Icon mapping for each toast variant
 */
const TOAST_ICONS: Record<ToastVariant, string> = {
  error: 'fr-icon-close-circle-fill',
  info: 'fr-icon-information-fill',
  success: 'fr-icon-checkbox-circle-fill',
  warning: 'fr-icon-error-warning-fill',
} as const;

/**
 * Default auto-dismiss duration in milliseconds
 */
const DEFAULT_AUTO_DISMISS_AFTER = 5000;

/**
 * Toast component props
 */
export interface ToastProps extends ToastItem {}

/**
 * Individual toast notification component
 */
export const Toast = ({
  autoDismissAfter = DEFAULT_AUTO_DISMISS_AFTER,
  description = '',
  id,
  title = '',
  type = 'success',
}: ToastProps): React.ReactElement => {
  const { remove } = useToast();

  /**
   * Remove the toast with animation
   */
  const removeSelf = useCallback((): void => {
    const toastElement = document?.getElementById(id);
    if (toastElement) {
      toastElement.style.setProperty('animation', 'toaster-unmount 1000ms');
    }

    setTimeout(() => {
      remove(id);
    }, 1000);
  }, [id, remove]);

  const { pause, resume } = usePausableTimer(removeSelf, autoDismissAfter);

  /**
   * Set progress bar animation duration
   */
  useEffect(() => {
    if (autoDismissAfter === 0) return;

    const progressBar = document.getElementById(`toaster-progress-${id}`);
    if (progressBar) {
      progressBar.style.setProperty('animation-duration', `${autoDismissAfter}ms`);
    }
  }, [id, autoDismissAfter]);

  const icon = TOAST_ICONS[type];
  const toastClassName = `toaster-toast toaster-toast-${type}`;

  return (
    <div id={id} role="alert" className={toastClassName} onMouseEnter={pause} onMouseLeave={resume}>
      <div className="toaster-colored-box">
        <span className={icon} aria-hidden="true" />
        {autoDismissAfter !== 0 && (
          <div id={`toaster-progress-${id}`} className="toaster-progress-bar" />
        )}
      </div>
      <button
        type="button"
        onClick={removeSelf}
        className="toaster-btn-close fr-icon-close-line"
        aria-label="Fermer le message"
      />
      <div className="toaster-content">
        {title && (
          <div className="fr-grid-row">
            <p className="fr-text--bold fr-mb-1w">{title}</p>
          </div>
        )}
        {description && (
          <div className="fr-grid-row">
            <p className="fr-mb-2w fr-text--sm">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
