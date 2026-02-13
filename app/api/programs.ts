import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';
import type { ProgramsParams } from '~/schemas/programs';

// =============================================================================
// QUERY KEYS
// =============================================================================

const queryKeys = {
  detail: (id: string) => ['program', id] as const,
  facets: (queryParams: Omit<SearchParamsInput, 'page' | 'pageSize'>) =>
    ['programs', 'facets', queryParams] as const,
  search: (queryParams: SearchParamsInput) => ['programs', 'search', queryParams] as const,
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

type SearchParamsInput = Pick<
  ProgramsParams,
  | 'q'
  | 'page'
  | 'pageSize'
  | 'cycle'
  | 'diplomaType'
  | 'diplomaCategory'
  | 'academy'
  | 'region'
  | 'paysageId'
  | 'sector'
  | 'disciplinarySector'
  | 'domain'
  | 'codeRome'
> & {
  hasSiseInfos?: string | null;
  hasRncpInfos?: string | null;
  hasRomeInfos?: string | null;
};

async function searchPrograms(params: SearchParamsInput) {
  const { data, error } = await api.programs.get({
    query: {
      q: params.q || undefined,
      page: params.page,
      pageSize: params.pageSize,
      cycle: params.cycle?.length ? params.cycle : undefined,
      diplomaType: params.diplomaType?.length ? params.diplomaType : undefined,
      diplomaCategory: params.diplomaCategory?.length ? params.diplomaCategory : undefined,
      academy: params.academy?.length ? params.academy : undefined,
      region: params.region?.length ? params.region : undefined,
      paysageId: params.paysageId?.length ? params.paysageId : undefined,
      sector: params.sector?.length ? params.sector : undefined,
      disciplinarySector: params.disciplinarySector?.length ? params.disciplinarySector : undefined,
      domain: params.domain?.length ? params.domain : undefined,
      codeRome: params.codeRome?.length ? params.codeRome : undefined,
      hasSiseInfos: params.hasSiseInfos || undefined,
      hasRncpInfos: params.hasRncpInfos || undefined,
      hasRomeInfos: params.hasRomeInfos || undefined,
    },
  });

  if (error) throw new APIError(error);
  return data;
}

async function getFacets(params: Omit<SearchParamsInput, 'page' | 'pageSize'>) {
  const { data, error } = await api.programs.facets.get({
    query: {
      q: params.q || undefined,
      cycle: params.cycle?.length ? params.cycle : undefined,
      diplomaType: params.diplomaType?.length ? params.diplomaType : undefined,
      diplomaCategory: params.diplomaCategory?.length ? params.diplomaCategory : undefined,
      academy: params.academy?.length ? params.academy : undefined,
      region: params.region?.length ? params.region : undefined,
      paysageId: params.paysageId?.length ? params.paysageId : undefined,
      sector: params.sector?.length ? params.sector : undefined,
      disciplinarySector: params.disciplinarySector?.length ? params.disciplinarySector : undefined,
      domain: params.domain?.length ? params.domain : undefined,
      codeRome: params.codeRome?.length ? params.codeRome : undefined,
      hasSiseInfos: params.hasSiseInfos || undefined,
      hasRncpInfos: params.hasRncpInfos || undefined,
      hasRomeInfos: params.hasRomeInfos || undefined,
    },
  });

  if (error) throw new APIError(error);
  return data;
}

async function getProgram(inf: string) {
  const { data, error } = await api.programs({ inf }).get();
  if (error) throw new APIError(error);
  return data;
}

// =============================================================================
// TYPES
// =============================================================================

export interface FilterState {
  cycle: string[];
  diplomaType: string[];
  diplomaCategory: string[];
  academy: string[];
  region: string[];
  paysageId: string[];
  sector: string[];
  disciplinarySector: string[];
  domain: string[];
  codeRome: string[];
  hasSiseInfos: string | null;
  hasRncpInfos: string | null;
  hasRomeInfos: string | null;
}

export const EMPTY_FILTERS: FilterState = {
  cycle: [],
  diplomaType: [],
  diplomaCategory: [],
  academy: [],
  region: [],
  paysageId: [],
  sector: [],
  disciplinarySector: [],
  domain: [],
  codeRome: [],
  hasSiseInfos: null,
  hasRncpInfos: null,
  hasRomeInfos: null,
};

// =============================================================================
// QUERIES
// =============================================================================

export function useProgram(inf: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.detail(inf),
    queryFn: () => getProgram(inf),
  });
}

export function useProgramsSearch(
  options: {
    query?: string;
    page?: number;
    pageSize?: number;
    filters?: FilterState;
    enabled?: boolean;
  } = {},
) {
  const { query = '', page = 1, pageSize = 10, filters = EMPTY_FILTERS, enabled = true } = options;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.search({ q: query, page, pageSize, ...filters }),
    queryFn: () => searchPrograms({ q: query, page, pageSize, ...filters }),
    placeholderData: (previousData) => previousData,
    enabled,
  });

  const programs = data?.programs ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    programs,
    totalCount,
    totalPages,
    isLoading,
    isFetching,
    error,
    refetch,
    hasResults: programs.length > 0,
    isEmpty: !isLoading && programs.length === 0,
    isFirstPage: page === 1,
    isLastPage: page >= totalPages,
    startIndex: (page - 1) * pageSize + 1,
    endIndex: Math.min(page * pageSize, totalCount),
  };
}

export function useProgramsFacets(
  options: {
    query?: string;
    includeFilters?: boolean;
    filters?: Partial<FilterState>;
    staleTime?: number;
    enabled?: boolean;
  } = {},
) {
  const {
    query = '',
    includeFilters = false,
    filters = {},
    staleTime = 5 * 60 * 1000,
    enabled = true,
  } = options;

  const queryParams = includeFilters ? { q: query, ...filters } : { q: query };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.facets(queryParams),
    queryFn: () => getFacets(queryParams),
    staleTime,
    enabled,
  });

  const emptyFacets = {
    cycles: [],
    diplomaTypes: [],
    diplomaCodes: [],
    diplomaCategories: [],
    academies: [],
    regions: [],
    sectors: [],
    disciplinarySectors: [],
    domains: [],
    hasSiseInfos: [],
    hasRncpInfos: [],
    hasRomeInfos: [],
  };

  const facets = data?.facets ?? emptyFacets;

  const getBooleanCounts = (items: { key: string; count: number }[]) => ({
    true: items.find((i) => i.key === 'true')?.count ?? 0,
    false: items.find((i) => i.key === 'false')?.count ?? 0,
  });

  return {
    facets,
    totalCount: data?.totalCount ?? 0,
    isLoading,
    isFetching,
    error,
    refetch,
    getBooleanCounts,
    cycles: facets.cycles,
    diplomaTypes: facets.diplomaTypes,
    diplomaCodes: facets.diplomaCodes,
    diplomaCategories: facets.diplomaCategories,
    academies: facets.academies,
    regions: facets.regions,
    sectors: facets.sectors,
    disciplinarySectors: facets.disciplinarySectors,
    domains: facets.domains,
    siseInfosCounts: getBooleanCounts(facets.hasSiseInfos),
    rncpInfosCounts: getBooleanCounts(facets.hasRncpInfos),
    romeInfosCounts: getBooleanCounts(facets.hasRomeInfos),
  };
}
