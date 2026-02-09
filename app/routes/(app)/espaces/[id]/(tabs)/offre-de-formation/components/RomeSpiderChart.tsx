import type { HighchartsReactRefObject } from '@highcharts/react';
import { Chart, Credits, Legend, Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import { useMemo, useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { getColorForSeries } from '@/components/highcharts';
import '@/components/highcharts';
import { FRESQ_SOURCE, TOP_ROME_LIMIT } from '../constants';

interface RomeData {
  code: string;
  label: string;
  count: number;
}

interface RomeSpiderChartProps {
  data: RomeData[];
  limit?: number;
}

function useChartData(data: RomeData[], limit: number) {
  return useMemo(() => {
    const filteredData = data.filter((d) => d.label).slice(0, limit);
    const hasData = filteredData.length > 0;

    const categories = filteredData.map((d) => d.label);
    const values = filteredData.map((d) => d.count);

    return {
      hasData,
      categories,
      values,
    };
  }, [data, limit]);
}

export function RomeSpiderChart({ data, limit = TOP_ROME_LIMIT }: RomeSpiderChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, values } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  const color = getColorForSeries('total');

  return (
    <AnalyticsGraph
      title="Métiers (codes ROME) (formations)"
      description="Répartition des formations par métier (codes ROME)."
      chartRef={chartRef}
      source={FRESQ_SOURCE}
    >
      <Chart
        ref={chartRef}
        options={{
          chart: {
            polar: true,
            type: 'area',
            backgroundColor: 'transparent',
          },
          title: { text: '' },
          pane: {
            size: '80%',
          },
          responsive: {
            rules: [
              {
                condition: {
                  maxWidth: 500,
                },
                chartOptions: {
                  pane: {
                    size: '70%',
                  },
                },
              },
            ],
          },
        }}
      >
        <Credits enabled={false} />
        <Legend enabled={false} />
        <Tooltip
          shared
          pointFormat={`<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b></span>`}
        />
        <XAxis
          categories={categories}
          tickmarkPlacement="on"
          lineWidth={0}
          labels={{
            style: {
              fontSize: '11px',
            },
          }}
        />
        <YAxis gridLineInterpolation="polygon" lineWidth={0} min={0} />
        <Area.Series
          data={values}
          options={{
            name: 'Formations',
            color,
            fillOpacity: 0.4,
            pointPlacement: 'on',
            marker: {
              enabled: true,
              radius: 4,
              fillColor: color,
            },
          }}
        />
      </Chart>
    </AnalyticsGraph>
  );
}
