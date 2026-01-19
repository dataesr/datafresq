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
import { getColorForSeries } from '@/components/highcharts';

interface AcademyData {
  academy: string;
  total: number;
  female: number;
  male: number;
}

interface AcademyDistributionChartProps {
  data: AcademyData[];
  limit?: number;
}

function useChartData(data: AcademyData[], limit: number) {
  return useMemo(() => {
    const topAcademies = data.filter((a) => a.academy).slice(0, limit);
    const hasData = topAcademies.length > 0;

    return {
      hasData,
      categories: topAcademies.map((a) => a.academy || 'Non renseigné'),
      femaleData: topAcademies.map((a) => a.female),
      maleData: topAcademies.map((a) => a.male),
    };
  }, [data, limit]);
}

/**
 * Academy distribution chart showing students by academy with gender breakdown
 * Workspace-specific chart
 */
export function AcademyDistributionChart({ data, limit = 10 }: AcademyDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, femaleData, maleData } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title={`Top ${limit} académies par genre`}
      description={`Les ${limit} académies avec le plus d'étudiants, répartis par genre.`}
      chartRef={chartRef}
      source={SISE_SOURCE_SHORT}
    >
      <Chart
        ref={chartRef}
        containerProps={{ style: { width: '100%', minWidth: '200px', height: '400px' } }}
      >
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip valueSuffix=" étudiants" />
        <XAxis type="category" categories={categories} />
        <YAxis min={0} title={{ text: '' }} stackLabels={{ enabled: true }} />
        <Bar.Series
          data={femaleData}
          options={{
            name: 'Femmes',
            color: getColorForSeries('femmes'),
            stacking: 'normal',
          }}
        />
        <Bar.Series
          data={maleData}
          options={{
            name: 'Hommes',
            color: getColorForSeries('hommes'),
            stacking: 'normal',
          }}
        />
      </Chart>
    </AnalyticsGraph>
  );
}
