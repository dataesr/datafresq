import { SimpleStatCard } from '@/components/cards/StatCards';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import type { InsersupYearStats } from '~/schemas/aggregations';

interface InsersupStatsCardsProps {
  yearData: InsersupYearStats;
  programs: number;
}

export function InsersupStatsCards({ yearData, programs }: InsersupStatsCardsProps) {
  const pursuitRate =
    yearData.nbEtudiants > 0 && yearData.nbPoursuivants > 0
      ? `${Math.round((yearData.nbPoursuivants / yearData.nbEtudiants) * 100)}%`
      : '-';

  return (
    <AutoGrid min={270}>
      <SimpleStatCard
        value={
          <>
            {yearData.programs?.length || 0}
            <span className="fr-text-mention--grey fr-text--regular fr-text--sm">{` / ${programs}`}</span>
          </>
        }
        label="Formations"
        icon="fr-icon-book-2-line"
        color="pink-macaron"
      />
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
    </AutoGrid>
  );
}
