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
import { getColorForSeries } from '@/components/charts/highcharts/colors';

interface AcademyData {
  academy: string;
  total: number;
  female: number;
  male: number;
}

interface AcademyDistributionChartProps {
  data: AcademyData[];
  year: string;
  limit?: number;
}

function useChartData(data: AcademyData[], limit: number) {
  return useMemo(() => {
    const topAcademies = data.filter((a) => a.academy).slice(0, limit);
    const hasData = topAcademies.length > 0;

    return {
      hasData,
      categories: topAcademies.map((a) => a.academy || 'Non renseigné'),
      femaleData: topAcademies.map((a) => a.female),
      maleData: topAcademies.map((a) => a.male),
    };
  }, [data, limit]);
}

export function AcademyDistributionChart({ data, year, limit = 10 }: AcademyDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, femaleData, maleData } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <ChartBox
      title="Académies par genre"
      description={`Rentrée ${year}. Les ${limit} académies avec le plus d'étudiants inscrits, avec répartition par sexe.`}
      chartRef={chartRef}
      source="sise"
      tooltip={
        <span>
          Calculé par somme des effectifs des formations pour chaque académie.
          {' '}<Link to="/guide/indicateurs/effectifs">En savoir plus</Link> sur le calcul des effectifs.
        </span>
      }
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip valueSuffix=" étudiants" />
        <XAxis type="category" categories={categories} />
        <YAxis min={0} title={{ text: '' }} stackLabels={{ enabled: true }} />
        <Bar.Series
          data={femaleData}
          options={{
            name: 'Femmes',
            color: getColorForSeries('femmes'),
            stacking: 'normal',
          }}
        />
        <Bar.Series
          data={maleData}
          options={{
            name: 'Hommes',
            color: getColorForSeries('hommes'),
            stacking: 'normal',
          }}
        />
      </Chart>
    </ChartBox>
  );
}
