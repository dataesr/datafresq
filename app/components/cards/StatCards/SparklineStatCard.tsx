import { Chart, Credits, Legend, Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import { type colorFamily, getChartColor } from '@/components/charts/highcharts/colors';

type ColorName = (typeof colorFamily)[number];

export interface SparklineStatCardProps {
  value: string | number;
  label: string;
  trendData: number[];
  trendCategories?: string[];
  color: ColorName;
  icon?: string;
  suffix?: string;
  /** Optional max value for Y-axis to ensure consistent scaling across multiple cards */
  yMax?: number;
}

export function SparklineStatCard({
  value,
  label,
  trendData,
  color,
  icon,
  suffix,
  yMax,
}: SparklineStatCardProps) {
  const chartColor = getChartColor(color);

  const hasMultipleYears = trendData && trendData.length > 1;

  const firstValue = hasMultipleYears ? (trendData[trendData.length - 2] ?? 0) : 0;
  const lastValue = trendData?.[trendData.length - 1] ?? 0;
  const trendDirection = hasMultipleYears
    ? lastValue > firstValue
      ? 'up'
      : lastValue < firstValue
        ? 'down'
        : 'stable'
    : 'stable';
  const trendPercent =
    hasMultipleYears && firstValue > 0
      ? Math.round(((lastValue - firstValue) / firstValue) * 100)
      : 0;

  return (
    <div
      className="fr-card fr-card--shadow fx-flex fx-flex-col fr-p-0"
      style={{ overflow: 'hidden' }}
    >
      <div className="fr-px-7v fr-pt-3w fr-pb-3v">
        <div className="fx-flex fx-items-start fx-justify-between">
          <div>
            <p className="fr-text-mention--grey fr-text--sm fr-mb-1w">{label}</p>
            <p
              className="fr-text--bold fr-text-title--grey fx-mb-1v"
              style={{ fontSize: '1.75rem' }}
            >
              {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
              {suffix && <span className="fr-text--sm fr-text--regular fr-ml-1v">{suffix}</span>}
            </p>
          </div>
          {icon && <span className={icon} style={{ color: chartColor }} aria-hidden="true" />}
        </div>
        {hasMultipleYears && trendDirection !== 'stable' && (
          <div className="fr-mt-1v fx-flex fx-items-center fx-gap-1w">
            <span
              className={`fr-badge fr-badge--sm fr-badge--no-icon ${trendDirection === 'up' ? 'fr-badge--success' : 'fr-badge--warning'}`}
            >
              <span
                className={
                  trendDirection === 'up' ? 'fr-icon-arrow-up-s-fill' : 'fr-icon-arrow-down-s-fill'
                }
                aria-hidden="true"
                style={{ marginRight: '0.25rem', fontSize: '0.75rem' }}
              />
              {trendDirection === 'up' ? '+' : ''}
              {trendPercent}%
            </span>
            <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
              par rapport à l'année précédente
            </span>
          </div>
        )}
      </div>
      {hasMultipleYears && (
        <div style={{ height: '60px', marginTop: 'auto' }}>
          <Chart
            containerProps={{
              style: { marginLeft: '-.5rem', width: 'calc(100% + 1rem)', height: '60px' },
            }}
            options={{
              chart: {
                type: 'area',
                margin: [0, 0, 0, 0],
                spacing: [0, 0, 0, 0],
                backgroundColor: 'transparent',
              },
              plotOptions: {
                area: {
                  fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, `${chartColor}40`],
                      [1, `${chartColor}05`],
                    ],
                  },
                  lineWidth: 2,
                  marker: { enabled: false },
                  states: {
                    hover: { enabled: false },
                  },
                },
              },
            }}
          >
            <Credits enabled={false} />
            <Legend enabled={false} />
            <Tooltip enabled={false} />
            <XAxis visible={false} />
            <YAxis visible={false} max={yMax} />
            <Area.Series
              data={trendData}
              options={{
                color: chartColor,
                // enableMouseTracking: false,
              }}
            />
          </Chart>
        </div>
      )}
    </div>
  );
}
