import { Suspense } from 'react';
import { useParams } from 'react-router';
import { Breadcrumb } from '@/components/Breadcrumb';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import PageContentLoader from '@/components/loaders/PageContentLoader';
import { TabActivityPanel } from '@/components/TabActivityPanel';
import { Tabnav, TabnavItem } from '@/components/Tabnav';

import Compte from './compte';
import Profil from './profil';
import Securite from './securite';

import './styles.css';

type TabId = 'profil' | 'securite' | 'compte';

const tabs: { id: TabId; label: string; iconLine: string; iconFill: string }[] = [
  { id: 'profil', label: 'Profil', iconLine: 'fr-icon-user-line', iconFill: 'fr-icon-user-fill' },
  {
    id: 'securite',
    label: 'Sécurité',
    iconLine: 'fr-icon-lock-line',
    iconFill: 'fr-icon-lock-fill',
  },
  {
    id: 'compte',
    label: 'Compte',
    iconLine: 'fr-icon-user-setting-line',
    iconFill: 'fr-icon-user-setting-fill',
  },
];

export default function UserSettings() {
  const { tab: activeTab = 'profil' } = useParams<{ tab?: string }>();
  const currentTabLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageContentLoader />}>
        <div>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Mon compte', href: '/utilisateur' },
              { label: currentTabLabel || 'Profil', current: true },
            ]}
          />
          <div className="fr-mb-4w">
            <h1 className="fr-h2 fr-mb-1w">Mon compte</h1>
            <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>

          <Tabnav currentLabel={currentTabLabel}>
            {tabs.map((tab) => (
              <TabnavItem
                key={tab.id}
                to={`/utilisateur/${tab.id}`}
                icon={tab.iconLine}
                iconActive={tab.iconFill}
                active={activeTab === tab.id}
              >
                {tab.label}
              </TabnavItem>
            ))}
          </Tabnav>

          <TabActivityPanel mode={activeTab === 'profil' ? 'visible' : 'hidden'}>
            <Profil />
          </TabActivityPanel>

          <TabActivityPanel mode={activeTab === 'securite' ? 'visible' : 'hidden'}>
            <Securite />
          </TabActivityPanel>

          <TabActivityPanel mode={activeTab === 'compte' ? 'visible' : 'hidden'}>
            <Compte />
          </TabActivityPanel>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
