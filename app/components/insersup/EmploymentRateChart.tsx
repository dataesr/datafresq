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
import { MONTHS, PRIVACY_THRESHOLD } from './constants';
import { countsToPercentages, ratesToArrayWithTrailingNulls } from './utils';

interface YearStatsForEmploymentRate {
  nbSortants: number;
  emploiSalFr: EmploymentCounts | null;
  emploiNonSal: EmploymentCounts | null;
}

interface EmploymentRateChartProps {
  yearData: YearStatsForEmploymentRate;
  year: string;
}

function useEmploymentData(yearData: YearStatsForEmploymentRate) {
  return useMemo(() => {
    const canShow = yearData.emploiSalFr !== null && yearData.nbSortants >= PRIVACY_THRESHOLD;

    const emploiSalLine = canShow
      ? countsToPercentages(yearData.emploiSalFr, yearData.nbSortants)
      : null;

    const emploiNonSalLine =
      canShow && yearData.emploiNonSal
        ? countsToPercentages(yearData.emploiNonSal, yearData.nbSortants)
        : null;

    return {
      canShow,
      emploiSalLine,
      emploiNonSalLine,
      nbSortants: yearData.nbSortants,
    };
  }, [yearData]);
}

export function EmploymentRateChart({ yearData, year }: EmploymentRateChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { canShow, emploiSalLine, emploiNonSalLine, nbSortants } = useEmploymentData(yearData);

  const noDataMessage = `Les taux d'emploi ne peuvent pas être affichés pour cette promotion car le nombre de sortants (${nbSortants}) est inférieur à 20.`;

  return (
    <ChartBox
      title="Taux d'emploi"
      description={`Évolution des taux d'emploi salariés et non salariés pour la promotion ${year}, de 6 à 30 mois après l'obtention du diplôme.`}
      chartRef={chartRef}
      source="insersup"
      tooltip={
        <span>
          Calculé en rapportant le nombre de diplômés en emploi au nombre total de sortants, à chaque échéance.
          {' '}<Link to="/guide/indicateurs/emploi">En savoir plus</Link> sur le calcul des taux d'emploi.
        </span>
      }
      noData={!canShow ? { message: noDataMessage, icon: 'fr-icon-lock-line' } : undefined}
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip shared valueSuffix="%" />
        <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
        <YAxis min={0} max={100} title={{ text: "Taux d'emploi (%)" }} />
        <Line.Series
          data={ratesToArrayWithTrailingNulls(emploiSalLine)}
          options={{
            name: 'Emploi salarié en France',
            color: getChartColor('green-archipel'),
            marker: { enabled: true },
          }}
        />
        {emploiNonSalLine && (
          <Line.Series
            data={ratesToArrayWithTrailingNulls(emploiNonSalLine)}
            options={{
              name: 'Emploi non salarié',
              color: getChartColor('blue-cumulus'),
              marker: { enabled: true },
            }}
          />
        )}
      </Chart>
    </ChartBox>
  );
}
