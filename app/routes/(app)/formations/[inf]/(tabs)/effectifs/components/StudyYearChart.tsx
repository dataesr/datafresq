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
import { Link } from 'react-router';
import { ChartBox } from '@/components/charts/ChartBox';
import { getChartColor } from '@/components/charts/highcharts/colors';

interface StudyYearChartProps {
  categories: string[];
  women: number[];
  men: number[];
  latestYear: string | null;
}

function useChartData(props: StudyYearChartProps) {
  return useMemo(() => {
    const { categories, women, men, latestYear } = props;
    const hasData = categories.length > 1;

    return {
      hasData,
      categories,
      women,
      men,
      description: `Distribution des étudiants inscrits selon leur année dans le cursus (${latestYear}).`,
    };
  }, [props]);
}

/**
 * Study year distribution chart showing enrollment by study year (1ère année, 2ème année, etc.)
 * Program-specific chart
 */
export function StudyYearChart(props: StudyYearChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, women, men, description } = useChartData(props);

  if (!hasData) {
    return null;
  }

  return (
    <ChartBox
      title="Répartition par année d'études"
      description={description}
      chartRef={chartRef}
      source="sise"
      tooltip={
        <span>
          Somme des étudiants inscrits par année dans le cursus de la formation.
          {' '}<Link to="/guide/indicateurs/effectifs">En savoir plus</Link> sur le calcul des effectifs.
        </span>
      }
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip shared />
        <XAxis categories={categories} title={{ text: "Année d'études" }} />
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
    </ChartBox>
  );
}
