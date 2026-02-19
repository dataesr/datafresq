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
import { TOP_DIPLOMAS_LIMIT } from '../constants';

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
    <ChartBox
      title="Formations par diplôme"
      description="Répartition des formations par type de diplôme préparé."
      chartRef={chartRef}
      source="fresq"
      tooltip={
        <span>
          Nombre de formations regroupées par type de diplôme.{' '}
          <Link to="/guide/donnees/fresq">En savoir plus</Link> sur les données Fresq.
        </span>
      }
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
    </ChartBox>
  );
}
