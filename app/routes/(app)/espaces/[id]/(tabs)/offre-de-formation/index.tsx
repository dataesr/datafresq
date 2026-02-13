import { useParams } from 'react-router';
import { useWorkspaceAggregations, useWorkspacePermissions } from '@/api/workspaces';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import '@/components/charts/highcharts';
import { EmptyWorkspace } from '../components/EmptyWorkspace';
import { AcademyDistributionChart } from './components/AcademyDistributionChart';
import { CycleDistributionChart } from './components/CycleDistributionChart';
import { DiplomaDistributionChart } from './components/DiplomaDistributionChart';
import { DisciplineDistributionChart } from './components/DisciplineDistributionChart';
import { ProgramsStatsCards } from './components/ProgramsStatsCards';
import { RegionChoroplethMap } from './components/RegionChoroplethMap';
import { RomeSpiderChart } from './components/RomeSpiderChart';

export default function OffreDeFormation() {
  const { id: workspaceId = '' } = useParams<{ id: string }>();
  const { data: aggregations } = useWorkspaceAggregations(workspaceId);
  const { canEdit } = useWorkspacePermissions(workspaceId);

  if (aggregations.programCount === 0) {
    return (
      <EmptyWorkspace
        description="Cet espace de travail ne contient pas encore de formations."
        canEdit={canEdit}
      />
    );
  }

  const programAggregations = aggregations?.programAggregations;

  if (!programAggregations) {
    return (
      <EmptyWorkspace
        description="Cet espace de travail ne contient pas de données aggrégées."
        canEdit={canEdit}
      />
    );
  }

  const { byCycle, byRegion, byDiploma, byAcademy, byDiscipline, byRome } = programAggregations;

  return (
    <div className="fr-pb-4w">
      <ProgramsStatsCards
        programCount={aggregations.programCount}
        cycleCount={byCycle.length}
        regionCount={byRegion.length}
        diplomaCount={byDiploma.length}
      />

      <AutoGrid min={500}>
        {byCycle.length > 0 && <CycleDistributionChart data={byCycle} />}

        {byDiploma.length > 0 && <DiplomaDistributionChart data={byDiploma} />}

        {byAcademy.length > 0 && <AcademyDistributionChart data={byAcademy} />}

        {byRegion.length > 0 && <RegionChoroplethMap data={byRegion} />}

        {byRome && byRome.length > 0 && <RomeSpiderChart data={byRome} />}

        {byDiscipline.length > 0 && <DisciplineDistributionChart data={byDiscipline} />}
      </AutoGrid>
    </div>
  );
}
