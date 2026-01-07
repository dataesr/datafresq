import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Column, Line } from '@highcharts/react/series';
import { useRef, useState } from 'react';
import { AnalyticsGraph } from '@/components/AnalyticsGraph';
import { SimpleStatCard } from '@/components/cards/StatCards';
import { getChartColor, getColorForSeries } from '@/components/highcharts';
import type { InsersupViewProps, InsersupYearStats } from './types';
import { COHORT_COLORS, MONTHS, ratesToArray, ratesToArrayWithTrailingNulls } from './utils';

export function InsersupView({ aggregations, programCount }: InsersupViewProps) {
  const [selectedInsersupYear, setSelectedInsersupYear] = useState<string | null>(null);

  const insersupChartRef = useRef<HighchartsReactRefObject | null>(null);
  const insersupEvolutionChartRef = useRef<HighchartsReactRefObject | null>(null);
  const insersupGenderChartRef = useRef<HighchartsReactRefObject | null>(null);
  const insersupCohortChartRef = useRef<HighchartsReactRefObject | null>(null);
  const cohortYearChartRef = useRef<HighchartsReactRefObject | null>(null);

  if (!aggregations || aggregations.byYear.length === 0) {
    return (
      <div className="fr-py-2w fr-px-3v fr-background-alt--grey fx-radius--sm">
        <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
          Aucune donnée d'insertion professionnelle disponible pour les formations de cet espace.
        </p>
      </div>
    );
  }

  const insersupAgg = aggregations;

  // Year selection logic
  const insersupYears = insersupAgg.byYear.map((y) => y.promo).sort((a, b) => b.localeCompare(a));
  const currentInsersupYear = selectedInsersupYear || insersupYears[0] || null;
  const currentInsersupYearData = insersupAgg.byYear.find((y) => y.promo === currentInsersupYear);

  // Sorted data for charts
  const insersupSortedByYear = [...insersupAgg.byYear].sort((a, b) =>
    a.promo.localeCompare(b.promo),
  );
  const insersupYearCategories = insersupSortedByYear.map((y) => y.promo);
  const insersupSortantsTrend = insersupSortedByYear.map((y) => y.nbSortants);
  const insersupPoursuivantsTrend = insersupSortedByYear.map((y) => y.nbPoursuivants);

  // Calculated stats
  const insersupPursuitRate =
    insersupAgg.totalSortants + insersupAgg.totalPoursuivants > 0
      ? Math.round(
          (insersupAgg.totalPoursuivants /
            (insersupAgg.totalSortants + insersupAgg.totalPoursuivants)) *
            100,
        )
      : 0;

  const insersupTotalNationality =
    (insersupAgg.totalSortantsFrancais || 0) + (insersupAgg.totalSortantsEtrangers || 0);
  const insersupFrancaisRate =
    insersupTotalNationality > 0
      ? Math.round(((insersupAgg.totalSortantsFrancais || 0) / insersupTotalNationality) * 100)
      : 0;

  const insersupGlobalFemme = insersupAgg.globalRatesByGender?.femme;
  const insersupGlobalHomme = insersupAgg.globalRatesByGender?.homme;

  // Calculate feminization rate for sortants
  const totalGenderSortants =
    (insersupGlobalFemme?.nbSortants ?? 0) + (insersupGlobalHomme?.nbSortants ?? 0);
  const femalePercent =
    totalGenderSortants > 0
      ? Math.round(((insersupGlobalFemme?.nbSortants ?? 0) / totalGenderSortants) * 100)
      : 0;

  const insersupCohortsWithData = insersupAgg.byYear
    .filter((y) => y.canShowPercentages && y.emploiSalFr)
    .sort((a, b) => b.promo.localeCompare(a.promo));

  // Check if gender comparison chart can be shown
  const canShowGenderChart =
    insersupGlobalFemme?.canShowPercentages &&
    insersupGlobalHomme?.canShowPercentages &&
    insersupGlobalFemme.emploiSalFr &&
    insersupGlobalHomme.emploiSalFr;

  return (
    <>
      {/* Notice about program count */}
      {insersupAgg.totalPrograms < programCount && (
        <div className="fr-notice fr-notice--info fr-mb-3w fr-px-2w">
          <div style={{ display: 'flex', alignItems: 'start' }}>
            <span className="fr-icon-info-line fr-icon--sm fr-mr-1w" aria-hidden="true" />
            <p className="fr-text--sm fr-text--bold">
              Les agrégations d'insertion ont été calculées sur {insersupAgg.totalPrograms}{' '}
              formations qui contiennent des données InserSup. Il y a{' '}
              {programCount - insersupAgg.totalPrograms} formation
              {programCount - insersupAgg.totalPrograms > 1 ? 's' : ''} qui ne contien
              {programCount - insersupAgg.totalPrograms > 1 ? 'nen' : ''}t pas de données
              d'insertion professionnelle.
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics Cards - now includes GenderRatioCard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <SimpleStatCard
          value={insersupAgg.totalEtudiants}
          label="Diplômés suivis"
          icon="fr-icon-user-fill"
          color="blue-cumulus"
        />
        <SimpleStatCard
          value={insersupAgg.totalSortants}
          label="Sortants (entrée sur le marché)"
          icon="fr-icon-arrow-right-up-line"
          color="green-archipel"
        />
        <SimpleStatCard
          value={insersupAgg.totalPoursuivants}
          label="Poursuivants (études)"
          icon="fr-icon-book-2-fill"
          color="purple-glycine"
        />
        <SimpleStatCard
          value={`${insersupPursuitRate}%`}
          label="Taux de poursuite d'études"
          icon="fr-icon-git-merge-line"
          color="yellow-tournesol"
        />
        <SimpleStatCard
          value={`${insersupFrancaisRate}%`}
          label="Français parmi les sortants"
          icon="fr-icon-france-line"
          color="blue-ecume"
        />
        {/* Feminization ratio */}
        {insersupGlobalFemme && (
          <SimpleStatCard
            value={`${femalePercent}% (${insersupGlobalFemme.nbSortants.toLocaleString('fr-FR')})`}
            label="Ratio de femmes sortantes"
            icon="fr-icon-user-line"
            color="pink-macaron"
          />
        )}
      </div>

      {/* Charts Grid - 4 charts, 2 per row at 500px */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Cohort Evolution Chart */}
        <AnalyticsGraph
          title="Évolution des cohortes"
          description={`Répartition sortants/poursuivants sur ${insersupYearCategories.length} promotions`}
          chartRef={insersupEvolutionChartRef}
          source="InserSup (MESR)"
        >
          {insersupYearCategories.length > 1 ? (
            <Chart
              ref={insersupEvolutionChartRef}
              containerProps={{
                style: { width: '100%', minWidth: '300px', height: '350px' },
              }}
            >
              <Credits enabled={false} />
              <Legend align="center" />
              <Tooltip shared />
              <XAxis categories={insersupYearCategories} title={{ text: 'Promotion' }} />
              <YAxis min={0} title={{ text: 'Effectif' }} />
              <Column.Series
                data={insersupSortantsTrend}
                options={{
                  name: 'Sortants',
                  color: getChartColor('green-archipel'),
                  stacking: 'normal',
                }}
              />
              <Column.Series
                data={insersupPoursuivantsTrend}
                options={{
                  name: 'Poursuivants',
                  color: getChartColor('purple-glycine'),
                  stacking: 'normal',
                }}
              />
            </Chart>
          ) : (
            <div
              className="fr-py-4w fr-px-3v fr-background-alt--grey"
              style={{ borderRadius: '0.25rem' }}
            >
              <p
                className="fr-text--sm fr-mb-0 fr-text-mention--grey"
                style={{ textAlign: 'center' }}
              >
                <span className="fr-icon-information-line fr-mr-1w" aria-hidden="true" />
                Une seule promotion disponible. Le graphique d'évolution nécessite au moins 2
                promotions.
              </p>
            </div>
          )}
        </AnalyticsGraph>

        {/* Global Employment Rates Chart */}
        <AnalyticsGraph
          title="Taux d'emploi global"
          description="Évolution du taux d'emploi après l'obtention du diplôme (toutes promotions confondues)"
          chartRef={insersupChartRef}
          source="InserSup (MESR)"
        >
          {insersupAgg.canShowPercentages && insersupAgg.globalRates ? (
            <Chart
              ref={insersupChartRef}
              containerProps={{
                style: { width: '100%', minWidth: '300px', height: '350px' },
              }}
            >
              <Credits enabled={false} />
              <Legend align="center" />
              <Tooltip shared valueSuffix="%" />
              <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
              <YAxis min={0} max={100} title={{ text: "Taux d'emploi (%)" }} />
              <Line.Series
                data={ratesToArray(insersupAgg.globalRates.emploiSalFr)}
                options={{
                  name: 'Emploi salarié en France',
                  color: getChartColor('green-archipel'),
                  marker: { enabled: true },
                }}
              />
              <Line.Series
                data={ratesToArray(insersupAgg.globalRates.emploiNonSal)}
                options={{
                  name: 'Emploi non salarié',
                  color: getChartColor('blue-cumulus'),
                  marker: { enabled: true },
                }}
              />
              <Line.Series
                data={ratesToArray(insersupAgg.globalRates.emploiStable)}
                options={{
                  name: 'Emploi stable (CDI/fonctionnaire)',
                  color: getChartColor('purple-glycine'),
                  marker: { enabled: true },
                }}
              />
            </Chart>
          ) : (
            <div
              className="fr-py-4w fr-px-3v fr-background-alt--grey"
              style={{ borderRadius: '0.25rem' }}
            >
              <p
                className="fr-text--sm fr-mb-0 fr-text-mention--grey"
                style={{ textAlign: 'center' }}
              >
                <span className="fr-icon-lock-line fr-mr-1w" aria-hidden="true" />
                Les taux d'emploi ne peuvent pas être affichés car le nombre total de sortants (
                {insersupAgg.totalSortants}) est inférieur à 20.
              </p>
            </div>
          )}
        </AnalyticsGraph>

        {/* Gender Comparison Chart */}
        <AnalyticsGraph
          title="Comparaison des taux d'emploi par genre"
          description="Évolution du taux d'emploi salarié en France, comparaison femmes-hommes"
          chartRef={insersupGenderChartRef}
          source="InserSup (MESR)"
        >
          {canShowGenderChart ? (
            <Chart
              ref={insersupGenderChartRef}
              containerProps={{
                style: { width: '100%', minWidth: '300px', height: '350px' },
              }}
            >
              <Credits enabled={false} />
              <Legend align="center" />
              <Tooltip shared valueSuffix="%" />
              <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
              <YAxis min={0} max={100} title={{ text: "Taux d'emploi salarié (%)" }} />
              <Line.Series
                data={ratesToArray(insersupGlobalFemme?.emploiSalFr ?? null)}
                options={{
                  name: 'Femmes',
                  color: getColorForSeries('femmes'),
                  marker: { enabled: true },
                }}
              />
              <Line.Series
                data={ratesToArray(insersupGlobalHomme?.emploiSalFr ?? null)}
                options={{
                  name: 'Hommes',
                  color: getColorForSeries('hommes'),
                  marker: { enabled: true },
                }}
              />
            </Chart>
          ) : (
            <div
              className="fr-py-4w fr-px-3v fr-background-alt--grey"
              style={{ borderRadius: '0.25rem' }}
            >
              <p
                className="fr-text--sm fr-mb-0 fr-text-mention--grey"
                style={{ textAlign: 'center' }}
              >
                <span className="fr-icon-lock-line fr-mr-1w" aria-hidden="true" />
                Les taux d'emploi par genre ne peuvent pas être comparés car l'effectif est
                insuffisant (femmes: {insersupGlobalFemme?.nbSortants ?? 0}, hommes:{' '}
                {insersupGlobalHomme?.nbSortants ?? 0}).
              </p>
            </div>
          )}
        </AnalyticsGraph>

        {/* Cohort Comparison Chart */}
        <AnalyticsGraph
          title="Comparaison des cohortes"
          description="Taux d'emploi salarié en France par promotion, évolution dans le temps après diplôme"
          chartRef={insersupCohortChartRef}
          source="InserSup (MESR)"
        >
          {insersupCohortsWithData.length > 1 ? (
            <Chart
              ref={insersupCohortChartRef}
              containerProps={{
                style: { width: '100%', minWidth: '300px', height: '350px' },
              }}
            >
              <Credits enabled={false} />
              <Legend align="center" />
              <Tooltip shared valueSuffix="%" />
              <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
              <YAxis min={0} max={100} title={{ text: "Taux d'emploi salarié (%)" }} />
              {insersupCohortsWithData.map((cohort: InsersupYearStats, index: number) => (
                <Line.Series
                  key={cohort.promo}
                  data={ratesToArrayWithTrailingNulls(cohort.emploiSalFr)}
                  options={{
                    name: `Promo ${cohort.promo}`,
                    color: getChartColor(
                      COHORT_COLORS[index % COHORT_COLORS.length] || 'green-archipel',
                    ),
                    marker: { enabled: true },
                  }}
                />
              ))}
            </Chart>
          ) : (
            <div
              className="fr-py-4w fr-px-3v fr-background-alt--grey"
              style={{ borderRadius: '0.25rem' }}
            >
              <p
                className="fr-text--sm fr-mb-0 fr-text-mention--grey"
                style={{ textAlign: 'center' }}
              >
                <span className="fr-icon-information-line fr-mr-1w" aria-hidden="true" />
                {insersupCohortsWithData.length === 0
                  ? "Aucune cohorte n'a un effectif suffisant pour afficher les taux d'emploi."
                  : 'Une seule cohorte disponible. Le graphique de comparaison nécessite au moins 2 cohortes.'}
              </p>
            </div>
          )}
        </AnalyticsGraph>
      </div>

      {/* Detail by Year Section - with cards and chart instead of tables */}
      {insersupYears.length > 0 && (
        <div className="fr-mb-3w">
          <h3 className="fr-text--md fr-text--bold fr-mb-2w">Détail par promotion</h3>

          {/* Year Selector */}
          {insersupYears.length > 1 && (
            <fieldset className="fr-segmented fr-mb-3w">
              <div className="fr-segmented__elements">
                {insersupYears.map((year: string) => (
                  <div key={year} className="fr-segmented__element">
                    <input
                      checked={year === currentInsersupYear}
                      value={year}
                      type="radio"
                      id={`segmented-insersup-ws-${year}`}
                      name="segmented-insersup-ws"
                      onChange={() => setSelectedInsersupYear(year)}
                    />
                    <label className="fr-label" htmlFor={`segmented-insersup-ws-${year}`}>
                      {year}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          )}

          {currentInsersupYearData && (
            <>
              {/* Cohort Stats Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <SimpleStatCard
                  value={currentInsersupYearData.nbEtudiants}
                  label="Diplômés suivis"
                  icon="fr-icon-user-fill"
                  color="blue-cumulus"
                />
                <SimpleStatCard
                  value={currentInsersupYearData.nbSortants}
                  label="Sortants"
                  icon="fr-icon-arrow-right-up-line"
                  color="green-archipel"
                />
                <SimpleStatCard
                  value={currentInsersupYearData.nbPoursuivants}
                  label="Poursuivants"
                  icon="fr-icon-book-2-fill"
                  color="purple-glycine"
                />
                <SimpleStatCard
                  value={
                    currentInsersupYearData.nbSortants + currentInsersupYearData.nbPoursuivants > 0
                      ? `${Math.round(
                          (currentInsersupYearData.nbPoursuivants /
                            (currentInsersupYearData.nbSortants +
                              currentInsersupYearData.nbPoursuivants)) *
                            100,
                        )}%`
                      : '-'
                  }
                  label="Taux de poursuite"
                  icon="fr-icon-git-merge-line"
                  color="yellow-tournesol"
                />
              </div>

              {/* Year Employment Rates Chart */}
              <AnalyticsGraph
                title={`Taux d'emploi - Promotion ${currentInsersupYear}`}
                description="Évolution du taux d'emploi après l'obtention du diplôme pour cette promotion"
                chartRef={cohortYearChartRef}
                source="InserSup (MESR)"
              >
                {currentInsersupYearData.canShowPercentages &&
                currentInsersupYearData.emploiSalFr ? (
                  <Chart
                    ref={cohortYearChartRef}
                    containerProps={{
                      style: { width: '100%', minWidth: '300px', height: '350px' },
                    }}
                  >
                    <Credits enabled={false} />
                    <Legend align="center" />
                    <Tooltip shared valueSuffix="%" />
                    <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
                    <YAxis min={0} max={100} title={{ text: "Taux d'emploi (%)" }} />
                    <Line.Series
                      data={ratesToArrayWithTrailingNulls(currentInsersupYearData.emploiSalFr)}
                      options={{
                        name: 'Emploi salarié en France',
                        color: getChartColor('green-archipel'),
                        marker: { enabled: true },
                      }}
                    />
                    {currentInsersupYearData.emploiNonSal && (
                      <Line.Series
                        data={ratesToArrayWithTrailingNulls(currentInsersupYearData.emploiNonSal)}
                        options={{
                          name: 'Emploi non salarié',
                          color: getChartColor('blue-cumulus'),
                          marker: { enabled: true },
                        }}
                      />
                    )}
                    {currentInsersupYearData.emploiStable && (
                      <Line.Series
                        data={ratesToArrayWithTrailingNulls(currentInsersupYearData.emploiStable)}
                        options={{
                          name: 'Emploi stable (CDI/fonctionnaire)',
                          color: getChartColor('purple-glycine'),
                          marker: { enabled: true },
                        }}
                      />
                    )}
                  </Chart>
                ) : (
                  <div
                    className="fr-py-4w fr-px-3v fr-background-alt--grey"
                    style={{ borderRadius: '0.25rem' }}
                  >
                    <p
                      className="fr-text--sm fr-mb-0 fr-text-mention--grey"
                      style={{ textAlign: 'center' }}
                    >
                      <span className="fr-icon-lock-line fr-mr-1w" aria-hidden="true" />
                      Les taux d'emploi ne peuvent pas être affichés pour cette promotion car le
                      nombre de sortants ({currentInsersupYearData.nbSortants}) est inférieur à 20.
                    </p>
                  </div>
                )}
              </AnalyticsGraph>
            </>
          )}
        </div>
      )}
    </>
  );
}
