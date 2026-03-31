import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Column } from '@highcharts/react/series';
import { useMemo, useRef } from 'react';
import { ChartBox } from '@/components/charts/ChartBox';
import { getChartColor } from '@/components/charts/highcharts/colors';
import type { KeyedBreakdown } from '~/schemas/etablissements';

function useChartData(data: KeyedBreakdown[], limit: number) {
  return useMemo(() => {
    const filtered = data
      .filter((d) => d.label && d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    return {
      hasData: filtered.length > 0,
      categories: filtered.map((d) => d.label),
      values: filtered.map((d) => ({ y: d.total, female: d.female, male: d.male })),
    };
  }, [data, limit]);
}

interface DiplomaDistributionChartProps {
  data: KeyedBreakdown[];
  year: string;
  limit?: number;
}

export function DiplomaDistributionChart({
  data,
  year,
  limit = 10,
}: DiplomaDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) return null;

  return (
    <ChartBox
      title="Effectifs par type de diplôme"
      description={`Rentrée ${year}. Répartition des étudiants inscrits par type de diplôme préparé.`}
      chartRef={chartRef}
      source="sise"
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend enabled={false} />
        <Tooltip valueSuffix=" étudiants" />
        <XAxis type="category" categories={categories} />
        <YAxis min={0} allowDecimals={false} title={{ text: "Nombre d'étudiants" }} />
        <Column.Series
          data={values}
          options={{
            name: 'Étudiants',
            color: getChartColor('blue-cumulus'),
            dataLabels: { enabled: true, format: '{y}' },
          }}
        />
      </Chart>
    </ChartBox>
  );
}
