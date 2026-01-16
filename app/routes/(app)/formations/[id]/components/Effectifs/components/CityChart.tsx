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
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { SISE_SOURCE_SHORT } from '@/components/effectifs';
import { getChartColor } from '@/components/highcharts';

interface CityChartProps {
  categories: string[];
  women: number[];
  men: number[];
  latestYear: string | null;
}

function useChartData(props: CityChartProps) {
  return useMemo(() => {
    const { categories, women, men, latestYear } = props;
    const hasData = categories.length > 1;

    return {
      hasData,
      categories,
      women,
      men,
      description: `Distribution des étudiants selon le lieu d'implantation (${latestYear})`,
    };
  }, [props]);
}

/**
 * City distribution chart showing enrollment by city/location
 * Program-specific chart
 */
export function CityChart(props: CityChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, women, men, description } = useChartData(props);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title="Répartition par commune d'implantation"
      description={description}
      chartRef={chartRef}
      source={SISE_SOURCE_SHORT}
    >
      <Chart
        ref={chartRef}
        containerProps={{ style: { width: '100%', minWidth: '300px', height: '350px' } }}
      >
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip shared />
        <XAxis categories={categories} title={{ text: 'Commune' }} />
        <YAxis min={0} title={{ text: "Nombre d'étudiants" }} />
        <Column.Series
          data={women}
          options={{
            name: 'Femmes',
            color: getChartColor('pink-macaron'),
            stacking: 'normal',
          }}
        />
        <Column.Series
          data={men}
          options={{
            name: 'Hommes',
            color: getChartColor('yellow-tournesol'),
            stacking: 'normal',
          }}
        />
      </Chart>
    </AnalyticsGraph>
  );
}
