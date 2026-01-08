import { Link, useParams } from 'react-router';
import { useWorkspaceAggregations, useWorkspacePermissions } from '@/api/workspaces';
import '@/components/highcharts';
import { StudentsView } from './tableau-de-bord/components';

export default function EffectifsEtudiants() {
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

  if (!aggregations?.studentsAggregations) {
    return (
      <div className="fr-my-12w">
        <p className="fr-text-mention--grey">
          <i>Les formations de cet espace n'ont pas de données d'effectifs étudiants.</i>
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
      <StudentsView
        aggregations={aggregations.studentsAggregations}
        programCount={aggregations.programCount}
      />
    </div>
  );
}
