import { Chart, Credits, Legend, Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import '@/components/highcharts';

const GREEN_ARCHIPEL = {
  background: '#e5fbfd',
  decorative: '#c7f6fc',
  motif: '#a6f2fa',
  minor: '#009099',
  major: '#006a6f',
};

export type SpiderChartDataPoint = {
  name: string;
  y: number;
};

export type SpiderChartProps = {
  data: SpiderChartDataPoint[];
  title?: string;
  seriesName?: string;
  color?: string;
  fillOpacity?: number;
};

export function SpiderChart({
  data,
  title,
  seriesName = 'Effectifs',
  color = GREEN_ARCHIPEL.minor,
  fillOpacity = 0.4,
}: SpiderChartProps) {
  if (!data || data.length === 0) return null;

  const categories = data.map((d) => d.name);
  const values = data.map((d) => d.y);

  return (
    <Chart
      options={{
        chart: {
          polar: true,
          type: 'area',
          backgroundColor: 'transparent',
        },
        title: title ? { text: title } : { text: '' },
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
          name: seriesName,
          color,
          fillOpacity,
          pointPlacement: 'on',
          marker: {
            enabled: true,
            radius: 4,
            fillColor: color,
          },
        }}
      />
    </Chart>
  );
}

export default SpiderChart;
