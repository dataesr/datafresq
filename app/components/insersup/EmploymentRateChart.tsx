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

/**
 * Employment rate chart showing employment rate evolution over time after graduation
 * Works with both program and workspace data
 */
export function EmploymentRateChart({ yearData, year }: EmploymentRateChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { canShow, emploiSalLine, emploiNonSalLine, nbSortants } = useEmploymentData(yearData);

  const noDataMessage = `Les taux d'emploi ne peuvent pas être affichés pour cette promotion car le nombre de sortants (${nbSortants}) est inférieur à 20.`;

  return (
    <AnalyticsGraph
      title={`Taux d'emploi - Promotion ${year}`}
      description="Évolution du taux d'emploi après l'obtention du diplôme"
      chartRef={canShow ? chartRef : undefined}
      source="InserSup (MESR)"
    >
      <BlurredNoData noData={!canShow} icon="fr-icon-lock-line" message={noDataMessage}>
        <Chart
          ref={chartRef}
          containerProps={{
            style: { width: '100%', minWidth: '200px', height: '350px' },
          }}
        >
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
      </BlurredNoData>
    </AnalyticsGraph>
  );
}
