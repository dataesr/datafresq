import { useMemo } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { ChoroplethMap } from '@/components/charts/MapChart';
import { regionToHcKey, SISE_SOURCE_SHORT } from '@/components/effectifs';

interface RegionData {
  region: string;
  total: number;
  female: number;
  male: number;
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
        value: r.total,
        name: r.region,
      }));

    return {
      hasData: choroplethData.length > 0,
      choroplethData,
    };
  }, [data]);
}

/**
 * Choropleth map showing student distribution by region
 * Workspace-specific chart
 */
export function RegionChoroplethMap({ data }: RegionChoroplethMapProps) {
  const { hasData, choroplethData } = useMapData(data);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title="Carte des régions (étudiants)"
      description="Répartition géographique des étudiants par région."
      source={SISE_SOURCE_SHORT}
    >
      <div style={{ width: '100%', minWidth: '200px', height: '400px' }}>
        <ChoroplethMap
          data={choroplethData}
          tooltipPointFormat="<b>{point.name}</b>: {point.value} étudiants"
        />
      </div>
    </AnalyticsGraph>
  );
}
