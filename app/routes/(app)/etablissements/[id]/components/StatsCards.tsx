import { SimpleStatCard } from '@/components/cards/StatCards/SimpleStatCard';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import type { EtablissementYearStats } from '~/schemas/etablissements';

interface StatsCardsProps {
  yearData: EtablissementYearStats;
}

export function StatsCards({ yearData }: StatsCardsProps) {
  const feminizationRate =
    yearData.total > 0 ? `${Math.round((yearData.female / yearData.total) * 100)}%` : '-';

  return (
    <AutoGrid min={270}>
      <SimpleStatCard
        value={yearData.total.toLocaleString('fr-FR')}
        label="Étudiants inscrits"
        icon="fr-icon-team-fill"
        color="green-archipel"
      />
      <SimpleStatCard
        value={yearData.female.toLocaleString('fr-FR')}
        label="Femmes"
        icon="fr-icon-user-fill"
        color="pink-macaron"
      />
      <SimpleStatCard
        value={yearData.male.toLocaleString('fr-FR')}
        label="Hommes"
        icon="fr-icon-user-fill"
        color="yellow-tournesol"
      />
      <SimpleStatCard
        value={feminizationRate}
        label="Taux de féminisation"
        icon="fr-icon-user-star-fill"
        color="blue-cumulus"
      />
    </AutoGrid>
  );
}
