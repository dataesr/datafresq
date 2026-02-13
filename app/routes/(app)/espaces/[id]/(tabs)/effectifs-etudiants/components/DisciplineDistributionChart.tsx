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
import { Link } from 'react-router';
import { ChartBox } from '@/components/charts/ChartBox';
import { getChartColor } from '@/components/charts/highcharts/colors';

interface DisciplineData {
  id: string;
  label: string;
  total: number;
  female: number;
  male: number;
}

interface DisciplineDistributionChartProps {
  data: DisciplineData[];
  year: string;
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

export function DisciplineDistributionChart({
  data,
  year,
  limit = 10,
}: DisciplineDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <ChartBox
      title="Secteurs disciplinaires"
      description={`Rentrée ${year}. Classement des ${limit} secteurs disciplinaires avec le plus d'étudiants inscrits.`}
      chartRef={chartRef}
      source="sise"
      tooltip={
        <span>
          Calculé par somme des effectifs des formations pour chaque secteur disciplinaire.
          {' '}<Link to="/guide/indicateurs/effectifs">En savoir plus</Link> sur le calcul des effectifs.
        </span>
      }
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
            dataLabels: {
              enabled: true,
              format: '{y}',
            },
          }}
        />
      </Chart>
    </ChartBox>
  );
}
