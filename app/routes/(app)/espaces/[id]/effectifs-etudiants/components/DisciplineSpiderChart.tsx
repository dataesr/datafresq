import type { HighchartsReactRefObject } from '@highcharts/react';
import { useMemo, useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { SpiderChart } from '@/components/charts/SpiderChart';
import { SISE_SOURCE_SHORT } from '@/components/effectifs';

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

    const spiderData = filteredData.map((d) => ({
      name: d.label || '',
      y: d.total,
    }));

    return {
      hasData,
      spiderData,
    };
  }, [data, limit]);
}

/**
 * Spider chart showing students by large discipline
 * Workspace-specific chart
 */
export function DisciplineSpiderChart({ data, limit = 8 }: DisciplineSpiderChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { hasData, spiderData } = useChartData(data, limit);

  if (!hasData) {
    return null;
  }

  return (
    <AnalyticsGraph
      title="Grandes disciplines (étudiants)"
      description="Répartition des étudiants par grande discipline."
      chartRef={chartRef}
      source={SISE_SOURCE_SHORT}
    >
      <SpiderChart data={spiderData} seriesName="Étudiants" />
    </AnalyticsGraph>
  );
}
