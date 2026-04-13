import { Activity, memo, Suspense, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useEtablissement } from '@/api/etablissements';
import '@/components/charts/highcharts';
import { Breadcrumb } from '@/components/Breadcrumb';
import { EffectifsEvolutionChart } from '@/components/effectifs/EffectifsEvolutionChart';
import { EmptyState } from '@/components/effectifs/EmptyState';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import PageContentLoader from '@/components/loaders/PageContentLoader';
import { YearSelector } from '@/components/YearSelector';
import type { EtablissementYearStats } from '~/schemas/etablissements';
import { CycleDistributionChart } from './components/CycleDistributionChart';
import { DiplomaDistributionChart } from './components/DiplomaDistributionChart';
import { LargeDisciplineChart } from './components/LargeDisciplineChart';
import { StatsCards } from './components/StatsCards';

// ============================================================================
// Sub-components
// ============================================================================

function SubtitleInfo({
  commune,
  departement,
  academie,
  region,
  offreUrl,
}: {
  commune: string | null;
  departement: string;
  academie: string;
  region: string;
  offreUrl: string;
}) {
  const parts = [commune, departement, academie ? `académie de ${academie}` : null, region].filter(
    Boolean,
  );

  if (!parts.length) return null;
  if (!offreUrl) {
    return (
      <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
        <span className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
        {parts.join(' · ')}
      </p>
    );
  }

  return (
    <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
      <span className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
      {parts.join(' · ')}
      {' · '}
      <Link className="fr-text--sm" to={offreUrl}>
        Voir l'offre de formation FRESQ{' '}
        <span className="fr-icon-arrow-right-line fr-icon--sm" aria-hidden="true" />
      </Link>
    </p>
  );
}

const YearContent = memo(function YearContent({ yearData }: { yearData: EtablissementYearStats }) {
  return (
    <>
      <StatsCards yearData={yearData} />
      <AutoGrid min={500}>
        {yearData.byCycle.length > 0 && (
          <CycleDistributionChart data={yearData.byCycle} year={yearData.year} />
        )}
        {yearData.byDiploma.length > 0 && (
          <DiplomaDistributionChart data={yearData.byDiploma} year={yearData.year} />
        )}
        {yearData.byLargeDiscipline.length > 0 && (
          <LargeDisciplineChart data={yearData.byLargeDiscipline} year={yearData.year} />
        )}
      </AutoGrid>
    </>
  );
});

const EvolutionContent = memo(function EvolutionContent({
  byYear,
}: {
  byYear: EtablissementYearStats[];
}) {
  const sorted = useMemo(() => [...byYear].sort((a, b) => a.year.localeCompare(b.year)), [byYear]);

  return (
    <AutoGrid min={600}>
      <EffectifsEvolutionChart
        years={sorted.map((y) => y.year)}
        totalTrend={sorted.map((y) => y.total)}
        womenTrend={sorted.map((y) => y.female)}
        menTrend={sorted.map((y) => y.male)}
      />
    </AutoGrid>
  );
});

// ============================================================================
// Main content (suspense boundary)
// ============================================================================

function EtablissementContent() {
  const { paysageId } = useParams<{ paysageId: string }>();
  const { data } = useEtablissement(paysageId!);

  const availableYears = useMemo(() => [...data!.years].sort((a, b) => b.localeCompare(a)), [data]);

  const yearDataMap = useMemo(() => {
    const map = new Map<string, EtablissementYearStats>();
    for (const yd of data!.byYear) {
      map.set(yd.year, yd);
    }
    return map;
  }, [data]);

  const canShowEvolution = availableYears.length >= 2;
  const [selectedYear, setSelectedYear] = useState<string | null>(() => availableYears[0] ?? null);

  if (!data) return null;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Établissements', href: '/etablissements' },
          { label: data.name, current: true },
        ]}
      />

      {/* Header */}
      <div className="fr-mb-3w">
        <div className="fr-mb-1w fx-flex fx-flex-wrap fx-gap-1w">
          {data.type && <p className="fr-badge fr-badge--sm">{data.type}</p>}
          {data.typologie && (
            <p className="fr-badge fr-badge--sm fr-badge--info">{data.typologie}</p>
          )}
        </div>
        <h1 className="fr-h3 fr-mb-1w">{data.name}</h1>
        <SubtitleInfo
          commune={data.commune}
          departement={data.departement}
          academie={data.academie}
          region={data.region}
          offreUrl={`/formations?paysageId=${data.paysageId}`}
        />
        <div className="fr-my-2w fr-callout fr-icon-alert-line fr-callout--yellow-moutarde">
          <p className="fr-callout__title fr-text--lg">Attention</p>
          <p className="fr-callout__text fr-text--md">
            Cette page permet d'explorer et de visualiser les effectifs d’étudiants inscrits dans
            l'établissement, à partir des données SISE.
            <br />
            Ces données couvrent l’ensemble des étudiants inscrits déclarés par l'établissement,
            au-delà du périmètre des formations reconnues de qualité recensées dans FRESQ.
          </p>
        </div>
      </div>

      {/* Data section */}
      {availableYears.length > 0 ? (
        <div>
          <YearSelector
            availableYears={availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            legend="Année universitaire"
            hint="Afficher les données pour une rentrée spécifique ou l'évolution à travers les années"
            disableEvolution={!canShowEvolution}
            disableEvolutionTooltip="Pas assez d'années pour afficher l'évolution (minimum 2 requises)"
            maxYears={4}
          />
          <hr />

          {availableYears.map((year) => {
            const yearData = yearDataMap.get(year);
            if (!yearData) return null;
            return (
              <Activity key={year} mode={selectedYear === year ? 'visible' : 'hidden'}>
                <YearContent yearData={yearData} />
              </Activity>
            );
          })}

          <Activity mode={canShowEvolution && selectedYear === null ? 'visible' : 'hidden'}>
            <EvolutionContent byYear={data.byYear} />
          </Activity>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// ============================================================================
// Page export
// ============================================================================

export default function EtablissementPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageContentLoader />}>
        <EtablissementContent />
      </Suspense>
    </ErrorBoundary>
  );
}
