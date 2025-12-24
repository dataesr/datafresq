import { getChartColor } from '@/components/highcharts';
import type { colorFamily } from '@/components/highcharts/colors';

type ColorName = (typeof colorFamily)[number];

export interface SimpleStatCardProps {
  value: string | number;
  label: string;
  icon?: string;
  color?: ColorName;
}

export function SimpleStatCard({
  value,
  label,
  icon,
  color = 'blue-cumulus',
}: SimpleStatCardProps) {
  const chartColor = getChartColor(color);

  return (
    <div
      className="fr-card fr-card--shadow"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p className="fr-text-mention--grey fr-text--sm fr-mb-1w">{label}</p>
            <p
              className="fr-text--bold fr-text-title--grey"
              style={{ marginBottom: '0.25rem', fontSize: '1.75rem' }}
            >
              {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
            </p>
          </div>
          {icon && <span className={icon} style={{ color: chartColor }} aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
