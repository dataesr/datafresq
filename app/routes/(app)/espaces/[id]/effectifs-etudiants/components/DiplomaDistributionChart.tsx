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

interface DiplomaData {
  diploma: string;
  diplomaLabel: string;
  total: number;
  female: number;
  male: number;
}

interface DiplomaDistributionChartProps {
  data: DiplomaData[];
  limit?: number;
}

function useChartData(data: DiplomaData[], limit: number) {
  return useMemo(() => {
    const filteredData = data.filter((d) => d.diplomaLabel).slice(0, limit);
    const hasData = filteredData.length > 0;

    const categories = filteredData.map((d) => d.diplomaLabel || d.diploma || 'Non renseigné');
    const values = filteredData.map((d) => ({
      y: d.total,
      female: d.female,
      male: d.male,
    }));

    return {
      hasData,
      categories,
      values,
    };
  }, [data, limit]);
}

/**
 * Diploma distribution bar chart showing students by diploma type
 * Workspace-specific chart
 */
export function DiplomaDistributionChart({ data, limit = 8 }: DiplomaDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title="Effectifs par type de diplôme"
      description="Répartition des étudiants par type de diplôme préparé."
      chartRef={chartRef}
      source={SISE_SOURCE_SHORT}
    >
      <Chart ref={chartRef} containerProps={{ style: { height: '400px' } }}>
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
