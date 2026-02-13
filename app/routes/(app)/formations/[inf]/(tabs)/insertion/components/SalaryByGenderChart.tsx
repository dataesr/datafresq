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
import { MONTH_KEYS, MONTHS } from '@/components/insersup';
import type { InsersupYearStats } from '~/schemas/programs';

interface SalaryByGenderChartProps {
  yearData: InsersupYearStats;
  year: string;
}

function useSalaryByGenderData(yearData: InsersupYearStats) {
  return useMemo(() => {
    const femme = yearData.byGender?.femme;
    const homme = yearData.byGender?.homme;

    if (!femme?.salaires && !homme?.salaires) return null;

    const femmeMedianData: (number | null)[] = [];
    const hommeMedianData: (number | null)[] = [];

    for (const month of MONTH_KEYS) {
      femmeMedianData.push(femme?.salaires?.[month]?.median ?? null);
      hommeMedianData.push(homme?.salaires?.[month]?.median ?? null);
    }

    const hasAnyData =
      femmeMedianData.some((d) => d !== null) || hommeMedianData.some((d) => d !== null);

    if (!hasAnyData) return null;

    return { femmeMedianData, hommeMedianData };
  }, [yearData]);
}

export function SalaryByGenderChart({ yearData, year }: SalaryByGenderChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const genderSalaryData = useSalaryByGenderData(yearData);

  const hasData = genderSalaryData !== null;

  return (
    <ChartBox
      title="Salaires par genre"
      description={`Comparaison du salaire net mensuel médian entre femmes et hommes pour la promotion ${year}, après l'obtention du diplôme.`}
      chartRef={chartRef}
      source="insersup"
      tooltip={
        <span>
          Salaire net mensuel médian calculé séparément pour les femmes et les hommes de la promotion.
          {' '}<Link to="/guide/indicateurs/salaires">En savoir plus</Link> sur le calcul des salaires.
        </span>
      }
      noData={!hasData ? { message: 'Données insuffisantes pour comparer les salaires par genre.', icon: 'fr-icon-money-euro-circle-line' } : undefined}
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip shared valuePrefix="" valueSuffix=" €" />
        <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
        <YAxis
          min={0}
          title={{ text: 'Salaire net mensuel médian (€)' }}
          labels={{ format: '{value} €' }}
        />
        <Line.Series
          data={genderSalaryData?.femmeMedianData ?? [null, null, null, null, null]}
          options={{
            name: 'Femmes',
            color: getChartColor('pink-macaron'),
            lineWidth: 2,
            marker: { enabled: true, symbol: 'circle' },
          }}
        />
        <Line.Series
          data={genderSalaryData?.hommeMedianData ?? [null, null, null, null, null]}
          options={{
            name: 'Hommes',
            color: getChartColor('blue-cumulus'),
            lineWidth: 2,
            marker: { enabled: true, symbol: 'circle' },
          }}
        />
      </Chart>
    </ChartBox>
  );
}
