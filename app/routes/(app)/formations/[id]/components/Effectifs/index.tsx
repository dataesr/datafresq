import { Activity, useMemo, useState } from 'react';
import { EffectifsEvolutionChart, EmptyState } from '@/components/effectifs';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import PillsTitle from '@/components/PillsTitle';
import { YearSelector } from '@/components/YearSelector';
import type { SiseRecord } from '~/schemas/programs';
import { CityChart } from './components/CityChart';
import { EffectifsStatsCards } from './components/EffectifsStatsCards';
import { StudyYearChart } from './components/StudyYearChart';
import { type SiseYearStats, useSiseStats } from './useSiseStats';

interface EffectifsProps {
  siseData: SiseRecord[];
}

export default function Effectifs({ siseData }: EffectifsProps) {
  const stats = useSiseStats(siseData);

  // Available years sorted descending (most recent first)
  const availableYears = useMemo(
    () => [...stats.years].sort((a, b) => b.localeCompare(a)),
    [stats.years],
  );

  // Year data map for quick lookup
  const yearDataMap = useMemo(() => {
    const map = new Map<string, SiseYearStats>();
    for (const yearStats of stats.byYear) {
      map.set(yearStats.year, yearStats);
    }
    return map;
  }, [stats.byYear]);

  const canShowEvolution = stats.showEvolutionChart;

  const [selectedYear, setSelectedYear] = useState<string | null>(() => availableYears[0] || null);

  if (!stats.hasData) {
    return (
      <section id="effectifs">
        <PillsTitle as="h2" icon="fr-icon-group-line">
          Effectifs étudiants
        </PillsTitle>
        <EmptyState />
      </section>
    );
  }

  return (
    <section id="effectifs">
      <PillsTitle as="h2" icon="fr-icon-group-line">
        Effectifs étudiants
      </PillsTitle>

      <div>
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          legend="Choix de l'année"
          hint="Afficher les données pour une année spécifique ou l'évolution à travers les années"
          disableEvolution={!canShowEvolution}
          disableEvolutionTooltip="Pas assez d'années pour afficher l'évolution (minimum 2 requises)"
        />

        {/* Year Views - one Activity per year, only the selected one is visible */}
        {availableYears.map((year) => {
          const yearData = yearDataMap.get(year);
          if (!yearData) return null;

          return (
            <Activity key={year} mode={selectedYear === year ? 'visible' : 'hidden'}>
              <EffectifsStatsCards
                year={yearData.year}
                total={yearData.total}
                women={yearData.women}
                men={yearData.men}
              />

              <AutoGrid min={500}>
                {yearData.showStudyYearChart && (
                  <StudyYearChart
                    categories={yearData.studyYearData.categories}
                    women={yearData.studyYearData.women}
                    men={yearData.studyYearData.men}
                    latestYear={yearData.year}
                  />
                )}

                {yearData.showCityChart && (
                  <CityChart
                    categories={yearData.cityData.categories}
                    women={yearData.cityData.women}
                    men={yearData.cityData.men}
                    latestYear={yearData.year}
                  />
                )}
              </AutoGrid>
            </Activity>
          );
        })}

        {/* Evolution View - shown when no specific year is selected */}
        <Activity mode={selectedYear ? 'hidden' : 'visible'}>
          <AutoGrid min={600}>
            <EffectifsEvolutionChart
              years={stats.years}
              totalTrend={stats.totalTrend}
              womenTrend={stats.womenTrend}
              menTrend={stats.menTrend}
            />
          </AutoGrid>
        </Activity>
      </div>
    </section>
  );
}
