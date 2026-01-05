import type { HighchartsReactRefObject } from '@highcharts/react';
import { Chart, Credits, Legend, Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Column, Line } from '@highcharts/react/series';
import { useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { FeminizationRateCard, SparklineStatCard } from '@/components/cards/StatCards';
import { getChartColor, getColorForSeries } from '@/components/highcharts';
import PillsTitle from '@/components/PillsTitle';
import { type SiseRecord, useSiseStats } from './useSiseStats';

interface EffectifsProps {
  siseData: SiseRecord[];
}

export default function Effectifs({ siseData }: EffectifsProps) {
  const evolutionChartRef = useRef<HighchartsReactRefObject | null>(null);
  const studyYearChartRef = useRef<HighchartsReactRefObject | null>(null);
  const cityChartRef = useRef<HighchartsReactRefObject | null>(null);

  const stats = useSiseStats(siseData);

  if (!stats.hasData) {
    return (
      <section id="effectifs">
        <PillsTitle as="h2" icon="fr-icon-group-line">
          Effectifs étudiants
        </PillsTitle>
        <div className="fr-py-2w fr-px-3v fr-background-alt--grey fx-radius--sm">
          <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
            Aucune donnée d'inscription disponible.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="effectifs">
      <PillsTitle as="h2" icon="fr-icon-group-line">
        Effectifs étudiants
      </PillsTitle>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <SparklineStatCard
          value={stats.latestTotal}
          label={`Étudiants inscrits (${stats.latestYear})`}
          trendData={stats.totalTrend}
          color="green-archipel"
          icon="fr-icon-team-fill"
        />
        <FeminizationRateCard
          femaleCount={stats.latestWomen}
          maleCount={stats.latestMen}
          femaleTrendData={stats.womenTrend}
          maleTrendData={stats.menTrend}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {stats.showEvolutionChart && (
          <AnalyticsGraph
            title="Évolution des effectifs"
            description={`Données disponibles sur ${stats.years.length} années universitaires (${stats.years[0]} - ${stats.latestYear})`}
            chartRef={evolutionChartRef}
            source="SISE (Système d'Information sur le Suivi de l'Étudiant)"
          >
            <Chart
              ref={evolutionChartRef}
              containerProps={{ style: { width: '100%', minWidth: '300px', height: '350px' } }}
            >
              <Credits enabled={false} />
              <Legend align="center" />
              <Tooltip shared />
              <XAxis categories={stats.years} title={{ text: 'Année universitaire' }} />
              <YAxis min={0} title={{ text: "Nombre d'étudiants inscrits" }} />
              <Line.Series
                data={stats.totalTrend}
                options={{
                  name: 'Total',
                  color: getColorForSeries('total'),
                }}
              />
              <Line.Series
                data={stats.womenTrend}
                options={{
                  name: 'Femmes',
                  color: getColorForSeries('femmes'),
                }}
              />
              <Line.Series
                data={stats.menTrend}
                options={{
                  name: 'Hommes',
                  color: getColorForSeries('hommes'),
                }}
              />
            </Chart>
          </AnalyticsGraph>
        )}

        {stats.showStudyYearChart && (
          <AnalyticsGraph
            title="Répartition par année d'études"
            description={`Distribution des étudiants selon leur année dans le cursus (${stats.latestYear})`}
            chartRef={studyYearChartRef}
            source="SISE (Système d'Information sur le Suivi de l'Étudiant)"
          >
            <Chart
              ref={studyYearChartRef}
              containerProps={{ style: { width: '100%', minWidth: '300px', height: '350px' } }}
            >
              <Credits enabled={false} />
              <Legend align="center" />
              <Tooltip shared />
              <XAxis
                categories={stats.studyYearData.categories}
                title={{ text: "Année d'études" }}
              />
              <YAxis min={0} title={{ text: "Nombre d'étudiants" }} />
              <Column.Series
                data={stats.studyYearData.women}
                options={{
                  name: 'Femmes',
                  color: getChartColor('pink-macaron'),
                  stacking: 'normal',
                }}
              />
              <Column.Series
                data={stats.studyYearData.men}
                options={{
                  name: 'Hommes',
                  color: getChartColor('yellow-tournesol'),
                  stacking: 'normal',
                }}
              />
            </Chart>
          </AnalyticsGraph>
        )}

        {stats.showCityChart && (
          <AnalyticsGraph
            title="Répartition par commune d'implantation"
            description={`Distribution des étudiants selon le lieu d'implantation (${stats.latestYear})`}
            chartRef={cityChartRef}
            source="SISE (Système d'Information sur le Suivi de l'Étudiant)"
          >
            <Chart
              ref={cityChartRef}
              containerProps={{ style: { width: '100%', minWidth: '300px', height: '350px' } }}
            >
              <Credits enabled={false} />
              <Legend align="center" />
              <Tooltip shared />
              <XAxis categories={stats.cityData.categories} title={{ text: 'Commune' }} />
              <YAxis min={0} title={{ text: "Nombre d'étudiants" }} />
              <Column.Series
                data={stats.cityData.women}
                options={{
                  name: 'Femmes',
                  color: getChartColor('pink-macaron'),
                  stacking: 'normal',
                }}
              />
              <Column.Series
                data={stats.cityData.men}
                options={{
                  name: 'Hommes',
                  color: getChartColor('yellow-tournesol'),
                  stacking: 'normal',
                }}
              />
            </Chart>
          </AnalyticsGraph>
        )}
      </div>
    </section>
  );
}
