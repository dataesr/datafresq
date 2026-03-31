import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { useCallback, useMemo } from 'react';
import { EMPTY_FILTERS, type EtablissementsFilterState } from '@/api/etablissements';

export const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function useEtablissementsFilters() {
  const [params, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsStringLiteral(PAGE_SIZE_OPTIONS).withDefault('25'),
      sort: parseAsString.withDefault('totalStudents:desc'),
      type: parseAsArrayOf(parseAsString).withDefault([]),
      typologie: parseAsArrayOf(parseAsString).withDefault([]),
      academie: parseAsArrayOf(parseAsString).withDefault([]),
      region: parseAsArrayOf(parseAsString).withDefault([]),
      departement: parseAsArrayOf(parseAsString).withDefault([]),
    },
    { history: 'push', scroll: false, shallow: true },
  );

  const currentFilters: EtablissementsFilterState = useMemo(
    () => ({
      type: params.type,
      typologie: params.typologie,
      academie: params.academie,
      region: params.region,
      departement: params.departement,
    }),
    [params],
  );

  const activeFilterCount = useMemo(
    () =>
      [
        ...params.type,
        ...params.typologie,
        ...params.academie,
        ...params.region,
        ...params.departement,
      ].length,
    [params],
  );

  const hasActiveFilters = params.q.length > 0 || activeFilterCount > 0;

  const handleSearchChange = useCallback(
    (query: string) => {
      setParams({ q: query, page: 1 });
    },
    [setParams],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setParams({ page: newPage });
    },
    [setParams],
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: PageSize) => {
      setParams({ pageSize: newPageSize, page: 1 });
    },
    [setParams],
  );

  const handleFilterChange = useCallback(
    (field: keyof EtablissementsFilterState, values: string[]) => {
      setParams({ [field]: values, page: 1 });
    },
    [setParams],
  );

  const handleRemoveFilter = useCallback(
    (field: keyof EtablissementsFilterState, value: string) => {
      const newValue = currentFilters[field].filter((v) => v !== value);
      setParams({ [field]: newValue, page: 1 });
    },
    [currentFilters, setParams],
  );

  const handleClearAllFilters = useCallback(() => {
    setParams({ ...EMPTY_FILTERS, page: 1 });
  }, [setParams]);

  const handleResetAll = useCallback(() => {
    setParams({ q: '', page: 1, pageSize: '25', sort: 'totalStudents:desc', ...EMPTY_FILTERS });
  }, [setParams]);

  return {
    params,
    currentFilters,
    activeFilterCount,
    hasActiveFilters,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleRemoveFilter,
    handleClearAllFilters,
    handleResetAll,
    setParams,
  };
}
