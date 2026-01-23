import { getChartColor } from '@/components/highcharts';
import type { colorFamily } from '@/components/highcharts/colors';
import './styles.css';

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
    <div className="fx-card fx-card--shadow fx-card--sm">
      <div className="stat-card">
        {icon && (
          <div
            className={`icon-box ${icon}`}
            aria-hidden="true"
            style={{
              background: `${chartColor}20`,
              color: chartColor,
            }}
          />
        )}
        <div>
          <p className="fr-text--bold fr-text-title--grey fr-mb-0 stat-card__value">
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-0">{label}</p>
        </div>
      </div>
    </div>
  );
}
