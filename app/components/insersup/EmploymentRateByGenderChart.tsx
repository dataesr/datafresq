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
import { getColorForSeries } from '@/components/highcharts';
import type { EmploymentCounts } from '~/schemas/aggregations';
import { BlurredNoData } from './BlurredNoData';
import { MONTHS, PRIVACY_THRESHOLD } from './constants';
import { countsToPercentages, ratesToArrayWithTrailingNulls } from './utils';

/**
 * Minimal interface for gender data that works with both program and workspace data
 */
interface GenderData {
  nbSortants: number;
  emploiSalFr: EmploymentCounts | null;
}

/**
 * Minimal interface for year stats that works with both program and workspace data
 * Only includes the fields actually needed for this chart
 */
interface YearStatsForGender {
  byGender: {
    femme: GenderData | null;
    homme: GenderData | null;
  };
}

interface EmploymentRateByGenderChartProps {
  yearData: YearStatsForGender;
  year: string;
}

function useGenderData(yearData: YearStatsForGender) {
  return useMemo(() => {
    const femme = yearData.byGender?.femme;
    const homme = yearData.byGender?.homme;

    const femmeSortants = femme?.nbSortants ?? 0;
    const hommeSortants = homme?.nbSortants ?? 0;

    const femmePercentages =
      femme?.emploiSalFr && femmeSortants >= PRIVACY_THRESHOLD
        ? countsToPercentages(femme.emploiSalFr, femmeSortants)
        : null;

    const hommePercentages =
      homme?.emploiSalFr && hommeSortants >= PRIVACY_THRESHOLD
        ? countsToPercentages(homme.emploiSalFr, hommeSortants)
        : null;

    const canShow = femmePercentages !== null && hommePercentages !== null;

    return {
      femmePercentages,
      hommePercentages,
      femmeSortants,
      hommeSortants,
      canShow,
    };
  }, [yearData]);
}

/**
 * Gender comparison chart showing employment rates for women vs men
 * Works with both program and workspace data
 */
export function EmploymentRateByGenderChart({ yearData, year }: EmploymentRateByGenderChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { femmePercentages, hommePercentages, femmeSortants, hommeSortants, canShow } =
    useGenderData(yearData);

  const noDataMessage = `Effectifs insuffisants (femmes: ${femmeSortants}, hommes: ${hommeSortants}).`;

  return (
    <AnalyticsGraph
      title={`Comparaison Femmes/Hommes - ${year}`}
      description="Taux d'emploi salarié par genre"
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
          <YAxis min={0} max={100} title={{ text: "Taux d'emploi salarié (%)" }} />
          <Line.Series
            data={ratesToArrayWithTrailingNulls(femmePercentages)}
            options={{
              name: `Femmes (${femmeSortants} sortantes)`,
              color: getColorForSeries('femmes'),
              marker: { enabled: true },
            }}
          />
          <Line.Series
            data={ratesToArrayWithTrailingNulls(hommePercentages)}
            options={{
              name: `Hommes (${hommeSortants} sortants)`,
              color: getColorForSeries('hommes'),
              marker: { enabled: true },
            }}
          />
        </Chart>
      </BlurredNoData>
    </AnalyticsGraph>
  );
}
