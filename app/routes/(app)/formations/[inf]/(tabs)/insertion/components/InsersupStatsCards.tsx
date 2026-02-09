import { SimpleStatCard } from '@/components/cards/StatCards';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import type { InsersupYearStats } from '~/schemas/programs';

interface InsersupStatsCardsProps {
  yearData: InsersupYearStats;
}

export function InsersupStatsCards({ yearData }: InsersupStatsCardsProps) {
  const pursuitRate =
    yearData.nbEtudiants > 0 && yearData.nbPoursuivants > 0
      ? `${Math.round((yearData.nbPoursuivants / yearData.nbEtudiants) * 100)}%`
      : '0%';

  const medianSalary = yearData.salaires?.m18?.median
    ? `${yearData.salaires.m18.median.toLocaleString('fr-FR')} €`
    : '-';

  return (
    <AutoGrid min={270}>
      <SimpleStatCard
        value={yearData.nbEtudiants}
        label="Diplômés suivis"
        icon="fr-icon-user-fill"
        color="blue-cumulus"
      />
      <SimpleStatCard
        value={yearData.nbSortants}
        label="Sortants"
        icon="fr-icon-arrow-right-up-line"
        color="green-archipel"
      />
      <SimpleStatCard
        value={yearData.nbPoursuivants}
        label="Poursuivants"
        icon="fr-icon-book-2-fill"
        color="purple-glycine"
      />
      <SimpleStatCard
        value={pursuitRate}
        label="Taux de poursuite"
        icon="fr-icon-git-merge-line"
        color="yellow-tournesol"
      />
      <SimpleStatCard
        value={medianSalary}
        label="Salaire médian (18 mois)"
        icon="fr-icon-money-euro-circle-line"
        color="yellow-tournesol"
      />
    </AutoGrid>
  );
}
