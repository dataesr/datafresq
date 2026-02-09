import cn from 'classnames';
import { Activity, Suspense } from 'react';
import { Link, useParams } from 'react-router';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import FullPageLoader from '@/components/loaders/FullPageLoader';
import AdminUtilisateurs from './utilisateurs';

type TabId = 'utilisateurs' | 'groupes' | 'taches' | 'domaines';

const tabs: { id: TabId; label: string; icon: string; enabled: boolean }[] = [
  { id: 'utilisateurs', label: 'Utilisateurs', icon: 'fr-icon-group', enabled: true },
  { id: 'groupes', label: 'Groupes', icon: 'fr-icon-team', enabled: false },
  { id: 'taches', label: 'Tâches', icon: 'fr-icon-calendar-event', enabled: false },
  { id: 'domaines', label: 'Domaines', icon: 'fr-icon-global', enabled: false },
];

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="fr-py-8w" style={{ textAlign: 'center' }}>
      <span
        className="fr-icon-tools-line fr-icon--lg fr-mb-2w"
        aria-hidden="true"
        style={{ color: 'var(--text-mention-grey)' }}
      />
      <h2 className="fr-h4 fr-mb-1w">{label}</h2>
      <p className="fr-text-mention--grey">Cette fonctionnalité sera bientôt disponible.</p>
    </div>
  );
}

export default function AdminSection() {
  const { tab: activeTab = 'utilisateurs' } = useParams<{ tab?: string }>();
  const currentTabLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="fr-breadcrumb" aria-label="vous êtes ici :">
        <button
          className="fr-breadcrumb__button"
          aria-expanded="false"
          aria-controls="breadcrumb"
          type="button"
        >
          Voir le fil d'Ariane
        </button>
        <div className="fr-collapse" id="breadcrumb">
          <ol className="fr-breadcrumb__list">
            <li>
              <Link className="fr-breadcrumb__link" to="/">
                Accueil
              </Link>
            </li>
            <li>
              <Link className="fr-breadcrumb__link" to="/admin/utilisateurs">
                Administration
              </Link>
            </li>
            <li>
              <span className="fr-breadcrumb__link" aria-current="page">
                {currentTabLabel}
              </span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Header */}
      <div className="fr-mb-4w">
        <h1 className="fr-h2 fr-mb-1w">Administration</h1>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Gérez les utilisateurs, groupes, tâches et domaines de la plateforme
        </p>
      </div>

      {/* Navigation tabs */}
      <nav className="fr-nav xfr-nav--horizontal" aria-label="Navigation administration">
        <ul className="fr-nav__list">
          {tabs.map((tab) => (
            <li key={tab.id} className="fr-nav__item">
              {tab.enabled ? (
                <Link
                  to={`/admin/${tab.id}`}
                  className="fr-nav__link"
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <span
                    className={cn('fr-icon--sm fr-mr-1w', {
                      [`${tab.icon}-line`]: activeTab !== tab.id,
                      [`${tab.icon}-fill`]: activeTab === tab.id,
                    })}
                    aria-hidden="true"
                  />
                  {tab.label}
                </Link>
              ) : (
                <span
                  className="fr-nav__link"
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  title="Bientôt disponible"
                >
                  <span
                    className={cn('fr-icon--sm fr-mr-1w', `${tab.icon}-line`)}
                    aria-hidden="true"
                  />
                  {tab.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <hr className="fr-mt-0" />

      {/* Tab content */}
      <ErrorBoundary>
        <Suspense fallback={<FullPageLoader />}>
          <Activity mode={activeTab === 'utilisateurs' ? 'visible' : 'hidden'}>
            <AdminUtilisateurs />
          </Activity>
          <Activity mode={activeTab === 'groupes' ? 'visible' : 'hidden'}>
            <ComingSoon label="Gestion des groupes" />
          </Activity>
          <Activity mode={activeTab === 'taches' ? 'visible' : 'hidden'}>
            <ComingSoon label="Gestion des tâches" />
          </Activity>
          <Activity mode={activeTab === 'domaines' ? 'visible' : 'hidden'}>
            <ComingSoon label="Gestion des domaines" />
          </Activity>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
