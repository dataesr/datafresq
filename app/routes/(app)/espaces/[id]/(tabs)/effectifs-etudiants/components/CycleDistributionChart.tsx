import { Chart, Credits, type HighchartsReactRefObject, Legend, Tooltip } from '@highcharts/react';
import { Pie } from '@highcharts/react/series';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ChartBox } from '@/components/charts/ChartBox';
import { getChartColor } from '@/components/charts/highcharts/colors';
import { CYCLE_COLORS } from '@/components/effectifs';

interface CycleData {
  cycle: string;
  total: number;
  female: number;
  male: number;
}

interface CycleDistributionChartProps {
  data: CycleData[];
  year: string;
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

export function CycleDistributionChart({ data, year }: CycleDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, pieData } = useChartData(data);

  if (!hasData) {
    return null;
  }

  return (
    <ChartBox
      title="Répartition par cycle LMD"
      description={`Rentrée ${year}. Distribution des étudiants inscrits par cycle Licence, Master et Doctorat.`}
      chartRef={chartRef}
      source="sise"
      tooltip={
        <span>
          Somme des étudiants inscrits regroupés par cycle LMD (Licence, Master, Doctorat).{' '}
          <Link to="/guide/indicateurs/effectifs">En savoir plus</Link> sur le calcul des effectifs.
        </span>
      }
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
