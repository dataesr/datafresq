import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import { useRef } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { SparklineStatCard } from '@/components/cards/StatCards';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import { getColorForSeries } from '@/components/highcharts';
import PillsTitle from '@/components/PillsTitle';

interface EffectifsProps {
  siseData: any[];
}

export default function Effectifs({ siseData }: EffectifsProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);

  if (!siseData || siseData.length === 0) {
    return (
      <section id="effectifs" className="formation-section">
        <PillsTitle as="h2" icon="fr-icon-group-line">
          Effectifs étudiants
        </PillsTitle>
        <div className="fr-callout">
          <p>Aucune donnée d'inscription disponible.</p>
        </div>
      </section>
    );
  }

  const years = [
    ...new Set(siseData.map((item: any) => item.annee_universitaire)),
  ].sort() as string[];

  if (years.length === 0) return null;

  const latestYear = years[years.length - 1];
  const latestYearData = siseData.filter((item: any) => item.annee_universitaire === latestYear);

  const latestTotal = latestYearData.reduce(
    (sum: number, item: any) => sum + (item.effectif_sans_cpge || 0),
    0,
  );
  const latestFemmes = latestYearData.reduce(
    (sum: number, item: any) => sum + (item.femmes || 0),
    0,
  );
  const latestHommes = latestYearData.reduce(
    (sum: number, item: any) => sum + (item.hommes || 0),
    0,
  );

  const getSerie = (key: string): number[] => {
    return years.map((year) => {
      const yearData = siseData.filter((item: any) => item.annee_universitaire === year);
      return yearData.reduce((sum: number, item: any) => sum + (item?.[key] || 0), 0);
    });
  };

  const totalData = getSerie('effectif_sans_cpge');
  const hommesData = getSerie('hommes');
  const femmesData = getSerie('femmes');

  const hasMultipleYears = years.length > 1;
  const isLatestYear = latestYear === '2024-2025';

  return (
    <section id="effectifs" className="formation-section">
      <PillsTitle as="h2" icon="fr-icon-group-line">
        Effectifs étudiants
      </PillsTitle>

      {!hasMultipleYears && (
        <div className={`fr-notice fr-notice--${isLatestYear ? 'info' : 'warning'} fr-mb-3w`}>
          <div className="fr-container">
            <div className="fr-notice__body">
              <p>
                <span className="fr-notice__title" />
                <span className="fr-notice__desc">
                  Aucune donnée disponible pour 2024-2025. <br />
                  Données disponibles uniquement pour l'année universitaire {latestYear}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <AutoGrid min={280}>
        <SparklineStatCard
          value={latestTotal}
          label={`Étudiants (${latestYear})`}
          trendData={totalData}
          color="green-archipel"
          icon="fr-icon-team-fill"
        />
        {latestFemmes > 0 && (
          <SparklineStatCard
            value={latestFemmes}
            label="Femmes"
            trendData={femmesData}
            color="pink-macaron"
            icon="fr-icon-user-fill"
          />
        )}
        {latestHommes > 0 && (
          <SparklineStatCard
            value={latestHommes}
            label="Hommes"
            trendData={hommesData}
            color="yellow-tournesol"
            icon="fr-icon-user-fill"
          />
        )}
      </AutoGrid>

      <div style={{ display: 'grid', gap: '3rem', marginTop: '3rem' }}>
        {years.length > 1 && (
          <AnalyticsGraph
            title="Évolution du nombre d'étudiants inscrits"
            description={`Données disponibles sur ${years.length} années universitaires (${years[0]} - ${latestYear})`}
            chartRef={chartRef}
            source="SISE (Système d'Information sur le Suivi de l'Étudiant)"
          >
            <Chart
              ref={chartRef}
              containerProps={{ style: { width: '100%', minWidth: '300px', height: '400px' } }}
            >
              <Credits enabled={false} />
              <Legend align="center" />

              <XAxis categories={years} title={{ text: 'Année universitaire' }} />

              <YAxis min={0} title={{ text: "Nombre d'étudiants inscrits" }} />

              <Line.Series
                data={totalData}
                options={{
                  name: 'Total',
                  color: getColorForSeries('total'),
                }}
              />
              <Line.Series
                data={hommesData}
                options={{
                  color: getColorForSeries('hommes'),
                  name: 'Hommes',
                }}
              />
              <Line.Series
                data={femmesData}
                options={{
                  color: getColorForSeries('femmes'),
                  name: 'Femmes',
                }}
              />
            </Chart>
          </AnalyticsGraph>
        )}
      </div>
    </section>
  );
}
