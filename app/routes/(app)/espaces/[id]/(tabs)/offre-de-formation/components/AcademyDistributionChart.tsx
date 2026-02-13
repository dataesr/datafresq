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
import { TOP_ACADEMIES_LIMIT } from '../constants';

interface AcademyData {
  academy: string;
  count: number;
}

interface AcademyDistributionChartProps {
  data: AcademyData[];
  limit?: number;
}

function useChartData(data: AcademyData[], limit: number) {
  return useMemo(() => {
    const topAcademies = [...data]
      .filter((a) => a.academy)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    const hasData = topAcademies.length > 0;
    const categories = topAcademies.map((a) => a.academy || 'Non renseigné');
    const values = topAcademies.map((a) => a.count);

    return {
      hasData,
      categories,
      values,
    };
  }, [data, limit]);
}

/**
 * Academy distribution bar chart showing programs by academy
 */
export function AcademyDistributionChart({
  data,
  limit = TOP_ACADEMIES_LIMIT,
}: AcademyDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <ChartBox
      title="Académies"
      description={`Classement des ${limit} académies par nombre de formations proposées.`}
      chartRef={chartRef}
      source="fresq"
      tooltip={
        <span>
          Nombre de formations comptées par académie d'implantation.
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
            color: getChartColor('pink-macaron'),
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
