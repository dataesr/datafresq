import {
  Chart,
  Credits,
  type HighchartsReactRefObject,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChartBox } from '@/components/charts/ChartBox';
import { getChartColor } from '@/components/charts/highcharts/colors';
import { COHORT_COLORS, MONTH_KEYS, MONTHS } from '@/components/insersup';
import type { InsersupYearStats } from '~/schemas/programs';

interface SalaryEvolutionChartProps {
  sortedByYear: InsersupYearStats[];
}

type SalaryMetric = 'q1' | 'median' | 'q3';

interface PromoSalaryData {
  promo: string;
  q1: (number | null)[];
  median: (number | null)[];
  q3: (number | null)[];
}

const METRIC_OPTIONS: { key: SalaryMetric; label: string }[] = [
  { key: 'q1', label: 'Q1 (25e percentile)' },
  { key: 'median', label: 'Médiane' },
  { key: 'q3', label: 'Q3 (75e percentile)' },
];

function useSalaryEvolutionData(sortedByYear: InsersupYearStats[]) {
  return useMemo(() => {
    const promoData: PromoSalaryData[] = [];

    for (const year of sortedByYear) {
      if (!year.salaires) {
        continue;
      }

      const q1Data: (number | null)[] = [];
      const medianData: (number | null)[] = [];
      const q3Data: (number | null)[] = [];
      let hasAnyData = false;

      for (const month of MONTH_KEYS) {
        const monthData = year.salaires[month];
        if (monthData) {
          q1Data.push(monthData.q1 ?? null);
          medianData.push(monthData.median ?? null);
          q3Data.push(monthData.q3 ?? null);
          if (monthData.median !== null) {
            hasAnyData = true;
          }
        } else {
          q1Data.push(null);
          medianData.push(null);
          q3Data.push(null);
        }
      }

      if (hasAnyData) {
        promoData.push({
          promo: year.promo,
          q1: q1Data,
          median: medianData,
          q3: q3Data,
        });
      }
    }

    promoData.sort((a, b) => b.promo.localeCompare(a.promo));

    return promoData;
  }, [sortedByYear]);
}

export function SalaryEvolutionChart({ sortedByYear }: SalaryEvolutionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const promoData = useSalaryEvolutionData(sortedByYear);
  const [selectedMetric, setSelectedMetric] = useState<SalaryMetric>('median');

  const hasData = promoData.length > 0;

  const metricLabel = METRIC_OPTIONS.find((m) => m.key === selectedMetric)?.label ?? 'Médiane';

  return (
    <ChartBox
      title="Évolution des salaires"
      description={`Comparaison du salaire net mensuel (${metricLabel}) par promotion de diplômés, de 6 à 30 mois après l'obtention du diplôme.`}
      chartRef={chartRef}
      source="insersup"
      tooltip={
        <span>
          Salaire net mensuel calculé pour chaque promotion, permettant la comparaison
          inter-cohortes. <Link to="/guide/indicateurs/salaires">En savoir plus</Link> sur le calcul
          des salaires.
        </span>
      }
      noData={
        !hasData
          ? {
              message: "Aucune donnée de salaire disponible pour afficher l'évolution.",
              icon: 'fr-icon-money-euro-circle-line',
            }
          : undefined
      }
    >
      {/* Internal metric selector */}
      <div className="fr-mb-2w">
        <fieldset className="fr-segmented fr-segmented--sm fr-segmented--no-legend">
          <legend className="fr-sr-only">Choix de la métrique de salaire</legend>
          <div className="fr-segmented__elements">
            {METRIC_OPTIONS.map((option) => (
              <div key={option.key} className="fr-segmented__element">
                <input
                  type="radio"
                  id={`salary-metric-${option.key}`}
                  name="salary-metric"
                  value={option.key}
                  checked={selectedMetric === option.key}
                  onChange={() => setSelectedMetric(option.key)}
                />
                <label className="fr-label" htmlFor={`salary-metric-${option.key}`}>
                  {option.key === 'median' ? 'Médiane' : option.key.toUpperCase()}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip shared valuePrefix="" valueSuffix=" €" />
        <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
        <YAxis
          min={0}
          title={{ text: 'Salaire net mensuel (€)' }}
          labels={{ format: '{value} €' }}
        />
        {promoData.map((promo, index) => (
          <Line.Series
            key={promo.promo}
            data={promo[selectedMetric]}
            options={{
              name: `Promo ${promo.promo}`,
              color: getChartColor(COHORT_COLORS[index % COHORT_COLORS.length] || 'green-archipel'),
              marker: { enabled: true },
            }}
          />
        ))}
      </Chart>
    </ChartBox>
  );
}
