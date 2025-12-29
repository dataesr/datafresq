import { useMemo } from 'react';

export interface SiseRecord {
  academicYear: string;
  enrollment: number;
  women: number;
  men: number;
  studyYear: string;
  city: string;
}

interface GenderBreakdown {
  total: number;
  women: number;
  men: number;
}

interface CategoryData {
  categories: string[];
  women: number[];
  men: number[];
}

interface SiseStats {
  years: string[];
  latestYear: string | null;
  latestTotal: number;
  latestWomen: number;
  latestMen: number;
  totalTrend: number[];
  womenTrend: number[];
  menTrend: number[];
  studyYearData: CategoryData;
  cityData: CategoryData;
  showEvolutionChart: boolean;
  showStudyYearChart: boolean;
  showCityChart: boolean;
  hasData: boolean;
}

function extractNumber(s: string): number {
  const match = /(\d+)/.exec(s);
  const numStr = match?.[1];
  return numStr ? Number.parseInt(numStr, 10) : 999;
}

function aggregateByCategory(
  data: SiseRecord[],
  keyExtractor: (item: SiseRecord) => string,
  sortFn: (a: string, b: string, map: Map<string, GenderBreakdown>) => number,
): CategoryData {
  const map = new Map<string, GenderBreakdown>();

  for (const item of data) {
    const key = keyExtractor(item) || 'Non renseigné';
    const existing = map.get(key) || { total: 0, women: 0, men: 0 };
    map.set(key, {
      total: existing.total + (item.enrollment || 0),
      women: existing.women + (item.women || 0),
      men: existing.men + (item.men || 0),
    });
  }

  const categories = Array.from(map.keys()).sort((a, b) => sortFn(a, b, map));

  return {
    categories,
    women: categories.map((cat) => map.get(cat)?.women || 0),
    men: categories.map((cat) => map.get(cat)?.men || 0),
  };
}

export function useSiseStats(siseData: SiseRecord[] | undefined | null): SiseStats {
  return useMemo(() => {
    const emptyResult: SiseStats = {
      years: [],
      latestYear: null,
      latestTotal: 0,
      latestWomen: 0,
      latestMen: 0,
      totalTrend: [],
      womenTrend: [],
      menTrend: [],
      studyYearData: { categories: [], women: [], men: [] },
      cityData: { categories: [], women: [], men: [] },
      showEvolutionChart: false,
      showStudyYearChart: false,
      showCityChart: false,
      hasData: false,
    };

    if (!siseData || siseData.length === 0) {
      return emptyResult;
    }

    const years = [...new Set(siseData.map((item) => item.academicYear))].sort();

    if (years.length === 0) {
      return emptyResult;
    }

    const latestYear = years[years.length - 1] ?? null;
    const latestYearData = siseData.filter((item) => item.academicYear === latestYear);

    const latestTotal = latestYearData.reduce((sum, item) => sum + (item.enrollment || 0), 0);
    const latestWomen = latestYearData.reduce((sum, item) => sum + (item.women || 0), 0);
    const latestMen = latestYearData.reduce((sum, item) => sum + (item.men || 0), 0);

    const getSerie = (key: keyof SiseRecord): number[] => {
      return years.map((year) => {
        const yearData = siseData.filter((item) => item.academicYear === year);
        return yearData.reduce((sum, item) => {
          const value = item[key];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
      });
    };

    const totalTrend = getSerie('enrollment');
    const menTrend = getSerie('men');
    const womenTrend = getSerie('women');

    const studyYearData = aggregateByCategory(
      latestYearData,
      (item) => item.studyYear,
      (a, b) => extractNumber(a) - extractNumber(b),
    );

    const cityData = aggregateByCategory(
      latestYearData,
      (item) => item.city,
      (a, b, map) => (map.get(b)?.total || 0) - (map.get(a)?.total || 0),
    );

    return {
      years,
      latestYear,
      latestTotal,
      latestWomen,
      latestMen,
      totalTrend,
      womenTrend,
      menTrend,
      studyYearData,
      cityData,
      showEvolutionChart: years.length > 1,
      showStudyYearChart: studyYearData.categories.length > 1,
      showCityChart: cityData.categories.length > 1,
      hasData: true,
    };
  }, [siseData]);
}
