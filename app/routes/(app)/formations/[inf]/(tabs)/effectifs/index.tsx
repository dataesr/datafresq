import { Activity, useMemo, useState } from 'react';
import { EffectifsEvolutionChart, EmptyState } from '@/components/effectifs';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import { YearSelector } from '@/components/YearSelector';
import type { ProgramSiseStats, ProgramSiseYearStats } from '~/schemas/programs';
import { CityChart } from './components/CityChart';
import { EffectifsStatsCards } from './components/EffectifsStatsCards';
import { StudyYearChart } from './components/StudyYearChart';

interface EffectifsProps {
  siseData: ProgramSiseStats;
}

export default function Effectifs({ siseData }: EffectifsProps) {
  const { byYear } = siseData;

  const availableYears = useMemo(
    () => byYear.map((y) => y.year).sort((a, b) => b.localeCompare(a)),
    [byYear],
  );

  const yearDataMap = useMemo(() => {
    const map = new Map<string, ProgramSiseYearStats>();
    for (const yearStats of byYear) {
      map.set(yearStats.year, yearStats);
    }
    return map;
  }, [byYear]);

  const canShowEvolution = byYear.length > 1;

  const evolutionData = useMemo(() => {
    const sorted = [...byYear].sort((a, b) => a.year.localeCompare(b.year));
    return {
      years: sorted.map((y) => y.year),
      totalTrend: sorted.map((y) => y.total),
      womenTrend: sorted.map((y) => y.women),
      menTrend: sorted.map((y) => y.men),
    };
  }, [byYear]);

  const [selectedYear, setSelectedYear] = useState<string | null>(() => availableYears[0] || null);

  if (byYear.length === 0) {
    return (
      <section id="effectifs">
        <EmptyState />
      </section>
    );
  }

  return (
    <section id="effectifs">
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

        {availableYears.map((year) => {
          const yearData = yearDataMap.get(year);
          if (!yearData) return null;

          return (
            <Activity key={year} mode={selectedYear === year ? 'visible' : 'hidden'}>
              <EffectifsStatsCards
                total={yearData.total}
                women={yearData.women}
                men={yearData.men}
              />

              <AutoGrid min={500}>
                {yearData.byStudyYear.length > 1 && (
                  <StudyYearChart
                    categories={yearData.byStudyYear.map((d) => d.key)}
                    women={yearData.byStudyYear.map((d) => d.women)}
                    men={yearData.byStudyYear.map((d) => d.men)}
                    latestYear={yearData.year}
                  />
                )}

                {yearData.byCity.length > 1 && (
                  <CityChart
                    categories={yearData.byCity.map((d) => d.key)}
                    women={yearData.byCity.map((d) => d.women)}
                    men={yearData.byCity.map((d) => d.men)}
                    latestYear={yearData.year}
                  />
                )}
              </AutoGrid>
            </Activity>
          );
        })}

        <Activity mode={selectedYear ? 'hidden' : 'visible'}>
          <AutoGrid min={600}>
            <EffectifsEvolutionChart
              years={evolutionData.years}
              totalTrend={evolutionData.totalTrend}
              womenTrend={evolutionData.womenTrend}
              menTrend={evolutionData.menTrend}
            />
          </AutoGrid>
        </Activity>
      </div>
    </section>
  );
}
