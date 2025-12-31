import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { useCallback, useMemo } from 'react';
import { EMPTY_FILTERS, type FilterState } from '@/api/programs';

// Page size options
export const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function useProgramsFilters() {
  const [params, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsStringLiteral(PAGE_SIZE_OPTIONS).withDefault('10'),
      // Filters
      cycle: parseAsArrayOf(parseAsString).withDefault([]),
      diplomaType: parseAsArrayOf(parseAsString).withDefault([]),
      diplomaCategory: parseAsArrayOf(parseAsString).withDefault([]),
      academy: parseAsArrayOf(parseAsString).withDefault([]),
      region: parseAsArrayOf(parseAsString).withDefault([]),
      paysageId: parseAsArrayOf(parseAsString).withDefault([]),
      sector: parseAsArrayOf(parseAsString).withDefault([]),
      disciplinarySector: parseAsArrayOf(parseAsString).withDefault([]),
      domain: parseAsArrayOf(parseAsString).withDefault([]),
      hasSiseInfos: parseAsString.withDefault(''),
      hasRncpInfos: parseAsString.withDefault(''),
      hasRomeInfos: parseAsString.withDefault(''),
    },
    {
      history: 'push',
      scroll: false,
      shallow: true,
    },
  );

  // Current filter state for modal/components
  const currentFilters: FilterState = useMemo(
    () => ({
      cycle: params.cycle,
      diplomaType: params.diplomaType,
      diplomaCategory: params.diplomaCategory,
      academy: params.academy,
      region: params.region,
      paysageId: params.paysageId,
      sector: params.sector,
      disciplinarySector: params.disciplinarySector,
      domain: params.domain,
      hasSiseInfos: params.hasSiseInfos || null,
      hasRncpInfos: params.hasRncpInfos || null,
      hasRomeInfos: params.hasRomeInfos || null,
    }),
    [params],
  );

  // Total count of all active filters
  const activeFilterCount = useMemo(() => {
    return [
      ...params.cycle,
      ...params.diplomaType,
      ...params.diplomaCategory,
      ...params.academy,
      ...params.region,
      ...params.paysageId,
      ...params.sector,
      ...params.disciplinarySector,
      ...params.domain,
      params.hasSiseInfos,
      params.hasRncpInfos,
      params.hasRomeInfos,
    ].filter(Boolean).length;
  }, [params]);

  // Handlers
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

  const handleCycleChange = useCallback(
    (values: string[]) => {
      setParams({ cycle: values, page: 1 });
    },
    [setParams],
  );

  const handleDiplomaTypeChange = useCallback(
    (values: string[]) => {
      setParams({ diplomaType: values, page: 1 });
    },
    [setParams],
  );

  const handleApplyFilters = useCallback(
    (filters: FilterState) => {
      setParams({
        cycle: filters.cycle,
        diplomaType: filters.diplomaType,
        diplomaCategory: filters.diplomaCategory,
        academy: filters.academy,
        region: filters.region,
        paysageId: filters.paysageId,
        sector: filters.sector,
        disciplinarySector: filters.disciplinarySector,
        domain: filters.domain,
        hasSiseInfos: filters.hasSiseInfos || '',
        hasRncpInfos: filters.hasRncpInfos || '',
        hasRomeInfos: filters.hasRomeInfos || '',
        page: 1,
      });
    },
    [setParams],
  );

  const handleRemoveFilter = useCallback(
    (filterKey: keyof FilterState, value?: string) => {
      const currentValue = currentFilters[filterKey];

      if (Array.isArray(currentValue) && value) {
        // Remove from array
        const newValue = currentValue.filter((v) => v !== value);
        setParams({ [filterKey]: newValue, page: 1 });
      } else {
        // Clear boolean filter
        setParams({ [filterKey]: '', page: 1 });
      }
    },
    [currentFilters, setParams],
  );

  const handleClearAllFilters = useCallback(() => {
    setParams({
      ...EMPTY_FILTERS,
      paysageId: [],
      hasSiseInfos: '',
      hasRncpInfos: '',
      hasRomeInfos: '',
      page: 1,
    });
  }, [setParams]);

  const handleClearSearch = useCallback(() => {
    setParams({ q: '', page: 1 });
  }, [setParams]);

  const handleResetAll = useCallback(() => {
    setParams({
      q: '',
      page: 1,
      pageSize: '10',
      ...EMPTY_FILTERS,
      paysageId: [],
      hasSiseInfos: '',
      hasRncpInfos: '',
      hasRomeInfos: '',
    });
  }, [setParams]);

  const handlePaysageIdChange = useCallback(
    (values: string[]) => {
      setParams({ paysageId: values, page: 1 });
    },
    [setParams],
  );

  return {
    // State
    params,
    currentFilters,
    activeFilterCount,

    // Handlers
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleCycleChange,
    handleDiplomaTypeChange,
    handlePaysageIdChange,
    handleApplyFilters,
    handleRemoveFilter,
    handleClearAllFilters,
    handleClearSearch,
    handleResetAll,

    // Raw setter for advanced use cases
    setParams,
  };
}
