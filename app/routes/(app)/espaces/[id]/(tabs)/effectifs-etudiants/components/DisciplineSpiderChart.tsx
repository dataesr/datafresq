import type { HighchartsReactRefObject } from '@highcharts/react';
import { Chart, Credits, Legend, Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import { useMemo, useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { SISE_SOURCE_SHORT } from '@/components/effectifs';
import { getColorForSeries } from '@/components/highcharts';
import '@/components/highcharts';

interface LargeDisciplineData {
  id: string;
  label: string;
  total: number;
  female: number;
  male: number;
}

interface DisciplineSpiderChartProps {
  data: LargeDisciplineData[];
  limit?: number;
}

function useChartData(data: LargeDisciplineData[], limit: number) {
  return useMemo(() => {
    const filteredData = data.filter((d) => d.label).slice(0, limit);
    const hasData = filteredData.length > 0;

    const categories = filteredData.map((d) => d.label);
    const femaleValues = filteredData.map((d) => d.female);
    const maleValues = filteredData.map((d) => d.male);
    const totalValues = filteredData.map((d) => d.total);

    return {
      hasData,
      categories,
      femaleValues,
      maleValues,
      totalValues,
    };
  }, [data, limit]);
}

export function DisciplineSpiderChart({ data, limit = 8 }: DisciplineSpiderChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, categories, femaleValues, maleValues, totalValues } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  const femaleColor = getColorForSeries('femmes');
  const maleColor = getColorForSeries('hommes');
  const totalColor = getColorForSeries('total');

  return (
    <AnalyticsGraph
      title="Grandes disciplines (étudiants)"
      description="Répartition des étudiants par grande discipline et par sexe."
      chartRef={chartRef}
      source={SISE_SOURCE_SHORT}
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
        <Legend enabled />
        <Tooltip
          shared
          pointFormat={`<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b></span><br/>`}
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
          data={totalValues}
          options={{
            name: 'Effectif total',
            color: totalColor,
            fillOpacity: 0.4,
            pointPlacement: 'on',
            marker: {
              enabled: true,
              radius: 4,
              fillColor: totalColor,
            },
          }}
        />
        <Area.Series
          data={femaleValues}
          options={{
            name: 'Femmes',
            color: femaleColor,
            fillOpacity: 0.2,
            pointPlacement: 'on',
            marker: {
              enabled: true,
              radius: 4,
              fillColor: femaleColor,
            },
          }}
        />
        <Area.Series
          data={maleValues}
          options={{
            name: 'Hommes',
            color: maleColor,
            fillOpacity: 0.2,
            pointPlacement: 'on',
            marker: {
              enabled: true,
              radius: 4,
              fillColor: maleColor,
            },
          }}
        />
      </Chart>
    </AnalyticsGraph>
  );
}
