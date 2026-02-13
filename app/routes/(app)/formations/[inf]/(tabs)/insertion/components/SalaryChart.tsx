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
import { MONTH_KEYS, MONTHS } from '@/components/insersup';
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
    <ChartBox
      title="Distribution des salaires"
      description={`Quartiles du salaire net mensuel (Q1, médiane, Q3) pour la promotion ${year}, de 6 à 30 mois après l'obtention du diplôme.`}
      chartRef={chartRef}
      source="insersup"
      tooltip={
        <span>
          Quartiles du salaire net mensuel calculés sur les diplômés en emploi salarié à chaque échéance.
          {' '}<Link to="/guide/indicateurs/salaires">En savoir plus</Link> sur le calcul des salaires.
        </span>
      }
      noData={!hasData ? { message: 'Données de salaire insuffisantes pour cette promotion.', icon: 'fr-icon-money-euro-circle-line' } : undefined}
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
    </ChartBox>
  );
}
