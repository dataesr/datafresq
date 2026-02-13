import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { APIError, api } from '@/api/eden-treaty';

// =============================================================================
// QUERY KEYS
// =============================================================================

const queryKeys = {
  search: (queryParams: CareerSearchParams) => ['careers', 'search', queryParams] as const,
};

// =============================================================================
// TYPES
// =============================================================================

export interface CareerSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface Career {
  codeRome: string;
  label: string;
  level1?: string;
  level2?: string;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function searchCareers(params: CareerSearchParams) {
  const { data, error } = await api.careers.get({
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

export function useCareersSearch(
  options: { query?: string; page?: number; pageSize?: number; enabled?: boolean } = {},
) {
  const { query = '', page = 1, pageSize = 20, enabled = true } = options;

  const shouldFetch = enabled && query.length >= 2;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.search({ q: query, page, pageSize }),
    queryFn: () => searchCareers({ q: query, page, pageSize }),
    placeholderData: (previousData) => previousData,
    enabled: shouldFetch,
    staleTime: 30 * 1000,
  });

  const careers: Career[] = data?.careers ?? [];
  const totalCount = data?.totalCount ?? 0;

  const careerOptions = useMemo(() => {
    return careers.map((career) => ({
      id: career.codeRome,
      label: career.label,
      subLabel: [career.level1, career.level2].filter(Boolean).join(' > '),
    }));
  }, [careers]);

  return {
    careers,
    careerOptions,
    totalCount,
    isLoading: shouldFetch && isLoading,
    isFetching,
    error,
    refetch,
    hasResults: careers.length > 0,
    isEmpty: !isLoading && careers.length === 0 && query.length >= 2,
  };
}
