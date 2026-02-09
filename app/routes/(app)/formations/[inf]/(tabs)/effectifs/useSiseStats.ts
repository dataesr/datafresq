import { useMemo } from 'react';
import {
  aggregateByCategory,
  type CategoryData,
  sortByNumber,
  sortByTotalDesc,
} from '@/components/effectifs';
import type { SiseRecord } from '~/schemas/programs';

/**
 * Stats for a single academic year
 */
export interface SiseYearStats {
  year: string;
  total: number;
  women: number;
  men: number;
  studyYearData: CategoryData;
  cityData: CategoryData;
  showStudyYearChart: boolean;
  showCityChart: boolean;
}

/**
 * Aggregated stats across all years
 */
export interface SiseStats {
  years: string[];
  byYear: SiseYearStats[];
  totalTrend: number[];
  womenTrend: number[];
  menTrend: number[];
  showEvolutionChart: boolean;
  hasData: boolean;
}

function computeYearStats(siseData: SiseRecord[], year: string): SiseYearStats {
  const yearData = siseData.filter((item) => item.academicYear === year);

  const total = yearData.reduce((sum, item) => sum + (item.enrollment || 0), 0);
  const women = yearData.reduce((sum, item) => sum + (item.women || 0), 0);
  const men = yearData.reduce((sum, item) => sum + (item.men || 0), 0);

  const studyYearData = aggregateByCategory(
    yearData,
    (item) => item.studyYear,
    (item) => ({ enrollment: item.enrollment, women: item.women, men: item.men }),
    (a, b, _map) => sortByNumber(a, b),
  );

  const cityData = aggregateByCategory(
    yearData,
    (item) => item.city,
    (item) => ({ enrollment: item.enrollment, women: item.women, men: item.men }),
    (a, b, map) => sortByTotalDesc(a, b, map),
  );

  return {
    year,
    total,
    women,
    men,
    studyYearData,
    cityData,
    showStudyYearChart: studyYearData.categories.length > 1,
    showCityChart: cityData.categories.length > 1,
  };
}

export function useSiseStats(siseData: SiseRecord[] | undefined | null): SiseStats {
  return useMemo(() => {
    const emptyResult: SiseStats = {
      years: [],
      byYear: [],
      totalTrend: [],
      womenTrend: [],
      menTrend: [],
      showEvolutionChart: false,
      hasData: false,
    };

    if (!siseData || siseData.length === 0) {
      return emptyResult;
    }

    // Get unique years sorted ascending (oldest first for trends)
    const years = [...new Set(siseData.map((item) => item.academicYear))].sort();

    if (years.length === 0) {
      return emptyResult;
    }

    // Compute stats for each year
    const byYear = years.map((year) => computeYearStats(siseData, year));

    // Compute trends across all years
    const totalTrend = byYear.map((y) => y.total);
    const womenTrend = byYear.map((y) => y.women);
    const menTrend = byYear.map((y) => y.men);

    return {
      years,
      byYear,
      totalTrend,
      womenTrend,
      menTrend,
      showEvolutionChart: years.length > 1,
      hasData: true,
    };
  }, [siseData]);
}
