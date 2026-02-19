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
import { MONTH_KEYS, MONTHS, PRIVACY_THRESHOLD } from './constants';

interface YearStatsForStability {
  nbSortants: number;
  emploiSalFr: EmploymentCounts | null;
  emploiStable: EmploymentCounts | null;
}

interface EmploymentStabilityChartProps {
  yearData: YearStatsForStability;
  year: string;
}

function useStabilityData(yearData: YearStatsForStability) {
  return useMemo(() => {
    if (
      !yearData.emploiSalFr ||
      !yearData.emploiStable ||
      yearData.nbSortants < PRIVACY_THRESHOLD
    ) {
      return null;
    }

    const stableRateData: (number | null)[] = [];

    for (const month of MONTH_KEYS) {
      const salCount = yearData.emploiSalFr[month];
      const stableCount = yearData.emploiStable[month];

      if (salCount === null || stableCount === null || salCount === 0) {
        stableRateData.push(null);
      } else {
        const stableShare = Math.round((stableCount / salCount) * 100);
        stableRateData.push(stableShare);
      }
    }

    return stableRateData;
  }, [yearData]);
}

export function EmploymentStabilityChart({ yearData, year }: EmploymentStabilityChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const stableRateData = useStabilityData(yearData);

  const hasData = stableRateData !== null;

  return (
    <ChartBox
      title="Part d'emploi stable"
      description={`Part des CDI et fonctionnaires parmi les emplois salariés pour la promotion ${year}, après l'obtention du diplôme.`}
      chartRef={chartRef}
      source="insersup"
      tooltip={
        <span>
          Part des CDI et postes de fonctionnaire rapportée au nombre total d'emplois salariés.{' '}
          <Link to="/guide/indicateurs/emploi">En savoir plus</Link> sur le calcul des taux
          d'emploi.
        </span>
      }
      noData={
        !hasData
          ? { message: "Données insuffisantes pour afficher la part d'emploi stable." }
          : undefined
      }
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip shared valueSuffix="%" />
        <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
        <YAxis min={0} max={100} title={{ text: "Part d'emploi stable (%)" }} />
        <Line.Series
          data={stableRateData ?? [null, null, null, null, null]}
          options={{
            name: 'Emploi stable (CDI/fonctionnaire)',
            color: getChartColor('green-archipel'),
            marker: { enabled: true },
          }}
        />
      </Chart>
    </ChartBox>
  );
}
