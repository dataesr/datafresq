import { useMemo, useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { ChoroplethMap } from '@/components/charts/MapChart';
import { regionToHcKey } from '@/components/effectifs';
import { FRESQ_SOURCE } from '../constants';
import type { HighchartsReactRefObject } from '@highcharts/react';

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

/**
 * Choropleth map showing program distribution by region
 */
export function RegionChoroplethMap({ data }: RegionChoroplethMapProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, choroplethData } = useMapData(data);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title="Carte des régions (formations)"
      description="Répartition géographique des formations par région."
      source={FRESQ_SOURCE}
      chartRef={chartRef}
    >
      <ChoroplethMap
        data={choroplethData}
        tooltipPointFormat="<b>{point.name}</b>: {point.value} formations"
      />
    </AnalyticsGraph>
  );
}
