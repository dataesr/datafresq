import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Bar, Column, Line, Pie } from '@highcharts/react/series';
import { Activity, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useWorkspaceAggregations, useWorkspacePermissions } from '@/api/workspaces';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { ChoroplethMap } from '@/components/charts/MapChart';
import { SpiderChart } from '@/components/charts/SpiderChart';
import { AutoGrid } from '@/components/Grids/AutoGrid';
// Import highcharts config to ensure modules are loaded
import '@/components/highcharts';
import {
  FeminizationRateCard,
  SimpleStatCard,
  SparklineStatCard,
} from '@/components/cards/StatCards';
import { getChartColor, getColorForSeries } from '@/components/highcharts';
import type { colorFamily } from '@/components/highcharts/colors';

type ColorName = (typeof colorFamily)[number];

// Mapping from region names to Highcharts map keys
const regionToHcKey: Record<string, string> = {
  Corse: 'fr-cor',
  Bretagne: 'fr-bre',
  'Pays de la Loire': 'fr-pdl',
  "Provence-Alpes-Côte d'Azur": 'fr-pac',
  Occitanie: 'fr-occ',
  'Nouvelle-Aquitaine': 'fr-naq',
  'Bourgogne-Franche-Comté': 'fr-bfc',
  'Centre-Val de Loire': 'fr-cvl',
  'Île-de-France': 'fr-idf',
  'Hauts-de-France': 'fr-hdf',
  Normandie: 'fr-nor',
  'Grand Est': 'fr-ges',
  'Auvergne-Rhône-Alpes': 'fr-ara',
  Guadeloupe: 'fr-gua',
  Martinique: 'fr-mq',
  Guyane: 'fr-gf',
  'La Réunion': 'fr-lre',
  Mayotte: 'fr-may',
};

const cycleColors: ColorName[] = [
  'green-archipel',
  'blue-cumulus',
  'purple-glycine',
  'yellow-tournesol',
  'pink-macaron',
];

export default function TableauDeBord() {
  const { id: workspaceId = '' } = useParams<{ id: string }>();
  const { data: aggregations } = useWorkspaceAggregations(workspaceId);
  const { canEdit } = useWorkspacePermissions(workspaceId);
  const [view, setView] = useState<'programs' | 'students' | 'custom'>('programs');

  // Chart refs for export functionality
  const yearChartRef = useRef<HighchartsReactRefObject | null>(null);
  const cycleChartRef = useRef<HighchartsReactRefObject | null>(null);
  const diplomaChartRef = useRef<HighchartsReactRefObject | null>(null);
  const disciplineChartRef = useRef<HighchartsReactRefObject | null>(null);
  const gdDisciplineChartRef = useRef<HighchartsReactRefObject | null>(null);
  const academyChartRef = useRef<HighchartsReactRefObject | null>(null);

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

  const { studentsAggregations: studentsAgg, programAggregations: progAgg } = aggregations;

  // Students aggregations (from SISE collection)
  const {
    totalPrograms,
    totalStudents,
    totalFemale,
    totalMale,
    byYear,
    byCycle: studentsByCycle,
    byRegion: studentsByRegion,
    byDiploma: studentsByDiploma,
    byDiscipline: studentsByDiscipline,
    byAcademy: studentsByAcademy,
    byLargeDiscipline,
  } = studentsAgg || {
    totalPrograms: 0,
    totalStudents: 0,
    totalFemale: 0,
    totalMale: 0,
    byYear: [],
    byCycle: [],
    byRegion: [],
    byDiploma: [],
    byDiscipline: [],
    byAcademy: [],
    byLargeDiscipline: [],
  };

  // Program aggregations (from programs collection)
  const {
    byCycle: progByCycle,
    byRegion: progByRegion,
    byDiploma: progByDiploma,
    byAcademy: progByAcademy,
    byDiscipline: progByDiscipline,
    byRome: progByRome,
  } = progAgg || {
    byCycle: [],
    byRegion: [],
    byDiploma: [],
    byAcademy: [],
    byDiscipline: [],
    byRome: [],
  };

  // Helper to determine which value to use based on view
  const isStudentView = view === 'students';
  const valueLabel = isStudentView ? 'étudiants' : 'formations';
  const dataSource = isStudentView ? 'Données SISE.' : 'Données Fresq.';

  // Prepare data for year evolution chart (only for students view - programs don't have yearly data)
  const sortedYears = [...byYear].sort((a, b) => a.year.localeCompare(b.year));
  const yearCategories = sortedYears.map((item) => item.year);
  const yearTotalData = sortedYears.map((item) => item.total);
  const yearFemaleData = sortedYears.map((item) => item.female);
  const yearMaleData = sortedYears.map((item) => item.male);

  // Prepare data for cycle pie chart
  const cycleData = isStudentView
    ? studentsByCycle
        .filter((item: { cycle: string; total: number }) => item.cycle && item.total > 0)
        .map((item: { cycle: string; total: number }, index: number) => ({
          name: item.cycle || 'Non renseigné',
          y: item.total,
          color: getChartColor(cycleColors[index % cycleColors.length]!),
        }))
    : progByCycle
        .filter((item: { cycle: string; count: number }) => item.cycle && item.count > 0)
        .map((item: { cycle: string; count: number }, index: number) => ({
          name: item.cycle || 'Non renseigné',
          y: item.count,
          color: getChartColor(cycleColors[index % cycleColors.length]!),
        }));

  // Prepare data for diploma chart (top 8)
  const topDiplomas = isStudentView
    ? [...studentsByDiploma]
        .filter((d) => d.diplomaLabel)
        .sort((a, b) => b.total - a.total)
        .slice(0, 8)
    : [...progByDiploma]
        .filter((d: { diplomaLabel: string }) => d.diplomaLabel)
        .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
        .slice(0, 8);
  const diplomaCategories = topDiplomas.map(
    (d: { diplomaLabel?: string; diploma?: string }) =>
      d.diplomaLabel || d.diploma || 'Non renseigné',
  );
  const diplomaData = isStudentView
    ? (topDiplomas as { total: number; female: number; male: number }[]).map((d) => ({
        y: d.total,
        female: d.female,
        male: d.male,
      }))
    : (topDiplomas as { count: number }[]).map((d) => ({
        y: d.count,
        female: 0,
        male: 0,
      }));

  // Prepare data for discipline chart (top 10)
  const topDisciplines = isStudentView
    ? [...studentsByDiscipline]
        .filter((d) => d.label)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
    : [...progByDiscipline]
        .filter((d: { discipline: string }) => d.discipline)
        .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
        .slice(0, 10);
  const disciplineCategories = isStudentView
    ? topDisciplines.map((d: { label?: string }) => d.label || 'Non renseigné')
    : topDisciplines.map((d: { discipline?: string }) => d.discipline || 'Non renseigné');
  const disciplineData = isStudentView
    ? (topDisciplines as { total: number }[]).map((d) => d.total)
    : (topDisciplines as { count: number }[]).map((d) => d.count);

  // Prepare data for academy chart (top 10)
  const topAcademies = isStudentView
    ? [...studentsByAcademy]
        .filter((a) => a.academy)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
    : [...progByAcademy]
        .filter((a: { academy: string }) => a.academy)
        .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
        .slice(0, 10);
  const academyCategories = topAcademies.map(
    (a: { academy?: string }) => a.academy || 'Non renseigné',
  );
  const academyData = isStudentView
    ? (topAcademies as { total: number }[]).map((a) => a.total)
    : (topAcademies as { count: number }[]).map((a) => a.count);
  const academyFemaleData = isStudentView
    ? (topAcademies as { female: number }[]).map((a) => a.female)
    : [];
  const academyMaleData = isStudentView
    ? (topAcademies as { male: number }[]).map((a) => a.male)
    : [];

  // Prepare data for spider chart (large disciplines for students, ROME for programs)
  const spiderData = isStudentView
    ? (byLargeDiscipline || [])
        .filter((d: { label: string }) => d.label)
        .slice(0, 8)
        .map((d: { label: string; total: number }) => ({
          name: d.label,
          y: d.total,
        }))
    : (progByRome || [])
        .filter((d: { label: string }) => d.label)
        .slice(0, 8)
        .map((d: { label: string; count: number }) => ({
          name: d.label,
          y: d.count,
        }));

  const spiderTitle = isStudentView ? 'Grandes disciplines' : 'Métiers (codes ROME)';

  // Prepare data for choropleth map (all regions)
  const choroplethData = isStudentView
    ? studentsByRegion
        .filter((r: { region: string }) => r.region && regionToHcKey[r.region])
        .map((r: { region: string; total: number }) => ({
          'hc-key': regionToHcKey[r.region]!,
          value: r.total,
          name: r.region,
        }))
    : progByRegion
        .filter((r: { region: string }) => r.region && regionToHcKey[r.region])
        .map((r: { region: string; count: number }) => ({
          'hc-key': regionToHcKey[r.region]!,
          value: r.count,
          name: r.region,
        }));

  return (
    <div className="fr-pb-4w">
      {/* View Switcher */}
      <fieldset className="fr-segmented fr-mb-6w" style={{ width: '500px' }}>
        <legend className="fr-segmented__legend">
          <span className="fr-text--bold">Choix de vue </span>
          <span className="fr-hint-text">
            Voir les données agrégées par formation ou par nombre d'étudiants
          </span>
        </legend>
        <div className="fr-segmented__elements" style={{ width: '100%' }}>
          <div
            className="fr-segmented__element"
            style={{ flex: '1 0 50%', display: 'flex', justifyContent: 'center' }}
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
              Offre de formations
            </label>
          </div>
          <div
            className="fr-segmented__element"
            style={{ flex: '1 0 50%', display: 'flex', justifyContent: 'center' }}
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
              className={`fr-label ${view === 'custom' ? 'fr-icon-team-fill' : 'fr-icon-team-line'}`}
              htmlFor="view-students"
            >
              Effectif étudiants
            </label>
          </div>
        </div>
      </fieldset>
      <Activity
        mode={isStudentView && totalPrograms < aggregations.programCount ? 'visible' : 'hidden'}
      >
        <div className="fr-notice fr-notice--info fr-mb-3w fr-px-2w">
          <div style={{ display: 'flex', alignItems: 'start' }}>
            <span className="fr-icon-info-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
            <p className="fr-text--sm fr-text--bold">
              Les aggrégations d'étudiants ont été calculées sur {totalPrograms} formations qui
              contiennent des données d'étudiants pour la dernière année dans la base de données. Il
              y a {aggregations.programCount - totalPrograms} formations qui ne contiennent pas de
              données d'étudiants pour la dernière année.
            </p>
          </div>
        </div>
      </Activity>
      <hr className="fr-pb-6w" />

      {/* Key Metrics Cards */}
      <Activity mode={isStudentView ? 'visible' : 'hidden'}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            alignItems: 'stretch',
          }}
        >
          <SparklineStatCard
            value={totalStudents}
            label="Étudiants inscrits"
            trendData={yearTotalData}
            color="green-archipel"
            icon="fr-icon-team-fill"
          />
          <FeminizationRateCard
            femaleCount={totalFemale}
            maleCount={totalMale}
            femaleTrendData={yearFemaleData}
            maleTrendData={yearMaleData}
          />
        </div>
      </Activity>
      <AutoGrid type="fill" min={300}>
        <Activity mode={isStudentView ? 'hidden' : 'visible'}>
          <SimpleStatCard
            value={aggregations.programCount}
            label="Formations"
            icon="fr-icon-file-fill"
            color="purple-glycine"
          />
          <SimpleStatCard
            value={progByCycle.length}
            label="Cycles LMD"
            icon="fr-icon-git-branch-fill"
            color="blue-cumulus"
          />
          <SimpleStatCard
            value={progByRegion.length}
            label="Régions"
            icon="fr-icon-map-pin-2-fill"
            color="green-archipel"
          />
          <SimpleStatCard
            value={progByDiploma.length}
            label="Types de diplômes"
            icon="fr-icon-award-fill"
            color="yellow-tournesol"
          />
        </Activity>
      </AutoGrid>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gap: '2rem', marginTop: '3rem' }}>
        {/* Year Evolution Chart - Only show for students view */}
        {isStudentView && byYear.length > 1 && (
          <AnalyticsGraph
            title="Évolution des effectifs par année universitaire"
            description={`Évolution du nombre d'étudiants inscrits au fil des années universitaires.`}
            chartRef={yearChartRef}
            source={dataSource}
            details={
              <span>
                Données disponibles sur {byYear.length} années universitaires (
                {byYear[byYear.length - 1].year} - {byYear[0].year})
              </span>
            }
          >
            <Chart
              ref={yearChartRef}
              containerProps={{
                style: { width: '100%', minWidth: '300px', height: '400px' },
              }}
            >
              <Credits enabled={false} />
              <Legend align="center" />
              <Tooltip shared />
              <XAxis categories={yearCategories} title={{ text: 'Année universitaire' }} />
              <YAxis min={0} title={{ text: "Nombre d'étudiants" }} />
              <Line.Series
                data={yearTotalData}
                options={{
                  name: 'Total',
                  color: getColorForSeries('total'),
                }}
              />
              <Line.Series
                data={yearFemaleData}
                options={{
                  name: 'Femmes',
                  color: getColorForSeries('femmes'),
                }}
              />
              <Line.Series
                data={yearMaleData}
                options={{
                  name: 'Hommes',
                  color: getColorForSeries('hommes'),
                }}
              />
            </Chart>
          </AnalyticsGraph>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Cycle Distribution Pie Chart */}
          {cycleData.length > 0 && (
            <AnalyticsGraph
              title={`Répartition par cycle LMD (${valueLabel})`}
              description={`Distribution ${isStudentView ? 'des étudiants' : 'des formations'} par cycle Licence, Master et Doctorat. ${dataSource}`}
              chartRef={cycleChartRef}
            >
              <Chart
                ref={cycleChartRef}
                containerProps={{
                  style: { width: '100%', minWidth: '300px', height: '350px' },
                }}
              >
                <Credits enabled={false} />
                <Legend align="center" />
                <Tooltip pointFormat={`<b>{point.y}</b> ${valueLabel} ({point.percentage:.1f}%)`} />
                <Pie.Series
                  data={cycleData}
                  options={{
                    name: isStudentView ? 'Étudiants' : 'Formations',
                    innerSize: '50%',
                    dataLabels: {
                      enabled: true,
                      format: '{point.name}: {point.percentage:.1f}%',
                    },
                  }}
                />
              </Chart>
            </AnalyticsGraph>
          )}
          {/* Diploma Type Chart */}
          {topDiplomas.length > 0 && (
            <AnalyticsGraph
              title={
                isStudentView ? 'Effectifs par type de diplôme' : 'Formations par type de diplôme'
              }
              description={`Répartition ${isStudentView ? 'des étudiants' : 'des formations'} par type de diplôme préparé. ${dataSource}`}
              chartRef={diplomaChartRef}
            >
              <Chart
                ref={diplomaChartRef}
                containerProps={{
                  style: { width: '100%', minWidth: '300px', height: '400px' },
                }}
              >
                <Credits enabled={false} />
                <Legend enabled={false} />
                <Tooltip valueSuffix={` ${valueLabel}`} />
                <XAxis type="category" categories={diplomaCategories} />
                <YAxis
                  min={0}
                  allowDecimals={false}
                  title={{
                    text: isStudentView ? "Nombre d'étudiants" : 'Nombre de formations',
                  }}
                />
                <Column.Series
                  data={diplomaData}
                  options={{
                    name: isStudentView ? 'Étudiants' : 'Formations',
                    color: getChartColor('blue-cumulus'),
                    dataLabels: {
                      enabled: true,
                      format: '{y}',
                    },
                  }}
                />
              </Chart>
            </AnalyticsGraph>
          )}
          {/* Academy by Gender Stacked Chart */}
          {topAcademies.length > 0 && (
            <AnalyticsGraph
              title={
                isStudentView ? 'Top 10 académies par genre' : `Top 10 académies (${valueLabel})`
              }
              description={`Les 10 académies avec le plus ${isStudentView ? "d'étudiants, répartis par genre" : 'de formations'}. ${dataSource}`}
              chartRef={academyChartRef}
            >
              {isStudentView ? (
                <Chart
                  key="academy-students"
                  ref={academyChartRef}
                  containerProps={{
                    style: { width: '100%', minWidth: '300px', height: '400px' },
                  }}
                >
                  <Credits enabled={false} />
                  <Legend align="center" />
                  <Tooltip valueSuffix=" étudiants" />
                  <XAxis type="category" categories={academyCategories} />
                  <YAxis min={0} title={{ text: '' }} stackLabels={{ enabled: true }} />
                  <Bar.Series
                    data={academyFemaleData}
                    options={{
                      name: 'Femmes',
                      color: getColorForSeries('femmes'),
                      stacking: 'normal',
                    }}
                  />
                  <Bar.Series
                    data={academyMaleData}
                    options={{
                      name: 'Hommes',
                      color: getColorForSeries('hommes'),
                      stacking: 'normal',
                    }}
                  />
                </Chart>
              ) : (
                <Chart
                  key="academy-programs"
                  ref={academyChartRef}
                  containerProps={{
                    style: { width: '100%', minWidth: '300px', height: '400px' },
                  }}
                >
                  <Credits enabled={false} />
                  <Legend enabled={false} />
                  <Tooltip valueSuffix=" formations" />
                  <XAxis type="category" categories={academyCategories} />
                  <YAxis min={0} allowDecimals={false} title={{ text: '' }} />
                  <Bar.Series
                    data={academyData}
                    options={{
                      name: 'Formations',
                      color: getChartColor('pink-macaron'),
                      dataLabels: {
                        enabled: true,
                        format: '{y}',
                      },
                    }}
                  />
                </Chart>
              )}
            </AnalyticsGraph>
          )}
          {/* Choropleth Map - Regional distribution */}
          {choroplethData.length > 0 && (
            <AnalyticsGraph
              title={`Carte des régions (${valueLabel})`}
              description={`Répartition géographique ${isStudentView ? 'des étudiants' : 'des formations'} par région. ${dataSource}`}
            >
              <div style={{ width: '100%', minWidth: '300px', height: '400px' }}>
                <ChoroplethMap
                  data={choroplethData}
                  tooltipPointFormat={`<b>{point.name}</b>: {point.value} ${valueLabel}`}
                />
              </div>
            </AnalyticsGraph>
          )}
          {/* Spider Chart - Large Disciplines / ROME */}
          {spiderData.length > 0 && (
            <AnalyticsGraph
              title={`${spiderTitle} (${valueLabel})`}
              description={`Répartition ${isStudentView ? 'des étudiants par grande discipline' : 'des formations par métier (codes ROME)'}. ${dataSource}`}
              chartRef={gdDisciplineChartRef}
            >
              <div style={{ width: '100%', minWidth: '300px', height: '400px' }}>
                <SpiderChart
                  data={spiderData}
                  seriesName={isStudentView ? 'Étudiants' : 'Formations'}
                />
              </div>
            </AnalyticsGraph>
          )}
          {topDisciplines.length > 0 && (
            <AnalyticsGraph
              title={`Top 10 secteurs disciplinaires (${valueLabel})`}
              description={`Les 10 secteurs disciplinaires avec le plus ${isStudentView ? "d'étudiants" : 'de formations'}. ${dataSource}`}
              chartRef={disciplineChartRef}
            >
              <Chart
                ref={disciplineChartRef}
                containerProps={{
                  style: { width: '100%', minWidth: '300px', height: '400px' },
                }}
              >
                <Credits enabled={false} />
                <Legend enabled={false} />
                <Tooltip valueSuffix={` ${valueLabel}`} />
                <XAxis type="category" categories={disciplineCategories} />
                <YAxis min={0} allowDecimals={false} title={{ text: '' }} />
                <Bar.Series
                  data={disciplineData}
                  options={{
                    name: isStudentView ? 'Étudiants' : 'Formations',
                    color: getChartColor('purple-glycine'),
                    dataLabels: {
                      enabled: true,
                      format: '{y}',
                    },
                  }}
                />
              </Chart>
            </AnalyticsGraph>
          )}
        </div>
      </div>
    </div>
  );
}
