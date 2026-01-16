import { Activity, useMemo, useState } from 'react';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import {
  EmploymentRateByGenderChart,
  EmploymentRateChart,
  EmploymentRateEvolutionChart,
  EmploymentStabilityChart,
  EmploymentStabilityEvolutionChart,
  EmptyState,
  PRIVACY_THRESHOLD,
  YearSelector,
} from '@/components/insersup';
import { NoDataMessage } from '@/components/NoDataMessage';
import PillsTitle from '@/components/PillsTitle';
import type { InsersupStats, InsersupYearStats } from '~/schemas/programs';
import { InsersupStatsCards } from './components/InsersupStatsCards';
import { SalaryByGenderChart } from './components/SalaryByGenderChart';
import { SalaryChart } from './components/SalaryChart';
import { SalaryEvolutionChart } from './components/SalaryEvolutionChart';

interface InsersupProps {
  insersupData: InsersupStats;
}

function useCanShowEvolution(sortedByYear: InsersupYearStats[]) {
  return useMemo(() => {
    const cohortsWithData = sortedByYear.filter(
      (y) => y.emploiSalFr !== null && y.nbSortants >= PRIVACY_THRESHOLD,
    );
    return cohortsWithData.length >= 2;
  }, [sortedByYear]);
}

export default function Insersup({ insersupData }: InsersupProps) {
  const availableYears = useMemo(
    () => insersupData.byYear.map((y) => y.promo).sort((a, b) => b.localeCompare(a)),
    [insersupData.byYear],
  );

  const yearDataMap = useMemo(() => {
    const map = new Map<string, InsersupYearStats>();
    for (const yearStats of insersupData.byYear) {
      map.set(yearStats.promo, yearStats);
    }
    return map;
  }, [insersupData.byYear]);

  const sortedByYear = useMemo(
    () => [...insersupData.byYear].sort((a, b) => a.promo.localeCompare(b.promo)),
    [insersupData.byYear],
  );

  const canShowEvolution = useCanShowEvolution(sortedByYear);

  const [selectedYear, setSelectedYear] = useState<string | null>(() => availableYears[0] || null);

  if (!insersupData || insersupData.byYear.length === 0) {
    return (
      <section id="insersup" className="formation-section">
        <PillsTitle as="h2" icon="fr-icon-briefcase-line">
          Insertion professionnelle
        </PillsTitle>
        <EmptyState />
      </section>
    );
  }

  return (
    <section id="insersup" className="formation-section">
      <PillsTitle as="h2" icon="fr-icon-briefcase-line">
        Insertion professionnelle
      </PillsTitle>

      <div>
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          disableEvolution={!canShowEvolution}
          disableEvolutionTooltip="Pas assez de cohortes pour afficher l'évolution (minimum 2 requises)"
        />

        {availableYears.map((year) => {
          const yearData = yearDataMap.get(year);
          if (!yearData) return null;

          return (
            <Activity key={year} mode={selectedYear === year ? 'visible' : 'hidden'}>
              <InsersupStatsCards yearData={yearData} />
              {yearData.nbSortants < PRIVACY_THRESHOLD ? (
                <NoDataMessage
                  icon="fr-icon-lock-line"
                  message={`Les taux d'emploi ne peuvent pas être affichés pour cette promotion car le nombre de sortants (${yearData.nbSortants}) est inférieur à 20.`}
                />
              ) : (
                <>
                  <AutoGrid min={600}>
                    <EmploymentRateChart yearData={yearData} year={year} />
                  </AutoGrid>

                  <AutoGrid>
                    <EmploymentStabilityChart yearData={yearData} year={year} />
                    <EmploymentRateByGenderChart yearData={yearData} year={year} />
                  </AutoGrid>

                  <AutoGrid>
                    <SalaryChart yearData={yearData} year={year} />
                    <SalaryByGenderChart yearData={yearData} year={year} />
                  </AutoGrid>
                </>
              )}
            </Activity>
          );
        })}

        <Activity mode={selectedYear ? 'hidden' : 'visible'}>
          <AutoGrid min={600}>
            <EmploymentRateEvolutionChart sortedByYear={sortedByYear} />
            <EmploymentStabilityEvolutionChart sortedByYear={sortedByYear} />
            <SalaryEvolutionChart sortedByYear={sortedByYear} />
          </AutoGrid>
        </Activity>
      </div>
    </section>
  );
}
