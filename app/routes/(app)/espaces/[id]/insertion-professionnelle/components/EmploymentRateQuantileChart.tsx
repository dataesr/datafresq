import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import BoxPlot from '@highcharts/react/series/BoxPlot';
import { useMemo, useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { getChartColor } from '@/components/highcharts';
import {
  BlurredNoData,
  countsToPercentages,
  MONTH_KEYS,
  MONTHS,
  PRIVACY_THRESHOLD,
  ratesToArrayWithTrailingNulls,
} from '@/components/insersup';
import type { InsersupYearStats } from '~/schemas/aggregations';

interface EmploymentRateQuantileChartProps {
  yearData: InsersupYearStats;
  year: string;
}

interface QuartileData {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

type QuantilesByMonth = Record<'m6' | 'm12' | 'm18' | 'm24' | 'm30', QuartileData | null>;

interface BoxplotDataPoint {
  x: number;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

function computeQuartiles(values: number[]): QuartileData | null {
  if (values.length < 4) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const percentile = (p: number): number => {
    const index = (p / 100) * (n - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower]!;
    return sorted[lower]! * (upper - index) + sorted[upper]! * (index - lower);
  };

  return {
    min: sorted[0]!,
    q1: percentile(25),
    median: percentile(50),
    q3: percentile(75),
    max: sorted[n - 1]!,
  };
}

function useCurrentYearQuantiles(yearData: InsersupYearStats): QuantilesByMonth | null {
  return useMemo(() => {
    if (!yearData?.programs) return null;

    const quantilesByMonth: QuantilesByMonth = {
      m6: null,
      m12: null,
      m18: null,
      m24: null,
      m30: null,
    };

    for (const month of MONTH_KEYS) {
      const percentages: number[] = [];

      for (const prog of yearData.programs) {
        if (prog.emploiSalFr && prog.nbSortants >= PRIVACY_THRESHOLD) {
          const count = prog.emploiSalFr[month];
          if (count !== null) {
            const pct = Math.round((count / prog.nbSortants) * 100);
            percentages.push(pct);
          }
        }
      }

      quantilesByMonth[month] = computeQuartiles(percentages);
    }

    return quantilesByMonth;
  }, [yearData]);
}

function useBoxplotData(quantiles: QuantilesByMonth | null): BoxplotDataPoint[] | null {
  return useMemo(() => {
    if (!quantiles) return null;

    return MONTH_KEYS.map((month, i) => {
      const q = quantiles[month];
      if (!q) return null;
      return { x: i, low: q.min, q1: q.q1, median: q.median, q3: q.q3, high: q.max };
    }).filter((d): d is BoxplotDataPoint => d !== null);
  }, [quantiles]);
}

/**
 * Employment rate quantile chart showing distribution across programs
 * This chart is unique to workspace view (not available for single programs)
 */
export function EmploymentRateQuantileChart({ yearData, year }: EmploymentRateQuantileChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);

  const quantiles = useCurrentYearQuantiles(yearData);
  const boxplotData = useBoxplotData(quantiles);

  const canShowEmployment =
    yearData.emploiSalFr !== null && yearData.nbSortants >= PRIVACY_THRESHOLD;
  const currentYearEmploiLine = canShowEmployment
    ? countsToPercentages(yearData.emploiSalFr, yearData.nbSortants)
    : null;

  const hasData = boxplotData && boxplotData.length > 0;

  return (
    <AnalyticsGraph
      title={`Distribution du taux d'emploi salarié - ${year}`}
      description="Quartiles du taux d'emploi salarié par formation (min, Q1, médiane, Q3, max)"
      chartRef={hasData ? chartRef : undefined}
      source="InserSup (MESR)"
    >
      <BlurredNoData
        noData={!hasData}
        message="Pas assez de formations avec des données suffisantes pour calculer les quartiles (minimum 4 formations avec au moins 20 sortants chacune)."
      >
        <Chart
          ref={chartRef}
          containerProps={{
            style: { width: '100%', minWidth: '300px', height: '350px' },
          }}
        >
          <Credits enabled={false} />
          <Legend align="center" />
          <Tooltip />
          <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
          <YAxis min={0} max={100} title={{ text: "Taux d'emploi salarié (%)" }} />
          <BoxPlot.Series
            data={boxplotData ?? []}
            options={{
              name: 'Distribution',
              color: getChartColor('blue-cumulus'),
              fillColor: getChartColor('blue-cumulus') + '40',
              medianColor: getChartColor('green-archipel'),
              medianWidth: 3,
            }}
          />
          {/* Overlay: aggregate line */}
          {currentYearEmploiLine && (
            <Line.Series
              data={ratesToArrayWithTrailingNulls(currentYearEmploiLine)}
              options={{
                name: 'Moyenne espace',
                color: getChartColor('green-archipel'),
                marker: { enabled: true, symbol: 'circle' },
                dashStyle: 'Dash',
                lineWidth: 2,
              }}
            />
          )}
        </Chart>
      </BlurredNoData>
    </AnalyticsGraph>
  );
}
