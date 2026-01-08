import { Link, useParams } from 'react-router';
import { useWorkspaceAggregations, useWorkspacePermissions } from '@/api/workspaces';
import '@/components/highcharts';
import { ProgramsView } from './tableau-de-bord/components';

export default function OffreDeFormation() {
  const { id: workspaceId = '' } = useParams<{ id: string }>();
  const { data: aggregations } = useWorkspaceAggregations(workspaceId);
  const { canEdit } = useWorkspacePermissions(workspaceId);

  if (aggregations.programCount === 0) {
    return (
      <div className="fr-my-12w">
        <p className="fr-text-mention--grey">
          <i>Cet espace de travail ne contient pas encore de formations.</i>
          <br />
          {canEdit && <i>Rendez-vous dans la section explorer pour ajouter des formations.</i>}
        </p>
        {canEdit && (
          <Link to="/formations" className="fr-btn fr-btn--secondary">
            Explorer les formations
          </Link>
        )}
      </div>
    );
  }

  if (!aggregations?.programAggregations) {
    return (
      <div className="fr-my-12w">
        <p className="fr-text-mention--grey">
          <i>Les formations de cet espace n'ont pas de données agrégées.</i>
          <br />
          {canEdit && <i>Rendez-vous dans la section explorer pour ajouter des formations.</i>}
        </p>
        {canEdit && (
          <Link to="/formations" className="fr-btn fr-btn--secondary">
            Explorer les formations
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="fr-pb-4w fr-pt-4w">
      <ProgramsView
        aggregations={aggregations.programAggregations}
        programCount={aggregations.programCount}
      />
    </div>
  );
}
