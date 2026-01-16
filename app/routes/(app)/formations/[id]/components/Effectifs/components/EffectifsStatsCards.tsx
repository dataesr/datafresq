import { SimpleStatCard } from '@/components/cards/StatCards';

interface EffectifsStatsCardsProps {
  year: string;
  total: number;
  women: number;
  men: number;
}

export function EffectifsStatsCards({ year, total, women, men }: EffectifsStatsCardsProps) {
  const feminizationRate = total > 0 ? `${Math.round((women / total) * 100)}%` : '-';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem',
      }}
    >
      <SimpleStatCard
        value={total}
        label={`Étudiants inscrits (${year})`}
        icon="fr-icon-team-fill"
        color="green-archipel"
      />
      <SimpleStatCard
        value={women}
        label="Femmes"
        icon="fr-icon-user-heart-fill"
        color="pink-macaron"
      />
      <SimpleStatCard value={men} label="Hommes" icon="fr-icon-user-fill" color="blue-cumulus" />
      <SimpleStatCard
        value={feminizationRate}
        label="Taux de féminisation"
        icon="fr-icon-user-star-fill"
        color="yellow-tournesol"
      />
    </div>
  );
}
