import cn from 'classnames';
import { Activity, Suspense } from 'react';
import { Link, useParams } from 'react-router';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import FullPageLoader from '@/components/FullPageLoader';
import AccountSettings from './compte';
import ProfileSettings from './profil';
import SecuritySettings from './securite';

import './styles/settings-card.css';

type TabId = 'profil' | 'securite' | 'compte';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'profil', label: 'Profil', icon: 'fr-icon-user' },
  { id: 'securite', label: 'Sécurité', icon: 'fr-icon-lock' },
  { id: 'compte', label: 'Compte', icon: 'fr-icon-user-setting' },
];

export default function UserSettings() {
  const { tab: activeTab = 'profil' } = useParams<{ tab?: string }>();
  const currentTabLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <div className="page">
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
              <Link className="fr-breadcrumb__link" to="/utilisateur">
                Mon compte
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
      <div className="fr-mb-4w">
        <h1 className="fr-h2 fr-mb-1w">Mon compte</h1>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      {/* Navigation tabs */}
      <nav className="fr-nav xfr-nav--horizontal" aria-label="Navigation du compte utilisateur">
        <ul className="fr-nav__list">
          {tabs.map((tab) => (
            <li key={tab.id} className="fr-nav__item">
              <Link
                to={`/utilisateur/${tab.id}`}
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
            </li>
          ))}
        </ul>
      </nav>

      <hr className="fr-mt-0" />

      {/* Tab content */}
      <ErrorBoundary>
        <Suspense fallback={<FullPageLoader />}>
          <Activity mode={activeTab === 'profil' ? 'visible' : 'hidden'}>
            <ProfileSettings />
          </Activity>
          <Activity mode={activeTab === 'securite' ? 'visible' : 'hidden'}>
            <SecuritySettings />
          </Activity>
          <Activity mode={activeTab === 'compte' ? 'visible' : 'hidden'}>
            <AccountSettings />
          </Activity>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
