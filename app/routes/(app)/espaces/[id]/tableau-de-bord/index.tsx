import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Link, useParams } from 'react-router';
import { useWorkspaceAggregations, useWorkspacePermissions } from '@/api/workspaces';
import '@/components/highcharts';
import type { DashboardView } from './components';
import { InsersupView, ProgramsView, StudentsView } from './components';

const viewOptions = ['programs', 'students', 'insersup'] as const;

export default function TableauDeBord() {
  const { id: workspaceId = '' } = useParams<{ id: string }>();
  const { data: aggregations } = useWorkspaceAggregations(workspaceId);
  const { canEdit } = useWorkspacePermissions(workspaceId);

  const [view, setView] = useQueryState<DashboardView>(
    'view',
    parseAsStringLiteral(viewOptions).withDefault('programs'),
  );

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

  if (!aggregations?.studentsAggregations && !aggregations?.programAggregations) {
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

  const { studentsAggregations, programAggregations, insersupAggregations } = aggregations;

  const isStudentView = view === 'students';
  const isInsersupView = view === 'insersup';
  const isProgramsView = view === 'programs';

  return (
    <div className="fr-pb-4w">
      {/* View Switcher */}
      <fieldset className="fr-segmented fr-mb-6w" style={{ width: '750px' }}>
        <legend className="fr-segmented__legend">
          <span className="fr-text--bold">Choix de vue </span>
          <span className="fr-hint-text">
            Voir les données agrégées par formation, effectifs étudiants ou insertion
            professionnelle
          </span>
        </legend>
        <div className="fr-segmented__elements" style={{ width: '100%' }}>
          <div
            className="fr-segmented__element"
            style={{ flex: '1 0 33.33%', display: 'flex', justifyContent: 'center' }}
          >
            <input
              type="radio"
              id="view-programs"
              name="dashboard-view"
              value="programs"
              checked={view === 'programs'}
              onChange={() => setView('programs')}
            />
            <label
              className={`fr-label ${view === 'programs' ? 'fr-icon-file-fill' : 'fr-icon-file-line'}`}
              htmlFor="view-programs"
            >
              Offre de formation
            </label>
          </div>
          <div
            className="fr-segmented__element"
            style={{ flex: '1 0 33.33%', display: 'flex', justifyContent: 'center' }}
          >
            <input
              type="radio"
              id="view-students"
              name="dashboard-view"
              value="students"
              checked={view === 'students'}
              onChange={() => setView('students')}
            />
            <label
              className={`fr-label ${view === 'students' ? 'fr-icon-team-fill' : 'fr-icon-team-line'}`}
              htmlFor="view-students"
            >
              Effectifs étudiants
            </label>
          </div>
          <div
            className="fr-segmented__element"
            style={{ flex: '1 0 33.33%', display: 'flex', justifyContent: 'center' }}
          >
            <input
              type="radio"
              id="view-insersup"
              name="dashboard-view"
              value="insersup"
              checked={view === 'insersup'}
              onChange={() => setView('insersup')}
            />
            <label
              className={`fr-label ${view === 'insersup' ? 'fr-icon-briefcase-fill' : 'fr-icon-briefcase-line'}`}
              htmlFor="view-insersup"
            >
              Insertion professionnelle
            </label>
          </div>
        </div>
      </fieldset>

      <hr className="fr-pb-6w" />

      {/* Render the appropriate view component */}
      {isProgramsView && (
        <ProgramsView aggregations={programAggregations} programCount={aggregations.programCount} />
      )}

      {isStudentView && (
        <StudentsView
          aggregations={studentsAggregations}
          programCount={aggregations.programCount}
        />
      )}

      {isInsersupView && (
        <InsersupView
          aggregations={insersupAggregations}
          programCount={aggregations.programCount}
        />
      )}
    </div>
  );
}
