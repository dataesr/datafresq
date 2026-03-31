import { Chart, Credits, type HighchartsReactRefObject, Legend, Tooltip } from '@highcharts/react';
import { Pie } from '@highcharts/react/series';
import { useMemo, useRef } from 'react';
import { ChartBox } from '@/components/charts/ChartBox';
import { getChartColor } from '@/components/charts/highcharts/colors';
import { CYCLE_COLORS } from '@/components/effectifs';
import type { EtablissementYearStats } from '~/schemas/etablissements';

type CycleData = EtablissementYearStats['byCycle'][number];

function useChartData(data: CycleData[]) {
  return useMemo(() => {
    const filtered = data.filter((item) => item.cycle && item.total > 0);
    return {
      hasData: filtered.length > 0,
      pieData: filtered.map((item, index) => ({
        name: item.cycleLabel || item.cycle || 'Non renseigné',
        y: item.total,
        color: getChartColor(CYCLE_COLORS[index % CYCLE_COLORS.length]!),
      })),
    };
  }, [data]);
}

interface CycleDistributionChartProps {
  data: CycleData[];
  year: string;
}

export function CycleDistributionChart({ data, year }: CycleDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, pieData } = useChartData(data);

  if (!hasData) return null;

  return (
    <ChartBox
      title="Répartition par cycle LMD"
      description={`Rentrée ${year}. Distribution des étudiants inscrits par cycle Licence, Master et Doctorat.`}
      chartRef={chartRef}
      source="sise"
    >
      <Chart ref={chartRef}>
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
    </ChartBox>
  );
}
