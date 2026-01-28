import { Credits, Legend } from '@highcharts/react';
import { Highcharts, MapsChart, MapsSeries, setHighcharts } from '@highcharts/react/Maps';
import proj4 from 'proj4';
import mapDataFR from './topo.json';

setHighcharts(Highcharts);

if (typeof window !== 'undefined') {
  window.proj4 = window.proj4 || proj4;
}

export type BubbleMapDataPoint = {
  lat: number;
  lon: number;
  name: string;
  z: number;
};

export type ChoroplethMapDataPoint = {
  'hc-key': string;
  value: number;
  name?: string;
};

export type BubbleMapProps = {
  data: BubbleMapDataPoint[];
  title?: string;
  tooltipHeaderFormat?: string;
  tooltipPointFormat?: string;
  bubbleColor?: string;
  minSize?: number;
  maxSize?: number;
};

export type ChoroplethMapProps = {
  data: ChoroplethMapDataPoint[];
  title?: string;
  tooltipHeaderFormat?: string;
  tooltipPointFormat?: string;
  minColor?: string;
  maxColor?: string;
  nullColor?: string;
  hoverColor?: string;
};

export function BubbleMap({
  data,
  title,
  tooltipHeaderFormat = 'Effectifs - <br>',
  tooltipPointFormat = '<b>{point.name}</b> : {point.z}',
  bubbleColor = 'rgb(225, 139, 118)',
  minSize = 1,
  maxSize = 60,
}: BubbleMapProps) {
  if (!data || data.length === 0) return null;

  return (
    <MapsChart
      options={{
        chart: {
          map: mapDataFR,
          backgroundColor: 'transparent',
        },
        mapNavigation: {
          enabled: false,
        },
        mapView: {
          projection: {
            name: 'WebMercator',
          },
          padding: '10%',
        },
        title: title ? { text: title } : { text: '' },
        tooltip: {
          headerFormat: tooltipHeaderFormat,
          pointFormat: tooltipPointFormat,
        },
      }}
    >
      <Credits enabled={false} />
      <Legend enabled={false} />
      {/* Base map layer */}
      <MapsSeries
        type="map"
        options={
          {
            name: 'Basemap',
            mapData: mapDataFR,
            borderColor: 'var(--background-default-grey)',
            nullColor: 'var(--border-default-grey)',
            showInLegend: false,
            states: {
              inactive: {
                opacity: 1,
              },
            },
          } as any
        }
      />
      {/* Bubble layer */}
      <MapsSeries
        type="mapbubble"
        data={data}
        options={
          {
            name: 'Effectifs',
            color: bubbleColor,
            minSize,
            maxSize,
            cursor: 'pointer',
            showInLegend: false,
          } as any
        }
      />
    </MapsChart>
  );
}

// Green-archipel colors from DSFR
const GREEN_ARCHIPEL = {
  background: '#e5fbfd',
  decorative: '#c7f6fc',
  motif: '#a6f2fa',
  minor: '#009099',
  major: '#006a6f',
};

export function ChoroplethMap({
  data,
  title,
  tooltipHeaderFormat = '',
  tooltipPointFormat = '<b>{point.name}</b>: {point.value}',
  minColor = GREEN_ARCHIPEL.background,
  maxColor = GREEN_ARCHIPEL.major,
  nullColor = 'var(--border-default-grey)',
  hoverColor = GREEN_ARCHIPEL.motif,
}: ChoroplethMapProps) {
  if (!data || data.length === 0) return null;

  return (
    <MapsChart
      containerProps={{ style: { width: '100%', height: '100%' } }}
      options={{
        chart: {
          map: mapDataFR,
          backgroundColor: 'transparent',
        },
        mapNavigation: {
          enabled: false,
        },
        mapView: {
          projection: {
            name: 'WebMercator',
          },
          padding: '10%',
        },
        title: title ? { text: title } : { text: '' },
        tooltip: {
          headerFormat: tooltipHeaderFormat,
          pointFormat: tooltipPointFormat,
        },
        colorAxis: {
          min: 0,
          minColor,
          maxColor,
          labels: {
            style: {
              color: 'var(--text-mention-grey)',
            },
          },
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
        data={data}
        options={
          {
            name: 'Régions',
            mapData: mapDataFR,
            borderColor: 'var(--background-default-grey)',
            nullColor,
            joinBy: 'hc-key',
            states: {
              hover: {
                color: hoverColor,
              },
            },
            dataLabels: {
              enabled: false,
            },
          } as any
        }
      />
    </MapsChart>
  );
}

export default BubbleMap;
