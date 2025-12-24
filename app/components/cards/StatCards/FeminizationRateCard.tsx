import { Chart, Credits, Legend, Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import { getColorForSeries } from '@/components/highcharts';

export interface FeminizationRateCardProps {
  femaleCount: number;
  maleCount: number;
  femaleTrendData?: number[];
  maleTrendData?: number[];
}

export function FeminizationRateCard({
  femaleCount,
  maleCount,
  femaleTrendData = [],
  maleTrendData = [],
}: FeminizationRateCardProps) {
  const femaleColor = getColorForSeries('femmes');
  const maleColor = getColorForSeries('hommes');

  const total = femaleCount + maleCount;
  const feminizationRate = total > 0 ? Math.round((femaleCount / total) * 100) : 0;

  const hasMultipleYears = femaleTrendData.length > 1 && maleTrendData.length > 1;

  const previousFemale = hasMultipleYears ? (femaleTrendData[femaleTrendData.length - 2] ?? 0) : 0;
  const previousMale = hasMultipleYears ? (maleTrendData[maleTrendData.length - 2] ?? 0) : 0;
  const previousTotal = previousFemale + previousMale;
  const previousRate = previousTotal > 0 ? Math.round((previousFemale / previousTotal) * 100) : 0;

  const trendDirection = hasMultipleYears
    ? feminizationRate > previousRate
      ? 'up'
      : feminizationRate < previousRate
        ? 'down'
        : 'stable'
    : 'stable';
  const trendDiff = hasMultipleYears ? feminizationRate - previousRate : 0;

  return (
    <div
      className="fr-card fr-card--shadow"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ padding: '1.5rem 1.75rem 1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: femaleColor,
                }}
              />
              <span className="fr-text-mention--grey fr-text--sm fr-mb-0">Femmes</span>
            </div>
            <p
              className="fr-text--bold fr-text-title--grey fr-mb-0"
              style={{ fontSize: '1.75rem', lineHeight: 1.2 }}
            >
              {femaleCount.toLocaleString('fr-FR')}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
                justifyContent: 'flex-end',
              }}
            >
              <span className="fr-text-mention--grey fr-text--sm fr-mb-0">Hommes</span>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: maleColor,
                }}
              />
            </div>
            <p
              className="fr-text--bold fr-text-title--grey fr-mb-0"
              style={{ fontSize: '1.75rem', lineHeight: 1.2 }}
            >
              {maleCount.toLocaleString('fr-FR')}
            </p>
          </div>
        </div>

        <div
          className="fr-mt-2w"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'start',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span className="fr-text--sm fr-mb-0 fr-text-mention--grey">
            Taux de féminisation :{' '}
            <strong className="fr-text-title--grey">{feminizationRate}%</strong>
          </span>
          {hasMultipleYears && trendDirection !== 'stable' && (
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
              {trendDiff} pts
            </span>
          )}
        </div>
      </div>

      {hasMultipleYears && (
        <div style={{ height: '80px', marginTop: 'auto' }}>
          <Chart
            containerProps={{
              style: { marginLeft: '-.5rem', width: 'calc(100% + 1rem)', height: '80px' },
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
                  stacking: 'normal',
                  lineWidth: 1.5,
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
            <YAxis visible={false} />
            <Area.Series
              data={maleTrendData}
              options={{
                name: 'Hommes',
                color: maleColor,
                fillColor: {
                  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                  stops: [
                    [0, `${maleColor}60`],
                    [1, `${maleColor}20`],
                  ],
                },
              }}
            />
            <Area.Series
              data={femaleTrendData}
              options={{
                name: 'Femmes',
                color: femaleColor,
                fillColor: {
                  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                  stops: [
                    [0, `${femaleColor}60`],
                    [1, `${femaleColor}20`],
                  ],
                },
              }}
            />
          </Chart>
        </div>
      )}
    </div>
  );
}
