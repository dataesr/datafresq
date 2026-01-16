import { SimpleStatCard } from '@/components/cards/StatCards';
import { AutoGrid } from '@/components/Grids/AutoGrid';

interface StudentsStatsCardsProps {
  programs: number;
  totalPrograms: number;
  totalStudents: number;
  totalFemale: number;
  totalMale: number;
}

export function StudentsStatsCards({
  programs,
  totalPrograms,
  totalStudents,
  totalFemale,
  totalMale,
}: StudentsStatsCardsProps) {
  const feminizationRate =
    totalStudents > 0 ? `${Math.round((totalFemale / totalStudents) * 100)}%` : '-';

  return (
    <AutoGrid min={270}>
      <SimpleStatCard
        value={
          <>
            {totalPrograms}
            <span className="fr-text-mention--grey fr-text--regular fr-text--sm">{` / ${programs}`}</span>
          </>
        }
        label="Formations"
        icon="fr-icon-book-2-line"
        color="purple-glycine"
      />
      <SimpleStatCard
        value={totalStudents}
        label="Étudiants inscrits"
        icon="fr-icon-team-fill"
        color="green-archipel"
      />
      <SimpleStatCard
        value={totalFemale}
        label="Femmes"
        icon="fr-icon-user-heart-fill"
        color="pink-macaron"
      />
      <SimpleStatCard
        value={totalMale}
        label="Hommes"
        icon="fr-icon-user-fill"
        color="blue-cumulus"
      />
      <SimpleStatCard
        value={feminizationRate}
        label="Taux de féminisation"
        icon="fr-icon-user-star-fill"
        color="yellow-tournesol"
      />
    </AutoGrid>
  );
}
