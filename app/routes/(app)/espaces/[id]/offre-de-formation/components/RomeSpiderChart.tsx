import type { HighchartsReactRefObject } from '@highcharts/react';
import { useMemo, useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { SpiderChart } from '@/components/charts/SpiderChart';
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

    const spiderData = filteredData.map((d) => ({
      name: d.label,
      y: d.count,
    }));

    return {
      hasData,
      spiderData,
    };
  }, [data, limit]);
}

/**
 * Spider chart showing programs by ROME codes (job classifications)
 */
export function RomeSpiderChart({ data, limit = TOP_ROME_LIMIT }: RomeSpiderChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, spiderData } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title="Métiers (codes ROME) (formations)"
      description="Répartition des formations par métier (codes ROME)."
      chartRef={chartRef}
      source={FRESQ_SOURCE}
    >
      <div style={{ width: '100%', minWidth: '200px', height: '400px' }}>
        <SpiderChart data={spiderData} seriesName="Formations" />
      </div>
    </AnalyticsGraph>
  );
}
