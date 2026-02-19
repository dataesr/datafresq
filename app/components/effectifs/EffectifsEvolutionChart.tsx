import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ChartBox } from '@/components/charts/ChartBox';
import { getColorForSeries } from '@/components/charts/highcharts/colors';

interface EffectifsEvolutionChartProps {
  years: string[];
  totalTrend: number[];
  womenTrend: number[];
  menTrend: number[];
}

function useChartData(props: EffectifsEvolutionChartProps) {
  return useMemo(() => {
    const { years, totalTrend, womenTrend, menTrend } = props;

    const hasData = years.length > 1 && totalTrend.some((v) => v > 0);
    const firstYear = years[0] || '';
    const lastYear = years[years.length - 1] || '';

    return {
      hasData,
      years,
      totalTrend,
      womenTrend,
      menTrend,
      description: `Évolution du nombre d'étudiants inscrits sur ${years.length} années universitaires (${firstYear} à ${lastYear}), avec répartition par sexe.`,
    };
  }, [props]);
}

export function EffectifsEvolutionChart(props: EffectifsEvolutionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, years, totalTrend, womenTrend, menTrend, description } = useChartData(props);

  if (!hasData) {
    return null;
  }

  return (
    <ChartBox
      title="Évolution des effectifs"
      description={description}
      chartRef={chartRef}
      source="sise"
      tooltip={
        <span>
          Somme des étudiants inscrits pour chaque rentrée universitaire, avec ventilation par sexe.{' '}
          <Link to="/guide/indicateurs/effectifs">En savoir plus</Link> sur le calcul des effectifs.
        </span>
      }
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip shared />
        <XAxis categories={years} title={{ text: 'Année universitaire' }} />
        <YAxis min={0} title={{ text: "Nombre d'étudiants inscrits" }} />
        <Line.Series
          data={totalTrend}
          options={{
            name: 'Total',
            color: getColorForSeries('total'),
          }}
        />
        <Line.Series
          data={womenTrend}
          options={{
            name: 'Femmes',
            color: getColorForSeries('femmes'),
          }}
        />
        <Line.Series
          data={menTrend}
          options={{
            name: 'Hommes',
            color: getColorForSeries('hommes'),
          }}
        />
      </Chart>
    </ChartBox>
  );
}
