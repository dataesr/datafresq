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
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { SISE_SOURCE_SHORT } from '@/components/effectifs';
import { getChartColor } from '@/components/highcharts';

interface DisciplineData {
  id: string;
  label: string;
  total: number;
  female: number;
  male: number;
}

interface DisciplineDistributionChartProps {
  data: DisciplineData[];
  limit?: number;
}

function useChartData(data: DisciplineData[], limit: number) {
  return useMemo(() => {
    const filteredData = data.filter((d) => d.label).slice(0, limit);
    const hasData = filteredData.length > 0;

    return {
      hasData,
      categories: filteredData.map((d) => d.label || 'Non renseigné'),
      values: filteredData.map((d) => d.total),
    };
  }, [data, limit]);
}

/**
 * Discipline distribution bar chart showing students by discipline sector
 * Workspace-specific chart
 */
export function DisciplineDistributionChart({
  data,
  limit = 10,
}: DisciplineDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title={`Top ${limit} secteurs disciplinaires (étudiants)`}
      description={`Les ${limit} secteurs disciplinaires avec le plus d'étudiants.`}
      chartRef={chartRef}
      source={SISE_SOURCE_SHORT}
    >
      <Chart
        ref={chartRef}
        containerProps={{ style: { width: '100%', minWidth: '200px', height: '400px' } }}
      >
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
            dataLabels: {
              enabled: true,
              format: '{y}',
            },
          }}
        />
      </Chart>
    </AnalyticsGraph>
  );
}
