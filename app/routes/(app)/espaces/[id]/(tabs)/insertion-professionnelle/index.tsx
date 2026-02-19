import { Activity, memo, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useWorkspaceAggregations, useWorkspacePermissions } from '@/api/workspaces';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import '@/components/charts/highcharts';
import {
  EmploymentRateByGenderChart,
  EmploymentRateChart,
  EmploymentRateEvolutionChart,
  EmploymentStabilityChart,
  EmploymentStabilityEvolutionChart,
  EmptyState,
  PRIVACY_THRESHOLD,
} from '@/components/insersup';
import { NoDataMessage } from '@/components/NoDataMessage';
import { YearSelector } from '@/components/YearSelector';
import type { InsersupYearStats } from '~/schemas/aggregations';
import { EmptyWorkspace } from '../components/EmptyWorkspace';
import { EmploymentRateQuantileChart } from './components/EmploymentRateQuantileChart';
import { InsersupStatsCards } from './components/InsersupStatsCards';
import { ProgramsTable } from './components/ProgramsTable';

type YearContentProps = {
  yearData: InsersupYearStats;
  year: string;
  programCount: number;
};

const YearContent = memo(function YearContent({ yearData, year, programCount }: YearContentProps) {
  return (
    <>
      <InsersupStatsCards yearData={yearData} programs={programCount} />
      {yearData.nbSortants < PRIVACY_THRESHOLD ? (
        <NoDataMessage
          icon="fr-icon-lock-line"
          message={`Les taux d'emploi ne peuvent pas être affichés pour cette promotion car le nombre de sortants (${yearData.nbSortants}) est inférieur à 20.`}
        />
      ) : (
        <>
          <AutoGrid min={500}>
            <EmploymentRateChart yearData={yearData} year={year} />
            <EmploymentRateQuantileChart yearData={yearData} year={year} />
            <EmploymentStabilityChart yearData={yearData} year={year} />
            <EmploymentRateByGenderChart yearData={yearData} year={year} />
          </AutoGrid>

          <ProgramsTable yearData={yearData} />
        </>
      )}
    </>
  );
});

type EvolutionContentProps = {
  sortedByYear: InsersupYearStats[];
};

const EvolutionContent = memo(function EvolutionContent({ sortedByYear }: EvolutionContentProps) {
  return (
    <AutoGrid min={600}>
      <EmploymentRateEvolutionChart sortedByYear={sortedByYear} />
      <EmploymentStabilityEvolutionChart sortedByYear={sortedByYear} />
    </AutoGrid>
  );
});

function useCanShowEvolution(sortedByYear: InsersupYearStats[]) {
  return useMemo(() => {
    const cohortsWithData = sortedByYear.filter(
      (y) => y.emploiSalFr !== null && y.nbSortants >= PRIVACY_THRESHOLD,
    );
    return cohortsWithData.length >= 2;
  }, [sortedByYear]);
}

export default function InsertionProfessionnelle() {
  const { id: workspaceId = '' } = useParams<{ id: string }>();
  const { data: aggregations } = useWorkspaceAggregations(workspaceId);
  const { canEdit } = useWorkspacePermissions(workspaceId);

  const insersupAggregations = aggregations?.insersupAggregations;

  const availableYears = useMemo(
    () =>
      insersupAggregations?.byYear
        .map((y: InsersupYearStats) => y.promo)
        .sort((a: string, b: string) => b.localeCompare(a)) ?? [],
    [insersupAggregations?.byYear],
  );

  const yearDataMap = useMemo(() => {
    const map = new Map<string, InsersupYearStats>();
    if (insersupAggregations?.byYear) {
      for (const yearStats of insersupAggregations.byYear) {
        map.set(yearStats.promo, yearStats);
      }
    }
    return map;
  }, [insersupAggregations?.byYear]);

  const sortedByYear = useMemo(
    () => [...(insersupAggregations?.byYear ?? [])].sort((a, b) => a.promo.localeCompare(b.promo)),
    [insersupAggregations?.byYear],
  );

  const canShowEvolution = useCanShowEvolution(sortedByYear);

  const [selectedYear, setSelectedYear] = useState<string | null>(() => availableYears[0] || null);

  if (aggregations.programCount === 0) {
    return (
      <EmptyWorkspace
        description="Cet espace de travail ne contient pas encore de formations."
        canEdit={canEdit}
      />
    );
  }

  if (!insersupAggregations || insersupAggregations.byYear.length === 0) {
    return (
      <EmptyState message="Aucune donnée d'insertion professionnelle disponible pour cet espace." />
    );
  }

  return (
    <div className="fr-pb-4w">
      <YearSelector
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        disableEvolution={!canShowEvolution}
        disableEvolutionTooltip="Pas assez de cohortes pour afficher l'évolution (minimum 2 requises)"
      />
      <hr />

      {availableYears.map((year: string) => {
        const yearData = yearDataMap.get(year);
        if (!yearData) return null;
        return (
          <Activity key={year} mode={selectedYear === year ? 'visible' : 'hidden'}>
            <YearContent yearData={yearData} year={year} programCount={aggregations.programCount} />
          </Activity>
        );
      })}

      <Activity mode={selectedYear === null ? 'visible' : 'hidden'}>
        <EvolutionContent sortedByYear={sortedByYear} />
      </Activity>
    </div>
  );
}
