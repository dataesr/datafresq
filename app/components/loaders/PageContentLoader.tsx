import './styles.css';

interface PageContentLoaderProps {
  message?: string;
}

export function PageContentLoader({ message = 'Chargement en cours...' }: PageContentLoaderProps) {
  return (
    <div className="page-content-loader">
      <div className="page-content-loader__content">
        <div className="page-content-loader__spinner">
          <span className="fr-icon-refresh-line fr-icon--lg" aria-hidden="true" />
        </div>
        {message && <p className="page-content-loader__message fr-text--lg">{message}</p>}
      </div>
    </div>
  );
}

export default PageContentLoader;
