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
import { MONTH_KEYS, MONTHS, PRIVACY_THRESHOLD } from './constants';

interface YearStatsForStability {
  nbSortants: number;
  emploiSalFr: EmploymentCounts | null;
  emploiStable: EmploymentCounts | null;
}

interface EmploymentStabilityChartProps {
  yearData: YearStatsForStability;
  year: string;
}

function useStabilityData(yearData: YearStatsForStability) {
  return useMemo(() => {
    if (
      !yearData.emploiSalFr ||
      !yearData.emploiStable ||
      yearData.nbSortants < PRIVACY_THRESHOLD
    ) {
      return null;
    }

    const stableRateData: (number | null)[] = [];

    for (const month of MONTH_KEYS) {
      const salCount = yearData.emploiSalFr[month];
      const stableCount = yearData.emploiStable[month];

      if (salCount === null || stableCount === null || salCount === 0) {
        stableRateData.push(null);
      } else {
        const stableShare = Math.round((stableCount / salCount) * 100);
        stableRateData.push(stableShare);
      }
    }

    return stableRateData;
  }, [yearData]);
}

/**
 * Employment stability chart showing the share of stable employment (CDI/fonctionnaire)
 * among salaried employment for a given year as a line chart
 */
export function EmploymentStabilityChart({ yearData, year }: EmploymentStabilityChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const stableRateData = useStabilityData(yearData);

  const hasData = stableRateData !== null;

  return (
    <AnalyticsGraph
      title={`Part d'emploi stable - ${year}`}
      description="Part des CDI/fonctionnaires parmi les emplois salariés"
      chartRef={hasData ? chartRef : undefined}
      source="InserSup (MESR)"
    >
      <BlurredNoData
        noData={!hasData}
        message="Données insuffisantes pour afficher la part d'emploi stable."
      >
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
          <YAxis min={0} max={100} title={{ text: "Part d'emploi stable (%)" }} />
          <Line.Series
            data={stableRateData ?? [null, null, null, null, null]}
            options={{
              name: 'Emploi stable (CDI/fonctionnaire)',
              color: getChartColor('green-archipel'),
              marker: { enabled: true },
            }}
          />
        </Chart>
      </BlurredNoData>
    </AnalyticsGraph>
  );
}
