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
import type { ProgramInsersupYearStats } from '../types';

interface SalaryByGenderChartProps {
  yearData: ProgramInsersupYearStats;
  year: string;
}

function useSalaryByGenderData(yearData: ProgramInsersupYearStats) {
  return useMemo(() => {
    const femme = yearData.byGender?.femme;
    const homme = yearData.byGender?.homme;

    if (!femme?.salaires && !homme?.salaires) return null;

    const femmeMedianData: (number | null)[] = [];
    const hommeMedianData: (number | null)[] = [];

    for (const month of MONTH_KEYS) {
      femmeMedianData.push(femme?.salaires?.[month]?.median ?? null);
      hommeMedianData.push(homme?.salaires?.[month]?.median ?? null);
    }

    const hasAnyData =
      femmeMedianData.some((d) => d !== null) || hommeMedianData.some((d) => d !== null);

    if (!hasAnyData) return null;

    return { femmeMedianData, hommeMedianData };
  }, [yearData]);
}

export function SalaryByGenderChart({ yearData, year }: SalaryByGenderChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const genderSalaryData = useSalaryByGenderData(yearData);

  const hasData = genderSalaryData !== null;

  return (
    <AnalyticsGraph
      title={`Comparaison des salaires F/H - ${year}`}
      description="Salaire net mensuel médian par genre"
      chartRef={hasData ? chartRef : undefined}
      source="InserSup (MESR)"
    >
      <BlurredNoData
        noData={!hasData}
        icon="fr-icon-money-euro-circle-line"
        message="Données insuffisantes pour comparer les salaires par genre."
      >
        <Chart
          ref={chartRef}
          containerProps={{
            style: { width: '100%', minWidth: '200px', height: '350px' },
          }}
        >
          <Credits enabled={false} />
          <Legend align="center" />
          <Tooltip shared valuePrefix="" valueSuffix=" €" />
          <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
          <YAxis
            min={0}
            title={{ text: 'Salaire net mensuel médian (€)' }}
            labels={{ format: '{value} €' }}
          />
          <Line.Series
            data={genderSalaryData?.femmeMedianData ?? [null, null, null, null, null]}
            options={{
              name: 'Femmes',
              color: getChartColor('pink-macaron'),
              lineWidth: 2,
              marker: { enabled: true, symbol: 'circle' },
            }}
          />
          <Line.Series
            data={genderSalaryData?.hommeMedianData ?? [null, null, null, null, null]}
            options={{
              name: 'Hommes',
              color: getChartColor('blue-cumulus'),
              lineWidth: 2,
              marker: { enabled: true, symbol: 'circle' },
            }}
          />
        </Chart>
      </BlurredNoData>
    </AnalyticsGraph>
  );
}
