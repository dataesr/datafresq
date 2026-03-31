import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';

// =============================================================================
// QUERY KEYS
// =============================================================================

const queryKeys = {
  detail: (id: string) => ['etablissement', id] as const,
  search: (queryParams: SearchParamsInput) => ['etablissements', 'search', queryParams] as const,
  facets: (queryParams: FacetsParamsInput) => ['etablissements', 'facets', queryParams] as const,
};

// =============================================================================
// TYPES
// =============================================================================

export interface EtablissementsFilterState {
  type: string[];
  typologie: string[];
  academie: string[];
  region: string[];
  departement: string[];
}

export const EMPTY_FILTERS: EtablissementsFilterState = {
  type: [],
  typologie: [],
  academie: [],
  region: [],
  departement: [],
};

type SearchParamsInput = {
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
} & EtablissementsFilterState;

type FacetsParamsInput = {
  q?: string;
} & Partial<EtablissementsFilterState>;

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function searchEtablissements(params: SearchParamsInput) {
  const { data, error } = await api.etablissements.get({
    query: {
      q: params.q || undefined,
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort || undefined,
      type: params.type?.length ? params.type : undefined,
      typologie: params.typologie?.length ? params.typologie : undefined,
      academie: params.academie?.length ? params.academie : undefined,
      region: params.region?.length ? params.region : undefined,
      departement: params.departement?.length ? params.departement : undefined,
    },
  });

  if (error) throw new APIError(error);
  return data;
}

async function getEtablissementsFacets(params: FacetsParamsInput) {
  const { data, error } = await api.etablissements.facets.get({
    query: {
      q: params.q || undefined,
      type: params.type?.length ? params.type : undefined,
      typologie: params.typologie?.length ? params.typologie : undefined,
      academie: params.academie?.length ? params.academie : undefined,
      region: params.region?.length ? params.region : undefined,
      departement: params.departement?.length ? params.departement : undefined,
    },
  });

  if (error) throw new APIError(error);
  return data;
}

async function getEtablissement(paysageId: string) {
  const { data, error } = await api.etablissements({ paysageId }).get();
  if (error) throw new APIError(error);
  return data;
}

// =============================================================================
// HOOKS
// =============================================================================

export function useEtablissementsSearch(options: {
  query?: string;
  page?: number;
  pageSize?: number;
  filters?: EtablissementsFilterState;
  sort?: string;
  enabled?: boolean;
}) {
  const {
    query = '',
    page = 1,
    pageSize = 25,
    filters = EMPTY_FILTERS,
    sort = 'totalStudents:desc',
    enabled = true,
  } = options;

  const searchParams: SearchParamsInput = {
    q: query,
    page,
    pageSize,
    sort,
    ...filters,
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: queryKeys.search(searchParams),
    queryFn: () => searchEtablissements(searchParams),
    placeholderData: (previousData) => previousData,
    enabled,
  });

  const etablissements = data?.etablissements ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    etablissements,
    totalCount,
    totalPages,
    isLoading,
    isFetching,
    error,
  };
}

export function useEtablissement(paysageId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.detail(paysageId),
    queryFn: () => getEtablissement(paysageId),
  });
}

export function useEtablissementsFacets(options: {
  query?: string;
  filters?: Partial<EtablissementsFilterState>;
  staleTime?: number;
  enabled?: boolean;
}) {
  const { query = '', filters = {}, staleTime = 5 * 60 * 1000, enabled = true } = options;

  const queryParams: FacetsParamsInput = { q: query, ...filters };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: queryKeys.facets(queryParams),
    queryFn: () => getEtablissementsFacets(queryParams),
    staleTime,
    enabled,
  });

  const emptyFacets = {
    types: [],
    typologies: [],
    academies: [],
    regions: [],
    departements: [],
  };

  const facets = data?.facets ?? emptyFacets;

  return {
    facets,
    totalCount: data?.totalCount ?? 0,
    isLoading,
    isFetching,
    error,
    types: facets.types,
    typologies: facets.typologies,
    academies: facets.academies,
    regions: facets.regions,
    departements: facets.departements,
  };
}
