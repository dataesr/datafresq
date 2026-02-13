import type { HighchartsReactRefObject } from '@highcharts/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ChartWithExporting {
  exportChart: (options?: { type?: string }, chartOptions?: object) => void;
  downloadCSV: () => void;
  downloadXLS: () => void;
  getTable: () => string;
}

type ChartRef = React.RefObject<HighchartsReactRefObject | null>;

type View = 'chart' | 'table';

const getChartWithExporting = (
  ref: ChartRef,
): (HighchartsReactRefObject['chart'] & ChartWithExporting) | null => {
  if (!ref.current?.chart) return null;
  return ref.current.chart as HighchartsReactRefObject['chart'] & ChartWithExporting;
};

function formatTable(raw: string): string {
  return raw
    .replace('<table', '<table class=""')
    .replace('<caption', '<caption class="fr-sr-only"');
}

interface UseChartOptionsParams {
  chartRef?: ChartRef;
  hideMenu: boolean;
  title: string;
  description?: React.ReactNode;
}

export function useChartOptions({ chartRef, hideMenu, title, description }: UseChartOptionsParams) {
  const enabled = !!chartRef && !hideMenu;
  const [view, setView] = useState<View>('chart');
  const [tableHtml, setTableHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.setTitle({ text: title, style: { display: 'none' } });
    typeof description === 'string' &&
      chart.setSubtitle({ text: description, style: { display: 'none' } });
  }, [enabled, chartRef, title, description]);

  const switchView = useCallback((next: View) => {
    if (next === 'table' && chartRef) {
      const chart = getChartWithExporting(chartRef);
      if (chart) {
        setTableHtml(formatTable(chart.getTable()));
      }
    }
    setView(next);
  }, [chartRef]);

  if (!enabled) {
    return { enabled: false as const } as const;
  }

  const handleExportPng = () => {
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.exportChart({ type: 'image/png' }, { title: { text: title } });
  };

  const handleExportPdf = () => {
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.exportChart({ type: 'application/pdf' }, { title: { text: title } });
  };

  const handleDownloadCsv = () => {
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.downloadCSV();
  };

  return {
    enabled: true as const,
    view,
    switchView,
    tableHtml,
    handleExportPng,
    handleExportPdf,
    handleDownloadCsv,
  } as const;
}
