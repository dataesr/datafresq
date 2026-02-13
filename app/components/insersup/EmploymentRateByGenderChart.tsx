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
import { getColorForSeries } from '@/components/charts/highcharts/colors';
import type { EmploymentCounts } from '~/schemas/aggregations';
import { MONTHS, PRIVACY_THRESHOLD } from './constants';
import { countsToPercentages, ratesToArrayWithTrailingNulls } from './utils';

interface GenderData {
  nbSortants: number;
  emploiSalFr: EmploymentCounts | null;
}

interface YearStatsForGender {
  byGender: {
    femme: GenderData | null;
    homme: GenderData | null;
  };
}

interface EmploymentRateByGenderChartProps {
  yearData: YearStatsForGender;
  year: string;
}

function useGenderData(yearData: YearStatsForGender) {
  return useMemo(() => {
    const femme = yearData.byGender?.femme;
    const homme = yearData.byGender?.homme;

    const femmeSortants = femme?.nbSortants ?? 0;
    const hommeSortants = homme?.nbSortants ?? 0;

    const femmePercentages =
      femme?.emploiSalFr && femmeSortants >= PRIVACY_THRESHOLD
        ? countsToPercentages(femme.emploiSalFr, femmeSortants)
        : null;

    const hommePercentages =
      homme?.emploiSalFr && hommeSortants >= PRIVACY_THRESHOLD
        ? countsToPercentages(homme.emploiSalFr, hommeSortants)
        : null;

    const canShow = femmePercentages !== null && hommePercentages !== null;

    return {
      femmePercentages,
      hommePercentages,
      femmeSortants,
      hommeSortants,
      canShow,
    };
  }, [yearData]);
}

export function EmploymentRateByGenderChart({ yearData, year }: EmploymentRateByGenderChartProps) {
  const chartRef = useRef<HighchartsReactRefObject | null>(null);
  const { femmePercentages, hommePercentages, femmeSortants, hommeSortants, canShow } =
    useGenderData(yearData);

  const noDataMessage = `Effectifs insuffisants (femmes: ${femmeSortants}, hommes: ${hommeSortants}).`;

  return (
    <ChartBox
      title="Emploi salarié par genre"
      description={`Comparaison des taux d'emploi salarié en France entre femmes et hommes pour la promotion ${year}, après l'obtention du diplôme.`}
      chartRef={chartRef}
      source="insersup"
      tooltip={
        <span>
          Taux d'emploi salarié calculé séparément pour les femmes et les hommes de la promotion.
          {' '}<Link to="/guide/indicateurs/emploi">En savoir plus</Link> sur le calcul des taux d'emploi.
        </span>
      }
      noData={!canShow ? { message: noDataMessage, icon: 'fr-icon-lock-line' } : undefined}
    >
      <Chart ref={chartRef}>
        <Credits enabled={false} />
        <Legend align="center" />
        <Tooltip shared valueSuffix="%" />
        <XAxis categories={MONTHS} title={{ text: 'Temps après diplôme' }} />
        <YAxis min={0} max={100} title={{ text: "Taux d'emploi salarié (%)" }} />
        <Line.Series
          data={ratesToArrayWithTrailingNulls(femmePercentages)}
          options={{
            name: `Femmes (${femmeSortants} sortantes)`,
            color: getColorForSeries('femmes'),
            marker: { enabled: true },
          }}
        />
        <Line.Series
          data={ratesToArrayWithTrailingNulls(hommePercentages)}
          options={{
            name: `Hommes (${hommeSortants} sortants)`,
            color: getColorForSeries('hommes'),
            marker: { enabled: true },
          }}
        />
      </Chart>
    </ChartBox>
  );
}
