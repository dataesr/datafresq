import { Chart, Credits, type HighchartsReactRefObject, Legend, Tooltip } from '@highcharts/react';
import { Pie } from '@highcharts/react/series';
import { useMemo, useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { CYCLE_COLORS, SISE_SOURCE_SHORT } from '@/components/effectifs';
import { getChartColor } from '@/components/highcharts';

interface CycleData {
  cycle: string;
  total: number;
  female: number;
  male: number;
}

interface CycleDistributionChartProps {
  data: CycleData[];
}

function useChartData(data: CycleData[]) {
  return useMemo(() => {
    const filteredData = data.filter((item) => item.cycle && item.total > 0);
    const hasData = filteredData.length > 0;

    const pieData = filteredData.map((item, index) => ({
      name: item.cycle || 'Non renseigné',
      y: item.total,
      color: getChartColor(CYCLE_COLORS[index % CYCLE_COLORS.length]!),
    }));

    return {
      hasData,
      pieData,
    };
  }, [data]);
}

/**
 * Cycle distribution pie chart showing students by LMD cycle (Licence, Master, Doctorat)
 * Workspace-specific chart
 */
export function CycleDistributionChart({ data }: CycleDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, pieData } = useChartData(data);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title="Répartition par cycle LMD (étudiants)"
      description="Distribution des étudiants par cycle Licence, Master et Doctorat."
      chartRef={chartRef}
      source={SISE_SOURCE_SHORT}
    >
      <Chart ref={chartRef} containerProps={{ style: { height: '400px' } }}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip pointFormat="<b>{point.y}</b> étudiants ({point.percentage:.1f}%)" />
        <Pie.Series
          data={pieData}
          options={{
            name: 'Étudiants',
            innerSize: '50%',
            dataLabels: {
              enabled: true,
              format: '{point.name}: {point.percentage:.1f}%',
            },
          }}
        />
      </Chart>
    </AnalyticsGraph>
  );
}
