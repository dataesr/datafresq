import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { APIError, api } from '@/api/eden-treaty';

// =============================================================================
// QUERY KEYS
// =============================================================================

const queryKeys = {
  search: (queryParams: InstitutionSearchParams) =>
    ['institutions', 'search', queryParams] as const,
};

// =============================================================================
// TYPES
// =============================================================================

export interface InstitutionSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface Institution {
  id: string; // paysage_elt.id - used for filtering programs
  label: string; // paysage_elt.name - display name
  uai?: string;
  city?: string;
  nature?: string;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function searchInstitutions(params: InstitutionSearchParams) {
  const { data, error } = await api.institutions.get({
    query: {
      q: params.q || undefined,
      page: params.page,
      pageSize: params.pageSize,
    },
  });

  if (error) throw new APIError(error);
  return data;
}

// =============================================================================
// HOOKS
// =============================================================================

export function useInstitutionsSearch(
  options: { query?: string; page?: number; pageSize?: number; enabled?: boolean } = {},
) {
  const { query = '', page = 1, pageSize = 20, enabled = true } = options;

  // Only enable the query if there's a search term (at least 2 characters)
  const shouldFetch = enabled && query.length >= 2;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.search({ q: query, page, pageSize }),
    queryFn: () => searchInstitutions({ q: query, page, pageSize }),
    placeholderData: (previousData) => previousData,
    enabled: shouldFetch,
    staleTime: 30 * 1000, // 30 seconds
  });

  const institutions: Institution[] = data?.institutions ?? [];
  const totalCount = data?.totalCount ?? 0;

  // Transform institutions to filter options format
  // id = paysage_elt.id (for filtering programs)
  // label = paysage_elt.name (for display)
  const institutionOptions = useMemo(() => {
    return institutions.map((inst) => ({
      id: inst.id,
      label: inst.label,
      subLabel: [inst.nature, inst.city].filter(Boolean).join(' - '),
    }));
  }, [institutions]);

  return {
    institutions,
    institutionOptions,
    totalCount,
    isLoading: shouldFetch && isLoading,
    isFetching,
    error,
    refetch,
    hasResults: institutions.length > 0,
    isEmpty: !isLoading && institutions.length === 0 && query.length >= 2,
  };
}
