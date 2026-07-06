import type { HighchartsReactRefObject } from '@highcharts/react';
import { useCallback, useEffect, useState } from 'react';
import { getSourceLabels, type SourceRef } from '@/components/charts/sources';

interface ChartWithExporting {
  exportChart: (
    options?: { type?: string; filename?: string; sourceWidth?: number; sourceHeight?: number },
    chartOptions?: object,
  ) => void;
  downloadCSV: () => void;
  getTable: () => string;
  fullscreen: { toggle: () => void };
  update: (options: object, redraw?: boolean) => void;
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

const EXPORT_WIDTH = 800;
const EXPORT_HEIGHT = 600;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDateHuman(date: Date = new Date()): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateFilename(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

interface UseChartOptionsParams {
  chartRef?: ChartRef;
  hideMenu: boolean;
  title: string;
  description?: React.ReactNode;
  context?: string;
  source?: SourceRef | SourceRef[];
}

export function useChartOptions({
  chartRef,
  hideMenu,
  title,
  description,
  context,
  source,
}: UseChartOptionsParams) {
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

  const switchView = useCallback(
    (next: View) => {
      if (next === 'table' && chartRef) {
        const chart = getChartWithExporting(chartRef);
        if (chart) {
          setTableHtml(formatTable(chart.getTable()));
        }
      }
      setView(next);
    },
    [chartRef],
  );

  if (!enabled) {
    return { enabled: false as const } as const;
  }

  const buildExportChartOptions = () => {
    const sourceLabels = source ? getSourceLabels(source) : [];
    const subtitleParts: string[] = [];
    if (typeof description === 'string') subtitleParts.push(description);
    if (context) subtitleParts.push(context);
    const subtitleText = subtitleParts.join('<br /><br />');

    const sourcePart = `Source : ${sourceLabels.join(', ')}`;

    return {
      title: {
        text: title,
        align: 'left',
        margin: 30,
        style: { display: 'block', fontWeight: 'bold', fontSize: '16px' },
      },
      subtitle: {
        text: subtitleText,
        align: 'left',
        style: { display: subtitleText ? 'block' : 'none', fontSize: '12px' },
      },
      caption: {
        text: sourcePart,
        align: 'left',
        style: { fontSize: '10px' },
      },
      credits: {
        enabled: true,
        text: `Exporté depuis datafresq.data.esr.gouv.fr le ${formatDateHuman()}`,
      },
    };
  };

  const buildFilename = () => {
    const slug = slugify(title) || 'graphique';
    const ctx = context ? `-${slugify(context)}` : '';
    return `datafresq-${slug}${ctx}-${formatDateFilename()}`;
  };

  const handleExportPng = () => {
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.exportChart(
      {
        type: 'image/png',
        filename: buildFilename(),
        sourceWidth: EXPORT_WIDTH,
        sourceHeight: EXPORT_HEIGHT,
      },
      buildExportChartOptions(),
    );
  };

  const handleDownloadCsv = () => {
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.update({ exporting: { filename: buildFilename() } }, false);
    chart.downloadCSV();
  };

  const handleToggleFullscreen = () => {
    const chart = getChartWithExporting(chartRef);
    if (!chart) return;
    chart.fullscreen.toggle();
  };

  return {
    enabled: true as const,
    view,
    switchView,
    tableHtml,
    handleExportPng,
    handleDownloadCsv,
    handleToggleFullscreen,
  } as const;
}
