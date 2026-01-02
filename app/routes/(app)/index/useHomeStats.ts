import { useProgramsFacets } from '@/api/programs';

interface HomeStats {
  totalPrograms: number;
  programsWithSiseInfos: number;
  totalDiplomaTypes: number;
  isLoading: boolean;
  error: Error | null;
}

export function useHomeStats(): HomeStats {
  const { totalCount, siseInfosCounts, diplomaTypes, isLoading, error } = useProgramsFacets({
    staleTime: 10 * 60 * 1000, // 10 minutes - stats don't change often
  });

  return {
    totalPrograms: totalCount,
    programsWithSiseInfos: siseInfosCounts.true,
    totalDiplomaTypes: diplomaTypes.length,
    isLoading,
    error: error as Error | null,
  };
}
