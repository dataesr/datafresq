import cn from 'classnames';
import { Suspense } from 'react';
import { useParams } from 'react-router';
import { useProgram } from '@/api/programs';
import { Breadcrumb } from '@/components/Breadcrumb';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import PageContentLoader from '@/components/loaders/PageContentLoader';
import { TabActivityPanel } from '@/components/TabActivityPanel';
import { Tabnav, TabnavItem } from '@/components/ui/Tabnav';
import type { Program } from '~/schemas/programs';

import DebouchesTab from './debouches';
import EffectifsTab from './effectifs';
import Informations from './informations';
import Insertion from './insertion';
import Parcours from './parcours';

const getAccreditationStatus = (accreditation: Program['accreditation']) => {
  if (!accreditation.endDate) return 'unknown';
  const endDate = new Date(accreditation.endDate);
  const now = new Date();
  const monthsUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (endDate < now) return 'expired';
  if (monthsUntilEnd < 6) return 'ending';
  return 'active';
};

export default function FormationPage() {
  const { inf, tab: activeTab = 'informations' } = useParams<{ inf: string; tab?: string }>();
  const { data } = useProgram(inf!);

  if (!data) return null;
  const { program: formation } = data;

  const status = getAccreditationStatus(formation.accreditation);

  const tabs = [
    {
      id: 'informations',
      label: 'Informations générales',
      iconLine: 'fr-icon-file-text-line',
      iconFill: 'fr-icon-file-text-fill',
    },
    {
      id: 'parcours',
      label: 'Parcours',
      iconLine: 'fr-icon-road-map-line',
      iconFill: 'fr-icon-road-map-fill',
      count: formation.parcours?.length || 0,
      disabled: !formation.parcours?.length,
    },
    {
      id: 'effectifs',
      label: 'Effectifs étudiants',
      iconLine: 'fr-icon-team-line',
      iconFill: 'fr-icon-team-fill',
      disabled: !data.sise?.byYear?.length,
    },
    {
      id: 'insertion',
      label: 'Insertion professionnelle',
      iconLine: 'fr-icon-briefcase-line',
      iconFill: 'fr-icon-briefcase-fill',
      disabled: !data.insersup?.byYear?.length,
    },
    {
      id: 'debouches',
      label: 'Débouchés',
      iconLine: 'fr-icon-compass-3-line',
      iconFill: 'fr-icon-compass-3-fill',
      disabled: !formation.romeInfos?.length,
    },
  ];

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageContentLoader />}>
        <div>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Formations', href: '/formations' },
              { label: formation.label, current: true },
            ]}
          />

          <div>
            <div className="fr-mb-1w fx-flex fx-justify-start fx-items-center fx-flex-wrap fx-gap-4w">
              <ul className="fr-badges-group fx-flex-grow">
                <li className="fr-badge fr-badge--sm">{formation.diploma.type}</li>
                <li
                  className={cn('fr-badge fr-badge--sm', {
                    'fr-badge--success': status === 'active',
                    'fr-badge--warning': status === 'ending' || status === 'unknown',
                    'fr-badge--error': status === 'expired',
                  })}
                >
                  {formation.accreditation.endDate
                    ? `Accréditée jusqu'en ${new Date(formation.accreditation.endDate).getFullYear()}`
                    : "Statut d'accréditation inconnu"}
                </li>
              </ul>
              <div className="fx-flex fx-items-center fx-gap-4w">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://fresq.enseignementsup.gouv.fr/diplomes/stock/${formation.collectionId}/${formation.recordId}`}
                  className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                >
                  Voir sur fresq Ref
                </a>
              </div>
            </div>
            <h1 className="fr-h3 fr-mb-1w fx-flex-grow">{formation.label}</h1>
            <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
              {formation.etablissements?.map((etab, index: number) => (
                <span key={etab.uai}>
                  {index > 0 && <br />}
                  {etab.name}
                </span>
              ))}
            </p>
          </div>

          <Tabnav breakpoint="md" currentLabel={tabs.find((tab) => tab.id === activeTab)?.label}>
            {tabs.map((tab) => (
              <TabnavItem
                key={tab.id}
                to={`/formations/${inf}/${tab.id}`}
                icon={tab.iconLine}
                iconActive={tab.iconFill}
                active={activeTab === tab.id}
                disabled={tab.disabled}
              >
                {tab.label} {tab.count ? `(${tab.count})` : ''}
              </TabnavItem>
            ))}
          </Tabnav>

          <TabActivityPanel mode={activeTab === 'informations' ? 'visible' : 'hidden'}>
            <Informations formation={formation} activeTab={activeTab} />
          </TabActivityPanel>

          <TabActivityPanel mode={activeTab === 'parcours' ? 'visible' : 'hidden'}>
            <Parcours
              parcours={formation.parcours ?? []}
              etapes={formation.etapes}
              locations={formation.locations}
            />
          </TabActivityPanel>

          <TabActivityPanel mode={activeTab === 'effectifs' ? 'visible' : 'hidden'}>
            <EffectifsTab siseData={data.sise} />
          </TabActivityPanel>

          <TabActivityPanel mode={activeTab === 'insertion' ? 'visible' : 'hidden'}>
            <Insertion insersupData={data.insersup} />
          </TabActivityPanel>

          <TabActivityPanel mode={activeTab === 'debouches' ? 'visible' : 'hidden'}>
            <DebouchesTab
              romeInfos={Array.isArray(formation?.romeInfos) ? formation.romeInfos : []}
            />
          </TabActivityPanel>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
