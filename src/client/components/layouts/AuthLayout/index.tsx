import cn from 'classnames';
import { Navigate, Outlet, useSearchParams } from 'react-router';
import { useOptionalCurrentUser } from '@/api/users';
import dataesrLogo from '@/assets/dataesr.svg';
import siesLogo from '@/assets/sies_logo_signature.svg';
import './styles.css';
import FullPageLoader from '@/components/FullPageLoader';

/**
 * Validates a redirect URL to prevent open redirect attacks.
 * Only allows relative paths that start with a single slash.
 */
function getSafeRedirectUrl(redirectTo: string | null): string {
  if (!redirectTo) return '/';

  // Must start with exactly one slash (not //)
  // and must not contain protocol indicators
  const isRelativePath =
    redirectTo.startsWith('/') &&
    !redirectTo.startsWith('//') &&
    !redirectTo.includes('://') &&
    !redirectTo.includes('\\');

  return isRelativePath ? redirectTo : '/';
}

function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn('auth-layout-wrapper', 'fr-background-contrast--grey')}>
      <div className={cn('auth-layout-logo-container')}>
        <img src={dataesrLogo} alt="Logo" />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className={cn('auth-layout-card-wrapper', 'fr-card', 'fr-card--shadow', 'fr-py-2w')}>
          {children}
        </div>
        <div className={cn('auth-layout-footer-logos', 'fr-mt-2w')}>
          <div className="fr-container-fluid">
            <div className="fr-header__logo">
              <p className="fr-logo">
                Ministère
                <br />
                chargé
                <br />
                de l'enseignement
                <br />
                supérieur
                <br />
                et de la recherche
              </p>
            </div>
          </div>
          <div className={cn('auth-layout-sies-logo')}>
            <img src={siesLogo} alt="Logo" />
          </div>
        </div>
        <ul className={cn('auth-layout-footer-links', 'fr-p-3w', 'fr-m-0')}>
          <li>
            <a className="fr-footer__bottom-link" href="/">
              Mentions légales
            </a>
          </li>
          <li>
            <a className="fr-footer__bottom-link" href="/">
              Données personnelles
            </a>
          </li>
          <li>
            <a className="fr-footer__bottom-link" href="/">
              Gestion des cookies
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN LAYOUT
// =============================================================================

export default function AuthLayout() {
  const { user, isLoading } = useOptionalCurrentUser();
  const [searchParams] = useSearchParams();

  // Show loader while checking auth status
  if (isLoading) {
    return (
      <AuthLayoutWrapper>
        <FullPageLoader />
      </AuthLayoutWrapper>
    );
  }

  // Redirect authenticated users to app
  if (user) {
    const redirectTo = searchParams.get('redirect');
    const destination = getSafeRedirectUrl(redirectTo);
    return <Navigate to={destination} replace />;
  }

  // Not authenticated - show auth form
  return (
    <AuthLayoutWrapper>
      <Outlet />
    </AuthLayoutWrapper>
  );
}
