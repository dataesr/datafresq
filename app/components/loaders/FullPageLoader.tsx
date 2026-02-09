import './styles.css';

interface FullPageLoaderProps {
  message?: string;
}

/**
 * Full page loading overlay with animated icon
 * Uses DSFR styling and utilities
 */
export function FullPageLoader({ message = 'Chargement en cours...' }: FullPageLoaderProps) {
  return (
    <div className="full-page-loader">
      <div className="full-page-loader__overlay" />
      <div className="full-page-loader__content">
        <div className="full-page-loader__spinner">
          {/* Animated refresh icon */}
          <span className="fr-icon-refresh-line fr-icon--lg" aria-hidden="true" />
        </div>
        {message && <p className="full-page-loader__message fr-text--lg">{message}</p>}
      </div>
    </div>
  );
}

export default FullPageLoader;
