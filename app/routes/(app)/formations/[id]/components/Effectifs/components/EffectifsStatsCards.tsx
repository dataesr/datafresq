import { SimpleStatCard } from '@/components/cards/StatCards';
import { AutoGrid } from '@/components/Grids/AutoGrid';

interface EffectifsStatsCardsProps {
  total: number;
  women: number;
  men: number;
}

export function EffectifsStatsCards({ total, women, men }: EffectifsStatsCardsProps) {
  const feminizationRate = total > 0 ? `${Math.round((women / total) * 100)}%` : '-';

  return (
    <AutoGrid min={180}>
      <SimpleStatCard
        value={total}
        label={`Étudiants inscrits`}
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
    </AutoGrid>
  );
}
