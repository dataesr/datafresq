import { getChartColor } from '@/components/highcharts';
import type { colorFamily } from '@/components/highcharts/colors';

type ColorName = (typeof colorFamily)[number];

export interface SimpleStatCardProps {
  value: string | number | React.ReactNode;
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
    <div className="fr-card fr-card--shadow fr-px-5v fr-py-3w" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        {icon && (
          <div
            className={icon}
            aria-hidden="true"
            style={{
              width: '2.5rem',
              height: '2.5rem',
              minWidth: '2.5rem',
              borderRadius: '0.375rem',
              background: `${chartColor}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: chartColor,
            }}
          />
        )}
        <div>
          <p
            className="fr-text--bold fr-text-title--grey fr-mb-0"
            style={{ fontSize: '1.5rem', lineHeight: 1.2 }}
          >
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-0">{label}</p>
        </div>
      </div>
    </div>
  );
}
