import { SimpleStatCard } from '@/components/cards/StatCards';
import { AutoGrid } from '@/components/Grids/AutoGrid';

interface ProgramsStatsCardsProps {
  programCount: number;
  cycleCount: number;
  regionCount: number;
  diplomaCount: number;
}

export function ProgramsStatsCards({
  programCount,
  cycleCount,
  regionCount,
  diplomaCount,
}: ProgramsStatsCardsProps) {
  return (
    <AutoGrid type="fill" min={300}>
      <SimpleStatCard
        value={programCount}
        label="Formations"
        icon="fr-icon-file-fill"
        color="purple-glycine"
      />
      <SimpleStatCard
        value={cycleCount}
        label="Cycles LMD"
        icon="fr-icon-git-branch-fill"
        color="blue-cumulus"
      />
      <SimpleStatCard
        value={regionCount}
        label="Régions"
        icon="fr-icon-map-pin-2-fill"
        color="green-archipel"
      />
      <SimpleStatCard
        value={diplomaCount}
        label="Types de diplômes"
        icon="fr-icon-award-fill"
        color="yellow-tournesol"
      />
    </AutoGrid>
  );
}
