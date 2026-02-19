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

interface DiplomaData {
  diploma: string;
  diplomaLabel: string;
  total: number;
  female: number;
  male: number;
}

interface DiplomaDistributionChartProps {
  data: DiplomaData[];
  year: string;
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

export function DiplomaDistributionChart({ data, year, limit = 8 }: DiplomaDistributionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <ChartBox
      title="Effectifs par diplôme"
      description={`Rentrée ${year}. Répartition des étudiants inscrits par type de diplôme préparé.`}
      chartRef={chartRef}
      source="sise"
      tooltip={
        <span>
          Somme des étudiants inscrits regroupés par type de diplôme préparé.{' '}
          <Link to="/guide/indicateurs/effectifs">En savoir plus</Link> sur le calcul des effectifs.
        </span>
      }
    >
      <Chart ref={chartRef}>
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
    </ChartBox>
  );
}
