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
import { getChartColor } from '@/components/highcharts';
import { FRESQ_SOURCE, TOP_DIPLOMAS_LIMIT } from '../constants';

interface DiplomaData {
  diploma: string;
  diplomaLabel: string;
  count: number;
}

interface DiplomaDistributionChartProps {
  data: DiplomaData[];
  limit?: number;
}

function useChartData(data: DiplomaData[], limit: number) {
  return useMemo(() => {
    const topDiplomas = [...data]
      .filter((d) => d.diplomaLabel)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    const hasData = topDiplomas.length > 0;
    const categories = topDiplomas.map((d) => d.diplomaLabel || d.diploma || 'Non renseigné');
    const values = topDiplomas.map((d) => ({
      y: d.count,
    }));

    return {
      hasData,
      categories,
      values,
    };
  }, [data, limit]);
}

/**
 * Diploma distribution bar chart showing programs by diploma type
 */
export function DiplomaDistributionChart({
  data,
  limit = TOP_DIPLOMAS_LIMIT,
}: DiplomaDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title="Formations par type de diplôme"
      description="Répartition des formations par type de diplôme préparé."
      chartRef={chartRef}
      source={FRESQ_SOURCE}
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend enabled={false} />
        <Tooltip valueSuffix=" formations" />
        <XAxis type="category" categories={categories} />
        <YAxis min={0} allowDecimals={false} title={{ text: 'Nombre de formations' }} />
        <Bar.Series
          data={values}
          options={{
            name: 'Formations',
            color: getChartColor('blue-cumulus'),
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
