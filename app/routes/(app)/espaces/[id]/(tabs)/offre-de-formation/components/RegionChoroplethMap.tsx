import type { HighchartsReactRefObject } from '@highcharts/react';
import { Credits } from '@highcharts/react';
import { MapsChart, MapsSeries } from '@highcharts/react/Maps';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ChartBox } from '@/components/charts/ChartBox';
import { getSequentialColors } from '@/components/charts/highcharts/colors';
import { regionToHcKey } from '@/components/charts/regions';
import mapDataFR from '@/components/charts/topo.json';

const GREEN_ARCHIPEL = getSequentialColors('green-archipel');

interface RegionData {
  region: string;
  count: number;
}

interface RegionChoroplethMapProps {
  data: RegionData[];
}

function useMapData(data: RegionData[]) {
  return useMemo(() => {
    const choroplethData = data
      .filter((r) => r.region && regionToHcKey[r.region])
      .map((r) => ({
        'hc-key': regionToHcKey[r.region]!,
        value: r.count,
        name: r.region,
      }));

    return {
      hasData: choroplethData.length > 0,
      choroplethData,
    };
  }, [data]);
}

export function RegionChoroplethMap({ data }: RegionChoroplethMapProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, choroplethData } = useMapData(data);

  if (!hasData) {
    return null;
  }

  return (
    <ChartBox
      title="Carte des régions"
      description="Répartition géographique des formations par région de France métropolitaine."
      source="fresq"
      chartRef={chartRef}
      tooltip={
        <span>
          Nombre de formations comptées par région d'implantation.{' '}
          <Link to="/guide/donnees/fresq">En savoir plus</Link> sur les données Fresq.
        </span>
      }
    >
      <MapsChart
        ref={chartRef}
        options={{
          chart: {
            map: mapDataFR,
            backgroundColor: 'transparent',
          },
          mapNavigation: { enabled: false },
          mapView: {
            projection: { name: 'WebMercator' },
            padding: '10%',
          },
          title: { text: '' },
          tooltip: {
            headerFormat: '',
            pointFormat: '<b>{point.name}</b>: {point.value} formations',
          },
          colorAxis: {
            min: 0,
            minColor: GREEN_ARCHIPEL.min,
            maxColor: GREEN_ARCHIPEL.max,
            labels: { style: { color: 'var(--text-mention-grey)' } },
          },
          legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
          },
        }}
      >
        <Credits enabled={false} />
        <MapsSeries
          type="map"
          data={choroplethData}
          options={
            {
              name: 'Régions',
              mapData: mapDataFR,
              borderColor: 'var(--background-default-grey)',
              nullColor: 'var(--border-default-grey)',
              joinBy: 'hc-key',
              states: {
                hover: { color: GREEN_ARCHIPEL.hover },
              },
              dataLabels: { enabled: false },
            } as any
          }
        />
      </MapsChart>
    </ChartBox>
  );
}
