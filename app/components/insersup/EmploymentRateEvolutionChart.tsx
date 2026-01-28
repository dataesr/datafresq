import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import { useMemo, useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { getChartColor } from '@/components/highcharts';
import type { EmploymentCounts } from '~/schemas/aggregations';
import { BlurredNoData } from './BlurredNoData';
import { COHORT_COLORS, MONTHS, PRIVACY_THRESHOLD } from './constants';
import { countsToPercentages, ratesToArrayWithTrailingNulls } from './utils';

interface YearStatsForEvolution {
  promo: string;
  nbSortants: number;
  emploiSalFr: EmploymentCounts | null;
}

interface EmploymentRateEvolutionChartProps {
  sortedByYear: YearStatsForEvolution[];
}

function useCohortsWithData(sortedByYear: YearStatsForEvolution[]) {
  return useMemo(() => {
    return sortedByYear
      .filter((y) => y.emploiSalFr !== null && y.nbSortants >= PRIVACY_THRESHOLD)
      .sort((a, b) => b.promo.localeCompare(a.promo));
  }, [sortedByYear]);
}

export function EmploymentRateEvolutionChart({ sortedByYear }: EmploymentRateEvolutionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const cohortsWithData = useCohortsWithData(sortedByYear);

  const hasData = cohortsWithData.length > 1;

  const noDataMessage =
    cohortsWithData.length === 0
      ? "Aucune cohorte n'a un effectif suffisant pour afficher les taux d'emploi."
      : 'Une seule cohorte disponible. Le graphique de comparaison nécessite au moins 2 cohortes.';

  return (
    <AnalyticsGraph
      title="Comparaison des cohortes"
      description="Taux d'emploi salarié en France par promotion"
      chartRef={hasData ? chartRef : undefined}
      source="InserSup (MESR)"
    >
      <BlurredNoData noData={!hasData} message={noDataMessage}>
        <Chart ref={chartRef}>
          <Credits enabled={false} />
          <Legend align="center" />
          <Tooltip shared valueSuffix="%" />
          <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
          <YAxis min={0} max={100} title={{ text: "Taux d'emploi salarié (%)" }} />
          {cohortsWithData.map((cohort, index) => {
            const cohortPercentages = countsToPercentages(cohort.emploiSalFr, cohort.nbSortants);
            return (
              <Line.Series
                key={cohort.promo}
                data={ratesToArrayWithTrailingNulls(cohortPercentages)}
                options={{
                  name: `Promo ${cohort.promo}`,
                  color: getChartColor(
                    COHORT_COLORS[index % COHORT_COLORS.length] || 'green-archipel',
                  ),
                  marker: { enabled: true },
                }}
              />
            );
          })}
        </Chart>
      </BlurredNoData>
    </AnalyticsGraph>
  );
}
