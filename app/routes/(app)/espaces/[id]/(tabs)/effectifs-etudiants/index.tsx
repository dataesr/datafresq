import { Activity, memo, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useWorkspaceAggregations, useWorkspacePermissions } from '@/api/workspaces';
import { EffectifsEvolutionChart, EmptyState } from '@/components/effectifs';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import '@/components/charts/highcharts';
import { YearSelector } from '@/components/YearSelector';
import type { SiseYearStats } from '~/schemas/aggregations';
import { EmptyWorkspace } from '../components/EmptyWorkspace';
import { AcademyDistributionChart } from './components/AcademyDistributionChart';
import { CycleDistributionChart } from './components/CycleDistributionChart';
import { DiplomaDistributionChart } from './components/DiplomaDistributionChart';
import { DisciplineDistributionChart } from './components/DisciplineDistributionChart';
import { DisciplineSpiderChart } from './components/DisciplineSpiderChart';
import { ProgramsTable } from './components/ProgramsTable';
import { RegionChoroplethMap } from './components/RegionChoroplethMap';
import { StudentsStatsCards } from './components/StudentsStatsCards';

type YearContentProps = {
  yearData: SiseYearStats;
  totalPrograms: number;
};

const YearContent = memo(function YearContent({ yearData, totalPrograms }: YearContentProps) {
  return (
    <>
      <StudentsStatsCards
        programs={totalPrograms}
        totalPrograms={yearData.totalPrograms}
        totalStudents={yearData.totalStudents}
        totalFemale={yearData.totalFemale}
        totalMale={yearData.totalMale}
      />

      <AutoGrid min={500}>
        {yearData.byCycle && yearData.byCycle.length > 0 && (
          <CycleDistributionChart data={yearData.byCycle} year={yearData.year} />
        )}

        {yearData.byDiploma && yearData.byDiploma.length > 0 && (
          <DiplomaDistributionChart data={yearData.byDiploma} year={yearData.year} />
        )}

        {yearData.byAcademy && yearData.byAcademy.length > 0 && (
          <AcademyDistributionChart data={yearData.byAcademy} year={yearData.year} />
        )}

        {yearData.byRegion && yearData.byRegion.length > 0 && (
          <RegionChoroplethMap data={yearData.byRegion} year={yearData.year} />
        )}

        {yearData.byLargeDiscipline && yearData.byLargeDiscipline.length > 2 && (
          <DisciplineSpiderChart data={yearData.byLargeDiscipline} year={yearData.year} />
        )}

        {yearData.byDiscipline && yearData.byDiscipline.length > 0 && (
          <DisciplineDistributionChart data={yearData.byDiscipline} year={yearData.year} />
        )}
      </AutoGrid>

      <ProgramsTable yearData={yearData} />
    </>
  );
});

const EvolutionContent = memo(function EvolutionContent({ byYear }: { byYear: SiseYearStats[] }) {
  const sortedByYear = [...byYear].sort((a, b) => a.year.localeCompare(b.year));
  const years = sortedByYear.map((y) => y.year);
  const totalTrend = sortedByYear.map((y) => y.totalStudents);
  const womenTrend = sortedByYear.map((y) => y.totalFemale);
  const menTrend = sortedByYear.map((y) => y.totalMale);
  return (
    <AutoGrid min={600}>
      <EffectifsEvolutionChart
        years={years}
        totalTrend={totalTrend}
        womenTrend={womenTrend}
        menTrend={menTrend}
      />
    </AutoGrid>
  );
});

export default function EffectifsEtudiants() {
  const { id: workspaceId = '' } = useParams<{ id: string }>();
  const { data: aggregations } = useWorkspaceAggregations(workspaceId);
  const { canEdit } = useWorkspacePermissions(workspaceId);
  const studentsAggregations = aggregations?.studentsAggregations;
  const byYear = studentsAggregations?.byYear ?? [];

  const availableYears = useMemo(
    () =>
      byYear.map((y: SiseYearStats) => y.year).sort((a: string, b: string) => b.localeCompare(a)),
    [byYear],
  );

  const yearDataMap = useMemo(() => {
    const map = new Map<string, SiseYearStats>();
    for (const yearStats of byYear) {
      map.set(yearStats.year, yearStats);
    }
    return map;
  }, [byYear]);

  const canShowEvolution = byYear.length >= 2;

  const [selectedYear, setSelectedYear] = useState<string | null>(() => availableYears[0] || null);

  if (aggregations.programCount === 0) {
    return (
      <EmptyWorkspace
        description="Cet espace de travail ne contient pas encore de formations."
        canEdit={canEdit}
      />
    );
  }

  if (!studentsAggregations || byYear.length === 0) {
    return <EmptyState message="Aucune donnée d'effectifs étudiants disponible pour cet espace." />;
  }

  return (
    <div>
      <YearSelector
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        legend="Choix de la rentrée"
        hint="Afficher les données pour une rentrée spécifique ou l'évolution à travers les années"
        disableEvolution={!canShowEvolution}
        disableEvolutionTooltip="Pas assez d'années pour afficher l'évolution (minimum 2 requises)"
        maxYears={3}
      />
      <hr />

      {availableYears.map((year: string) => {
        const yearData = yearDataMap.get(year);
        if (!yearData) return null;
        return (
          <Activity key={year} mode={selectedYear === year ? 'visible' : 'hidden'}>
            <YearContent yearData={yearData} totalPrograms={aggregations.programCount} />
          </Activity>
        );
      })}

      <Activity mode={canShowEvolution && selectedYear === null ? 'visible' : 'hidden'}>
        <EvolutionContent byYear={byYear} />
      </Activity>
    </div>
  );
}
