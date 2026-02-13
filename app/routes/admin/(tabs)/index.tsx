import { useParams } from 'react-router';
import { Breadcrumb } from '@/components/Breadcrumb';
import { TabActivityPanel } from '@/components/TabActivityPanel';
import { Tabnav, TabnavItem } from '@/components/ui/Tabnav';
import AdminUtilisateurs from './utilisateurs';

type TabId = 'utilisateurs' | 'groupes' | 'taches' | 'domaines';

const tabs: { id: TabId; label: string; iconLine: string; iconFill: string; enabled: boolean }[] = [
  { id: 'utilisateurs', label: 'Utilisateurs', iconLine: 'fr-icon-group-line', iconFill: 'fr-icon-group-fill', enabled: true },
  { id: 'groupes', label: 'Groupes', iconLine: 'fr-icon-team-line', iconFill: 'fr-icon-team-fill', enabled: false },
  { id: 'taches', label: 'Tâches', iconLine: 'fr-icon-calendar-event-line', iconFill: 'fr-icon-calendar-event-fill', enabled: false },
  { id: 'domaines', label: 'Domaines', iconLine: 'fr-icon-global-line', iconFill: 'fr-icon-global-fill', enabled: false },
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
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Administration', href: '/admin/utilisateurs' },
          { label: currentTabLabel ?? '', current: true },
        ]}
      />

      <div className="fr-mb-4w">
        <h1 className="fr-h2 fr-mb-1w">Administration</h1>
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Gérez les utilisateurs, groupes, tâches et domaines de la plateforme
        </p>
      </div>

      <Tabnav breakpoint="md" currentLabel={currentTabLabel}>
        {tabs.map((tab) => (
          <TabnavItem
            key={tab.id}
            to={`/admin/${tab.id}`}
            icon={tab.iconLine}
            iconActive={tab.iconFill}
            active={activeTab === tab.id}
            disabled={!tab.enabled}
          >
            {tab.label}
          </TabnavItem>
        ))}
      </Tabnav>

      <TabActivityPanel mode={activeTab === 'utilisateurs' ? 'visible' : 'hidden'}>
        <AdminUtilisateurs />
      </TabActivityPanel>
      <TabActivityPanel mode={activeTab === 'groupes' ? 'visible' : 'hidden'}>
        <ComingSoon label="Gestion des groupes" />
      </TabActivityPanel>
      <TabActivityPanel mode={activeTab === 'taches' ? 'visible' : 'hidden'}>
        <ComingSoon label="Gestion des tâches" />
      </TabActivityPanel>
      <TabActivityPanel mode={activeTab === 'domaines' ? 'visible' : 'hidden'}>
        <ComingSoon label="Gestion des domaines" />
      </TabActivityPanel>
    </div>
  );
}
