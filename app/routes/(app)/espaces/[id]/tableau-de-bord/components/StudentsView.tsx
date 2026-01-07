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
import { useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { FeminizationRateCard, SparklineStatCard } from '@/components/cards/StatCards';
import { ChoroplethMap } from '@/components/charts/MapChart';
import { SpiderChart } from '@/components/charts/SpiderChart';
import { getChartColor, getColorForSeries } from '@/components/highcharts';
import type { StudentsViewProps } from './types';
import { cycleColors, regionToHcKey } from './utils';

export function StudentsView({ aggregations, programCount }: StudentsViewProps) {
  const yearChartRef = useRef<HighchartsReactRefObject | null>(null);
  const cycleChartRef = useRef<HighchartsReactRefObject | null>(null);
  const diplomaChartRef = useRef<HighchartsReactRefObject | null>(null);
  const disciplineChartRef = useRef<HighchartsReactRefObject | null>(null);
  const academyChartRef = useRef<HighchartsReactRefObject | null>(null);
  const gdDisciplineChartRef = useRef<HighchartsReactRefObject | null>(null);

  if (!aggregations) {
    return (
      <div className="fr-py-2w fr-px-3v fr-background-alt--grey fx-radius--sm">
        <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
          Aucune donnée d'effectifs étudiants disponible.
        </p>
      </div>
    );
  }

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
  } = aggregations;

  // Prepare data for year evolution chart
  const sortedYears = [...byYear].sort((a, b) => a.year.localeCompare(b.year));
  const yearCategories = sortedYears.map((item) => item.year);
  const yearTotalData = sortedYears.map((item) => item.total);
  const yearFemaleData = sortedYears.map((item) => item.female);
  const yearMaleData = sortedYears.map((item) => item.male);

  // Prepare data for cycle pie chart
  const cycleData = studentsByCycle
    .filter((item) => item.cycle && item.total > 0)
    .map((item, index) => ({
      name: item.cycle || 'Non renseigné',
      y: item.total,
      color: getChartColor(cycleColors[index % cycleColors.length]!),
    }));

  // Prepare data for diploma chart (top 8)
  const topDiplomas = [...studentsByDiploma]
    .filter((d) => d.diplomaLabel)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
  const diplomaCategories = topDiplomas.map((d) => d.diplomaLabel || d.diploma || 'Non renseigné');
  const diplomaData = topDiplomas.map((d) => ({
    y: d.total,
    female: d.female,
    male: d.male,
  }));

  // Prepare data for discipline chart (top 10)
  const topDisciplines = [...studentsByDiscipline]
    .filter((d) => d.label || d.disciplineLabel)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const disciplineCategories = topDisciplines.map(
    (d) => d.label || d.disciplineLabel || 'Non renseigné',
  );
  const disciplineData = topDisciplines.map((d) => d.total);

  // Prepare data for academy chart (top 10)
  const topAcademies = [...studentsByAcademy]
    .filter((a) => a.academy)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const academyCategories = topAcademies.map((a) => a.academy || 'Non renseigné');
  const academyFemaleData = topAcademies.map((a) => a.female);
  const academyMaleData = topAcademies.map((a) => a.male);

  // Prepare data for spider chart (large disciplines)
  const spiderData = (byLargeDiscipline || [])
    .filter((d) => d.label || d.largeDisciplineLabel)
    .slice(0, 8)
    .map((d) => ({
      name: d.label || d.largeDisciplineLabel || '',
      y: d.total,
    }));

  // Prepare data for choropleth map
  const choroplethData = studentsByRegion
    .filter((r) => r.region && regionToHcKey[r.region])
    .map((r) => ({
      'hc-key': regionToHcKey[r.region]!,
      value: r.total,
      name: r.region,
    }));

  return (
    <>
      {/* Notice about program count */}
      {totalPrograms < programCount && (
        <div className="fr-notice fr-notice--info fr-mb-3w fr-px-2w">
          <div style={{ display: 'flex', alignItems: 'start' }}>
            <span className="fr-icon-info-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
            <p className="fr-text--sm fr-text--bold">
              Les agrégations d'étudiants ont été calculées sur {totalPrograms} formations qui
              contiennent des données d'effectifs étudiants pour la dernière année dans la base de
              données. Il y a {programCount - totalPrograms} formation
              {programCount - totalPrograms > 1 ? 's' : ''} qui ne contien
              {programCount - totalPrograms > 1 ? 'nen' : ''}t pas de données d'effectifs étudiants
              pour la dernière année.
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
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

      {/* Charts Grid */}
      <div style={{ display: 'grid', gap: '2rem', marginTop: '3rem' }}>
        {/* Year Evolution Chart */}
        {byYear.length > 1 && (
          <AnalyticsGraph
            title="Évolution des effectifs par année universitaire"
            description="Évolution du nombre d'étudiants inscrits au fil des années universitaires."
            chartRef={yearChartRef}
            source="SISE (MESR)"
            details={
              <span>
                Données disponibles sur {byYear.length} années universitaires (
                {byYear[byYear.length - 1]?.year} - {byYear[0]?.year})
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
              title="Répartition par cycle LMD (étudiants)"
              description="Distribution des étudiants par cycle Licence, Master et Doctorat."
              chartRef={cycleChartRef}
              source="SISE (MESR)"
            >
              <Chart
                ref={cycleChartRef}
                containerProps={{
                  style: { width: '100%', minWidth: '300px', height: '350px' },
                }}
              >
                <Credits enabled={false} />
                <Legend align="center" />
                <Tooltip pointFormat="<b>{point.y}</b> étudiants ({point.percentage:.1f}%)" />
                <Pie.Series
                  data={cycleData}
                  options={{
                    name: 'Étudiants',
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
              title="Effectifs par type de diplôme"
              description="Répartition des étudiants par type de diplôme préparé."
              chartRef={diplomaChartRef}
              source="SISE (MESR)"
            >
              <Chart
                ref={diplomaChartRef}
                containerProps={{
                  style: { width: '100%', minWidth: '300px', height: '400px' },
                }}
              >
                <Credits enabled={false} />
                <Legend enabled={false} />
                <Tooltip valueSuffix=" étudiants" />
                <XAxis type="category" categories={diplomaCategories} />
                <YAxis min={0} allowDecimals={false} title={{ text: "Nombre d'étudiants" }} />
                <Column.Series
                  data={diplomaData}
                  options={{
                    name: 'Étudiants',
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
              title="Top 10 académies par genre"
              description="Les 10 académies avec le plus d'étudiants, répartis par genre."
              chartRef={academyChartRef}
              source="SISE (MESR)"
            >
              <Chart
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
            </AnalyticsGraph>
          )}

          {/* Choropleth Map */}
          {choroplethData.length > 0 && (
            <AnalyticsGraph
              title="Carte des régions (étudiants)"
              description="Répartition géographique des étudiants par région."
              source="SISE (MESR)"
            >
              <div style={{ width: '100%', minWidth: '300px', height: '400px' }}>
                <ChoroplethMap
                  data={choroplethData}
                  tooltipPointFormat="<b>{point.name}</b>: {point.value} étudiants"
                />
              </div>
            </AnalyticsGraph>
          )}

          {/* Spider Chart - Large Disciplines */}
          {spiderData.length > 0 && (
            <AnalyticsGraph
              title="Grandes disciplines (étudiants)"
              description="Répartition des étudiants par grande discipline."
              chartRef={gdDisciplineChartRef}
              source="SISE (MESR)"
            >
              <div style={{ width: '100%', minWidth: '300px', height: '400px' }}>
                <SpiderChart data={spiderData} seriesName="Étudiants" />
              </div>
            </AnalyticsGraph>
          )}

          {/* Discipline Chart */}
          {topDisciplines.length > 0 && (
            <AnalyticsGraph
              title="Top 10 secteurs disciplinaires (étudiants)"
              description="Les 10 secteurs disciplinaires avec le plus d'étudiants."
              chartRef={disciplineChartRef}
              source="SISE (MESR)"
            >
              <Chart
                ref={disciplineChartRef}
                containerProps={{
                  style: { width: '100%', minWidth: '300px', height: '400px' },
                }}
              >
                <Credits enabled={false} />
                <Legend enabled={false} />
                <Tooltip valueSuffix=" étudiants" />
                <XAxis type="category" categories={disciplineCategories} />
                <YAxis min={0} allowDecimals={false} title={{ text: '' }} />
                <Bar.Series
                  data={disciplineData}
                  options={{
                    name: 'Étudiants',
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
    </>
  );
}
