import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Bar } from '@highcharts/react/series';
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
      values: filtered.map((d) => d.total),
    };
  }, [data, limit]);
}

interface LargeDisciplineChartProps {
  data: KeyedBreakdown[];
  year: string;
  limit?: number;
}

export function LargeDisciplineChart({ data, year, limit = 10 }: LargeDisciplineChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) return null;

  return (
    <ChartBox
      title="Grandes disciplines"
      description={`Rentrée ${year}. Classement des grandes disciplines avec le plus d'étudiants inscrits.`}
      chartRef={chartRef}
      source="sise"
      height={Math.max(300, categories.length * 40)}
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend enabled={false} />
        <Tooltip valueSuffix=" étudiants" />
        <XAxis type="category" categories={categories} />
        <YAxis min={0} allowDecimals={false} title={{ text: '' }} />
        <Bar.Series
          data={values}
          options={{
            name: 'Étudiants',
            color: getChartColor('purple-glycine'),
            dataLabels: { enabled: true, format: '{y}' },
          }}
        />
      </Chart>
    </ChartBox>
  );
}
