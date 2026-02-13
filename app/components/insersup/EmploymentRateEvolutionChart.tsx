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
import { Link } from 'react-router';
import { ChartBox } from '@/components/charts/ChartBox';
import { getChartColor } from '@/components/charts/highcharts/colors';
import type { EmploymentCounts } from '~/schemas/aggregations';
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
    <ChartBox
      title="Comparaison des cohortes"
      description="Évolution comparée du taux d'emploi salarié en France pour chaque promotion de diplômés, de 6 à 30 mois après l'obtention du diplôme."
      chartRef={chartRef}
      source="insersup"
      tooltip={
        <span>
          Taux d'emploi salarié calculé pour chaque promotion de diplômés, permettant la comparaison inter-cohortes.
          {' '}<Link to="/guide/indicateurs/emploi">En savoir plus</Link> sur le calcul des taux d'emploi.
        </span>
      }
      noData={!hasData ? { message: noDataMessage } : undefined}
    >
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
    </ChartBox>
  );
}
