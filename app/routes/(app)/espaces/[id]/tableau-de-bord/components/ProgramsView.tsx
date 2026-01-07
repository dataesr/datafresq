import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Bar, Pie } from '@highcharts/react/series';
import { useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { SimpleStatCard } from '@/components/cards/StatCards';
import { ChoroplethMap } from '@/components/charts/MapChart';
import { SpiderChart } from '@/components/charts/SpiderChart';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import { getChartColor } from '@/components/highcharts';
import type { ProgramsViewProps } from './types';
import { cycleColors, regionToHcKey } from './utils';

export function ProgramsView({ aggregations, programCount }: ProgramsViewProps) {
  const cycleChartRef = useRef<HighchartsReactRefObject | null>(null);
  const diplomaChartRef = useRef<HighchartsReactRefObject | null>(null);
  const disciplineChartRef = useRef<HighchartsReactRefObject | null>(null);
  const academyChartRef = useRef<HighchartsReactRefObject | null>(null);
  const gdDisciplineChartRef = useRef<HighchartsReactRefObject | null>(null);

  if (!aggregations) {
    return (
      <div className="fr-py-2w fr-px-3v fr-background-alt--grey fx-radius--sm">
        <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
          Aucune donnée d'offre de formation disponible.
        </p>
      </div>
    );
  }

  const {
    byCycle: progByCycle,
    byRegion: progByRegion,
    byDiploma: progByDiploma,
    byAcademy: progByAcademy,
    byDiscipline: progByDiscipline,
    byRome: progByRome,
  } = aggregations;

  // Prepare data for cycle pie chart
  const cycleData = progByCycle
    .filter((item) => item.cycle && item.count > 0)
    .map((item, index) => ({
      name: item.cycle || 'Non renseigné',
      y: item.count,
      color: getChartColor(cycleColors[index % cycleColors.length]!),
    }));

  // Prepare data for diploma chart (top 8)
  const topDiplomas = [...progByDiploma]
    .filter((d) => d.diplomaLabel)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const diplomaCategories = topDiplomas.map((d) => d.diplomaLabel || d.diploma || 'Non renseigné');
  const diplomaData = topDiplomas.map((d) => ({
    y: d.count,
    female: 0,
    male: 0,
  }));

  // Prepare data for discipline chart (top 10)
  const topDisciplines = [...progByDiscipline]
    .filter((d) => d.discipline)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const disciplineCategories = topDisciplines.map((d) => d.discipline || 'Non renseigné');
  const disciplineData = topDisciplines.map((d) => d.count);

  // Prepare data for academy chart (top 10)
  const topAcademies = [...progByAcademy]
    .filter((a) => a.academy)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const academyCategories = topAcademies.map((a) => a.academy || 'Non renseigné');
  const academyData = topAcademies.map((a) => a.count);

  // Prepare data for spider chart (ROME codes for programs)
  const spiderData = (progByRome || [])
    .filter((d) => d.label)
    .slice(0, 8)
    .map((d) => ({
      name: d.label,
      y: d.count,
    }));

  // Prepare data for choropleth map
  const choroplethData = progByRegion
    .filter((r) => r.region && regionToHcKey[r.region])
    .map((r) => ({
      'hc-key': regionToHcKey[r.region]!,
      value: r.count,
      name: r.region,
    }));

  return (
    <>
      {/* Key Metrics Cards */}
      <AutoGrid type="fill" min={300}>
        <SimpleStatCard
          value={programCount}
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
      </AutoGrid>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gap: '2rem', marginTop: '3rem' }}>
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
              title="Répartition par cycle LMD (formations)"
              description="Distribution des formations par cycle Licence, Master et Doctorat."
              chartRef={cycleChartRef}
              source="Données Fresq (MESR)"
            >
              <Chart
                ref={cycleChartRef}
                containerProps={{
                  style: { width: '100%', minWidth: '300px', height: '350px' },
                }}
              >
                <Credits enabled={false} />
                <Legend align="center" />
                <Tooltip pointFormat="<b>{point.y}</b> formations ({point.percentage:.1f}%)" />
                <Pie.Series
                  data={cycleData}
                  options={{
                    name: 'Formations',
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
              title="Formations par type de diplôme"
              description="Répartition des formations par type de diplôme préparé."
              chartRef={diplomaChartRef}
              source="Données Fresq (MESR)"
            >
              <Chart
                ref={diplomaChartRef}
                containerProps={{
                  style: { width: '100%', minWidth: '300px', height: '400px' },
                }}
              >
                <Credits enabled={false} />
                <Legend enabled={false} />
                <Tooltip valueSuffix=" formations" />
                <XAxis type="category" categories={diplomaCategories} />
                <YAxis min={0} allowDecimals={false} title={{ text: 'Nombre de formations' }} />
                <Bar.Series
                  data={diplomaData}
                  options={{
                    name: 'Formations',
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

          {/* Academy Chart */}
          {topAcademies.length > 0 && (
            <AnalyticsGraph
              title="Top 10 académies (formations)"
              description="Les 10 académies avec le plus de formations."
              chartRef={academyChartRef}
              source="Données Fresq (MESR)"
            >
              <Chart
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
            </AnalyticsGraph>
          )}

          {/* Choropleth Map */}
          {choroplethData.length > 0 && (
            <AnalyticsGraph
              title="Carte des régions (formations)"
              description="Répartition géographique des formations par région."
              source="Données Fresq (MESR)"
            >
              <div style={{ width: '100%', minWidth: '300px', height: '400px' }}>
                <ChoroplethMap
                  data={choroplethData}
                  tooltipPointFormat="<b>{point.name}</b>: {point.value} formations"
                />
              </div>
            </AnalyticsGraph>
          )}

          {/* Spider Chart - ROME codes */}
          {spiderData.length > 0 && (
            <AnalyticsGraph
              title="Métiers (codes ROME) (formations)"
              description="Répartition des formations par métier (codes ROME)."
              chartRef={gdDisciplineChartRef}
              source="Données Fresq (MESR)"
            >
              <div style={{ width: '100%', minWidth: '300px', height: '400px' }}>
                <SpiderChart data={spiderData} seriesName="Formations" />
              </div>
            </AnalyticsGraph>
          )}

          {/* Discipline Chart */}
          {topDisciplines.length > 0 && (
            <AnalyticsGraph
              title="Top 10 secteurs disciplinaires (formations)"
              description="Les 10 secteurs disciplinaires avec le plus de formations."
              chartRef={disciplineChartRef}
              source="Données Fresq (MESR)"
            >
              <Chart
                ref={disciplineChartRef}
                containerProps={{
                  style: { width: '100%', minWidth: '300px', height: '400px' },
                }}
              >
                <Credits enabled={false} />
                <Legend enabled={false} />
                <Tooltip valueSuffix=" formations" />
                <XAxis type="category" categories={disciplineCategories} />
                <YAxis min={0} allowDecimals={false} title={{ text: '' }} />
                <Bar.Series
                  data={disciplineData}
                  options={{
                    name: 'Formations',
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
