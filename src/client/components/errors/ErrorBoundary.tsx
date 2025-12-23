import {
  Component,
  type ErrorInfo,
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { APIError } from '@/api/eden-treaty';

// =============================================================================
// ERROR FALLBACK COMPONENTS
// =============================================================================

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Fallback for 401 Unauthorized - redirects to login
 * Prevents redirect loops by checking if we're already on the login page
 * or if the URL already contains a redirect parameter
 */
function UnauthorizedFallback() {
  const location = useLocation();

  // Don't redirect if we're already on the auth pages
  if (location.pathname.startsWith('/auth/')) {
    return null;
  }

  // Don't create nested redirects - only use the original path
  // If we already have a redirect param, something went wrong - just go to login
  if (location.search.includes('redirect=')) {
    return <Navigate to="/auth/se-connecter" replace />;
  }

  const redirectUrl = `${location.pathname}${location.search}`;
  const loginUrl = `/auth/se-connecter?redirect=${encodeURIComponent(redirectUrl)}`;

  return <Navigate to={loginUrl} replace />;
}

/**
 * Fallback for 403 Forbidden
 */
function ForbiddenFallback({ resetError }: { resetError: () => void }) {
  return (
    <div className="fr-container fr-py-8w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div className="fr-callout">
            <h3 className="fr-callout__title">
              <span className="fr-icon-lock-line fr-mr-2w" aria-hidden="true" />
              Accès refusé
            </h3>
            <p className="fr-callout__text">
              Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
            </p>
            <div className="fr-btns-group fr-btns-group--inline-sm">
              <Link to="/" className="fr-btn">
                Retour à l'accueil
              </Link>
              <button type="button" className="fr-btn fr-btn--secondary" onClick={resetError}>
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback for 404 Not Found
 */
function NotFoundFallback({ resetError }: { resetError: () => void }) {
  return (
    <div className="fr-container fr-py-8w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div className="fr-callout">
            <h3 className="fr-callout__title">
              <span className="fr-icon-search-line fr-mr-2w" aria-hidden="true" />
              Ressource introuvable
            </h3>
            <p className="fr-callout__text">
              La ressource que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <div className="fr-btns-group fr-btns-group--inline-sm">
              <Link to="/" className="fr-btn">
                Retour à l'accueil
              </Link>
              <button type="button" className="fr-btn fr-btn--secondary" onClick={resetError}>
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback for server errors (5xx)
 */
function ServerErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="fr-container fr-py-8w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div className="fr-callout fr-callout--red-marianne">
            <h3 className="fr-callout__title">
              <span className="fr-icon-error-warning-line fr-mr-2w" aria-hidden="true" />
              Erreur serveur
            </h3>
            <p className="fr-callout__text">
              Une erreur inattendue s'est produite sur le serveur. Veuillez réessayer plus tard.
            </p>
            {error.message && (
              <p className="fr-text--sm fr-text-mention--grey fr-mb-2w">
                Détails : {error.message}
              </p>
            )}
            <div className="fr-btns-group fr-btns-group--inline-sm">
              <button type="button" className="fr-btn" onClick={resetError}>
                Réessayer
              </button>
              <Link to="/" className="fr-btn fr-btn--secondary">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback for generic/unknown errors
 */
function GenericErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="fr-container fr-py-8w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div className="fr-callout fr-callout--orange-terre-battue">
            <h3 className="fr-callout__title">
              <span className="fr-icon-alert-line fr-mr-2w" aria-hidden="true" />
              Une erreur est survenue
            </h3>
            <p className="fr-callout__text">
              {error.message || "Une erreur inattendue s'est produite."}
            </p>
            <div className="fr-btns-group fr-btns-group--inline-sm">
              <button type="button" className="fr-btn" onClick={resetError}>
                Réessayer
              </button>
              <Link to="/" className="fr-btn fr-btn--secondary">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ERROR FALLBACK WRAPPER (handles routing for 401)
// =============================================================================

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  // Handle APIError with specific status codes
  if (error instanceof APIError) {
    if (error.is(401)) {
      return <UnauthorizedFallback />;
    }
    if (error.is(403)) {
      return <ForbiddenFallback resetError={resetError} />;
    }
    if (error.is(404)) {
      return <NotFoundFallback resetError={resetError} />;
    }
    if (error.isServerError()) {
      return <ServerErrorFallback error={error} resetError={resetError} />;
    }
  }

  // Generic error fallback
  return <GenericErrorFallback error={error} resetError={resetError} />;
}

// =============================================================================
// ERROR BOUNDARY CLASS COMPONENT
// =============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: ErrorFallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryHandle {
  resetError: () => void;
}

/**
 * Inner class component that handles the actual error boundary logic
 */
class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            error: this.state.error,
            resetError: this.resetError,
          });
        }
        return this.props.fallback;
      }

      // Use default error fallback with APIError handling
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * Inner component wrapped with forwardRef to expose resetError
 */
const ErrorBoundaryInner = forwardRef<ErrorBoundaryHandle, Props>(
  function ErrorBoundaryInner(props, ref) {
    const classRef = useRef<ErrorBoundaryClass>(null);

    useImperativeHandle(ref, () => ({
      resetError: () => {
        classRef.current?.resetError();
      },
    }));

    return <ErrorBoundaryClass ref={classRef} {...props} />;
  },
);

/**
 * Wrapper component that resets ErrorBoundary on navigation
 * This prevents redirect loops when navigating away from error states
 */
function ErrorBoundaryWithReset(props: Props) {
  const location = useLocation();
  const errorBoundaryRef = useRef<ErrorBoundaryHandle>(null);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    // Reset error boundary when pathname changes
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      errorBoundaryRef.current?.resetError();
    }
  }, [location.pathname]);

  return <ErrorBoundaryInner ref={errorBoundaryRef} {...props} />;
}

/**
 * Main ErrorBoundary component that automatically resets on navigation
 */
export function ErrorBoundary(props: Props) {
  return <ErrorBoundaryWithReset {...props} />;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ErrorBoundary;
export {
  ErrorFallback,
  UnauthorizedFallback,
  ForbiddenFallback,
  NotFoundFallback,
  ErrorBoundaryWithReset,
};
