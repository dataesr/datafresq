import cn from 'classnames';
import { Activity, Suspense } from 'react';
import { Link, useParams } from 'react-router';
import { useProgram } from '@/api/programs';
import AddToWorkspace from '@/components/AddToWorkspace';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import FullPageLoader from '@/components/FullPageLoader';
import type { Program } from '~/schemas/programs';
import Debouches from './components/Debouches';
import Effectifs from './components/Effectifs';
import Etablissement from './components/Etablissement';
import FicheAdministrative from './components/FicheAdministrative';
import Insersup from './components/Insersup';
import ParcoursOrganisation from './components/Parcours';

interface TabErrorFallbackProps {
  tabName: string;
  resetError: () => void;
}

function TabErrorFallback({ tabName, resetError }: TabErrorFallbackProps) {
  return (
    <div className="fr-callout fr-callout--red-marianne fr-my-4w">
      <h3 className="fr-callout__title">Erreur dans l'onglet {tabName}</h3>
      <p className="fr-callout__text">
        Une erreur s'est produite lors du chargement de cet onglet. Les autres onglets restent
        accessibles.
      </p>
      <button type="button" className="fr-btn fr-btn--secondary fr-mt-2w" onClick={resetError}>
        Réessayer
      </button>
    </div>
  );
}

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
      hide: !formation.parcours?.length,
    },
    {
      id: 'effectifs',
      label: 'Effectifs étudiants',
      iconLine: 'fr-icon-team-line',
      iconFill: 'fr-icon-team-fill',
    },
    {
      id: 'insertion',
      label: 'Insertion professionnelle',
      iconLine: 'fr-icon-briefcase-line',
      iconFill: 'fr-icon-briefcase-fill',
    },
    {
      id: 'debouches',
      label: 'Débouchés',
      iconLine: 'fr-icon-compass-3-line',
      iconFill: 'fr-icon-compass-3-fill',
    },
  ].filter((tab) => !tab.hide);

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullPageLoader />}>
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
                  <Link className="fr-breadcrumb__link" to="/formations">
                    Explorer les formations
                  </Link>
                </li>
                <li>
                  <span className="fr-breadcrumb__link" aria-current="page">
                    {formation.label}
                  </span>
                </li>
              </ol>
            </div>
          </nav>

          <div>
            <div
              className="fr-mb-1w"
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <ul className="fr-badges-group" style={{ flexGrow: 1 }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://fresq.enseignementsup.gouv.fr/diplomes/stock/${formation.collectionId}/${formation.recordId}`}
                  className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
                >
                  Voir sur fresq Ref
                </a>
                <AddToWorkspace formationIds={[formation.inf]} />
              </div>
            </div>
            <h1 className="fr-h3 fr-mb-1w" style={{ flexGrow: 1 }}>
              {formation.label}
            </h1>
            <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
              {formation.etablissements?.map((etab, index: number) => (
                <span key={etab.uai}>
                  {index > 0 && <br />}
                  {etab.name}
                </span>
              ))}
            </p>
          </div>

          <nav
            className={cn('fr-nav', 'fx-nav--horizontal', 'fx-nav--sticky')}
            aria-label="Navigation de la formation"
          >
            <ul className="fr-nav__list">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id} className="fr-nav__item">
                    <Link
                      className="fr-nav__link"
                      aria-current={isActive ? 'page' : undefined}
                      to={`/formations/${inf}/${tab.id}`}
                      replace
                    >
                      <span
                        className={cn(
                          'fr-icon--sm fr-mr-1w',
                          isActive ? tab.iconFill : tab.iconLine,
                        )}
                        aria-hidden="true"
                      />
                      {tab.label} {tab.count ? `(${tab.count})` : ''}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Suspense fallback={<FullPageLoader />}>
            <Activity mode={activeTab === 'informations' ? 'visible' : 'hidden'}>
              <ErrorBoundary
                fallback={({ resetError }) => (
                  <TabErrorFallback tabName="Informations générales" resetError={resetError} />
                )}
              >
                <FicheAdministrative formation={formation} />
                <div className="fr-mt-6w">
                  <Etablissement
                    etabs={formation.etablissements}
                    locations={formation.locations}
                    isVisible={activeTab === 'informations'}
                  />
                </div>
              </ErrorBoundary>
            </Activity>

            {formation.parcours?.length > 0 && (
              <Activity mode={activeTab === 'parcours' ? 'visible' : 'hidden'}>
                <ErrorBoundary
                  fallback={({ resetError }) => (
                    <TabErrorFallback tabName="Parcours" resetError={resetError} />
                  )}
                >
                  <ParcoursOrganisation
                    parcours={formation.parcours}
                    etapes={formation.etapes}
                    locations={formation.locations}
                    isVisible={activeTab === 'parcours'}
                  />
                </ErrorBoundary>
              </Activity>
            )}

            <Activity mode={activeTab === 'effectifs' ? 'visible' : 'hidden'}>
              <ErrorBoundary
                fallback={({ resetError }) => (
                  <TabErrorFallback tabName="Effectifs étudiants" resetError={resetError} />
                )}
              >
                <Effectifs siseData={data.sise} />
              </ErrorBoundary>
            </Activity>

            <Activity mode={activeTab === 'insertion' ? 'visible' : 'hidden'}>
              <ErrorBoundary
                fallback={({ resetError }) => (
                  <TabErrorFallback tabName="Insertion professionnelle" resetError={resetError} />
                )}
              >
                <Insersup insersupData={data.insersup} />
              </ErrorBoundary>
            </Activity>

            <Activity mode={activeTab === 'debouches' ? 'visible' : 'hidden'}>
              <ErrorBoundary
                fallback={({ resetError }) => (
                  <TabErrorFallback tabName="Débouchés professionnels" resetError={resetError} />
                )}
              >
                <Debouches
                  romeInfos={Array.isArray(formation?.romeInfos) ? formation.romeInfos : []}
                />
              </ErrorBoundary>
            </Activity>
          </Suspense>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
