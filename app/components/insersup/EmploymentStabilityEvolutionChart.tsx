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
import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ChartBox } from '@/components/charts/ChartBox';
import { getChartColor } from '@/components/charts/highcharts/colors';
import type { EmploymentCounts } from '~/schemas/aggregations';
import { COHORT_COLORS, MONTH_KEYS, MONTHS, PRIVACY_THRESHOLD } from './constants';

interface YearStatsForEvolution {
  promo: string;
  nbSortants: number;
  emploiSalFr: EmploymentCounts | null;
  emploiStable: EmploymentCounts | null;
}

interface EmploymentStabilityEvolutionChartProps {
  sortedByYear: YearStatsForEvolution[];
}

interface PromoStabilityData {
  promo: string;
  data: (number | null)[];
}

function useStabilityEvolutionData(sortedByYear: YearStatsForEvolution[]) {
  return useMemo(() => {
    const promoData: PromoStabilityData[] = [];

    for (const year of sortedByYear) {
      if (!year.emploiSalFr || !year.emploiStable || year.nbSortants < PRIVACY_THRESHOLD) {
        continue;
      }

      const monthData: (number | null)[] = [];
      let hasAnyData = false;

      for (const month of MONTH_KEYS) {
        const salCount = year.emploiSalFr[month];
        const stableCount = year.emploiStable[month];

        if (salCount === null || stableCount === null || salCount === 0) {
          monthData.push(null);
        } else {
          const stableShare = Math.round((stableCount / salCount) * 100);
          monthData.push(stableShare);
          hasAnyData = true;
        }
      }

      if (hasAnyData) {
        promoData.push({
          promo: year.promo,
          data: monthData,
        });
      }
    }
    promoData.sort((a, b) => b.promo.localeCompare(a.promo));

    return promoData;
  }, [sortedByYear]);
}

export function EmploymentStabilityEvolutionChart({
  sortedByYear,
}: EmploymentStabilityEvolutionChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const promoData = useStabilityEvolutionData(sortedByYear);

  const hasData = promoData.length > 0;

  return (
    <ChartBox
      title="Évolution de l'emploi stable"
      description="Comparaison de la part d'emploi stable (CDI/fonctionnaire) parmi les emplois salariés par promotion de diplômés, de 6 à 30 mois après l'obtention du diplôme."
      chartRef={chartRef}
      source="insersup"
      tooltip={
        <span>
          Part d'emploi stable calculée pour chaque promotion, permettant la comparaison
          inter-cohortes. <Link to="/guide/indicateurs/emploi">En savoir plus</Link> sur le calcul
          des taux d'emploi.
        </span>
      }
      noData={
        !hasData
          ? { message: "Aucune donnée disponible pour afficher l'évolution de l'emploi stable." }
          : undefined
      }
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip shared valueSuffix="%" />
        <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
        <YAxis min={0} max={100} title={{ text: "Part d'emploi stable (%)" }} />
        {promoData.map((promo, index) => (
          <Line.Series
            key={promo.promo}
            data={promo.data}
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
