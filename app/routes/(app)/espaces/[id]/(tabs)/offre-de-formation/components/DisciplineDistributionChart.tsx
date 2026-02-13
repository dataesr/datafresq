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
import { TOP_DISCIPLINES_LIMIT } from '../constants';

interface DisciplineData {
  discipline: string;
  count: number;
}

interface DisciplineDistributionChartProps {
  data: DisciplineData[];
  limit?: number;
}

function useChartData(data: DisciplineData[], limit: number) {
  return useMemo(() => {
    const topDisciplines = [...data]
      .filter((d) => d.discipline)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    const hasData = topDisciplines.length > 0;
    const categories = topDisciplines.map((d) => d.discipline || 'Non renseigné');
    const values = topDisciplines.map((d) => d.count);

    return {
      hasData,
      categories,
      values,
    };
  }, [data, limit]);
}

/**
 * Discipline distribution bar chart showing programs by discipline sector
 */
export function DisciplineDistributionChart({
  data,
  limit = TOP_DISCIPLINES_LIMIT,
}: DisciplineDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <ChartBox
      title="Secteurs disciplinaires"
      description={`Classement des ${limit} secteurs disciplinaires par nombre de formations proposées.`}
      chartRef={chartRef}
      source="fresq"
      tooltip={
        <span>
          Nombre de formations comptées par secteur disciplinaire.
          {' '}<Link to="/guide/donnees/fresq">En savoir plus</Link> sur les données Fresq.
        </span>
      }
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend enabled={false} />
        <Tooltip valueSuffix=" formations" />
        <XAxis type="category" categories={categories} />
        <YAxis min={0} allowDecimals={false} title={{ text: '' }} />
        <Bar.Series
          data={values}
          options={{
            name: 'Formations',
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
