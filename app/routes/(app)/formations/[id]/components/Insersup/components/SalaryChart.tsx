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
import { BlurredNoData, MONTH_KEYS, MONTHS } from '@/components/insersup';
import type { InsersupYearStats } from '~/schemas/programs';

interface SalaryChartProps {
  yearData: InsersupYearStats;
  year: string;
}

function useSalaryData(yearData: InsersupYearStats) {
  return useMemo(() => {
    if (!yearData.salaires) return null;

    const salaires = yearData.salaires;

    const q1Data: (number | null)[] = [];
    const medianData: (number | null)[] = [];
    const q3Data: (number | null)[] = [];
    let hasAnyData = false;

    for (const month of MONTH_KEYS) {
      const monthData = salaires[month];
      if (
        monthData &&
        monthData.q1 !== null &&
        monthData.q3 !== null &&
        monthData.median !== null
      ) {
        q1Data.push(monthData.q1);
        medianData.push(monthData.median);
        q3Data.push(monthData.q3);
        hasAnyData = true;
      } else {
        q1Data.push(null);
        medianData.push(null);
        q3Data.push(null);
      }
    }

    if (!hasAnyData) return null;

    return { q1Data, medianData, q3Data };
  }, [yearData]);
}

export function SalaryChart({ yearData, year }: SalaryChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const salaryData = useSalaryData(yearData);

  const hasData = salaryData !== null;

  return (
    <AnalyticsGraph
      title={`Distribution des salaires - ${year}`}
      description="Quartiles de salaire net mensuel (Q1, médiane, Q3)"
      chartRef={hasData ? chartRef : undefined}
      source="InserSup (MESR)"
    >
      <BlurredNoData
        noData={!hasData}
        icon="fr-icon-money-euro-circle-line"
        message="Données de salaire insuffisantes pour cette promotion."
      >
        <Chart ref={chartRef}>
          <Credits enabled={false} />
          <Legend align="center" />
          <Tooltip shared valuePrefix="" valueSuffix=" €" />
          <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
          <YAxis
            min={0}
            title={{ text: 'Salaire net mensuel (€)' }}
            labels={{ format: '{value} €' }}
          />
          <Line.Series
            data={salaryData?.q1Data ?? [null, null, null, null, null]}
            options={{
              name: 'Q1 (25e percentile)',
              color: getChartColor('blue-cumulus'),
              dashStyle: 'Dash',
              lineWidth: 1,
              marker: { enabled: true, symbol: 'circle', radius: 3 },
            }}
          />
          <Line.Series
            data={salaryData?.medianData ?? [null, null, null, null, null]}
            options={{
              name: 'Médiane',
              color: getChartColor('green-archipel'),
              lineWidth: 3,
              marker: { enabled: true, symbol: 'circle', radius: 4 },
            }}
          />
          <Line.Series
            data={salaryData?.q3Data ?? [null, null, null, null, null]}
            options={{
              name: 'Q3 (75e percentile)',
              color: getChartColor('purple-glycine'),
              dashStyle: 'Dash',
              lineWidth: 1,
              marker: { enabled: true, symbol: 'circle', radius: 3 },
            }}
          />
        </Chart>
      </BlurredNoData>
    </AnalyticsGraph>
  );
}
