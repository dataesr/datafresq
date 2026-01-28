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
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { getColorForSeries } from '@/components/highcharts';
import { SISE_SOURCE } from './constants';

/**
 * Props for the evolution chart - accepts pre-computed trend data
 */
interface EffectifsEvolutionChartProps {
  years: string[];
  totalTrend: number[];
  womenTrend: number[];
  menTrend: number[];
}

/**
 * Hook to compute chart configuration from props
 */
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
      description: `Données disponibles sur ${years.length} années universitaires (${firstYear} - ${lastYear})`,
    };
  }, [props]);
}

/**
 * Shared evolution chart showing enrollment trends over academic years
 * Works with both program-level and workspace-level data
 */
export function EffectifsEvolutionChart(props: EffectifsEvolutionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, years, totalTrend, womenTrend, menTrend, description } = useChartData(props);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title="Évolution des effectifs"
      description={description}
      chartRef={chartRef}
      source={SISE_SOURCE}
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
    </AnalyticsGraph>
  );
}
