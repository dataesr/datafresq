import { useState } from 'react';
import { useProgramsSearch } from '@/api/programs';
import { Breadcrumb } from '@/components/Breadcrumb';
import { FilterBuilder } from './components/FilterBuilder';
import ProgramsTable from './components/ProgramTable';
import { useProgramsFilters } from './hooks/useProgramsFilters';

export default function FormationsListPage() {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  const {
    params,
    currentFilters,
    handleSearchChange,
    handleApplyFilters,
    handlePageChange,
    handlePageSizeChange,
  } = useProgramsFilters();

  const {
    programs,
    totalCount,
    isLoading: isProgramsLoading,
    isFetching: isProgramsFetching,
    error: programsError,
  } = useProgramsSearch({
    query: params.q,
    page: params.page,
    pageSize: Number(params.pageSize),
    filters: currentFilters,
  });

  return (
    <section>
      <div>
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Formations', current: true },
          ]}
        />

        <h1 className="fr-h2">Explorer les formations</h1>

        <FilterBuilder
          filters={currentFilters}
          onFiltersChange={handleApplyFilters}
          searchQuery={params.q}
          onSearchQueryChange={handleSearchChange}
          resultCount={totalCount}
          isLoading={isProgramsFetching}
        />

        <div>
          {isProgramsLoading && programs.length === 0 && (
            <div className="fr-py-4w fx-flex fx-justify-center">
              <p className="fr-text--lg">Chargement des formations...</p>
            </div>
          )}

          {programsError && (
            <div className="fr-alert fr-alert--error fr-my-3w">
              <p>Erreur lors du chargement des formations: {programsError.message}</p>
            </div>
          )}

          {programs.length > 0 && (
            <ProgramsTable
              selectedPrograms={selectedPrograms}
              onSelectionChange={setSelectedPrograms}
              programs={programs}
              totalCount={totalCount}
              isFetching={isProgramsFetching}
              searchQuery={params.q}
              currentFilters={currentFilters}
              page={params.page}
              pageSize={Number(params.pageSize)}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}

          {!isProgramsLoading && programs.length === 0 && !programsError && (
            <div className="fr-py-4w fx-flex fx-flex-col fx-items-center">
              <p className="fr-text--lg fr-text-mention--grey">Aucune formation trouvée</p>
              <p className="fr-text--sm fr-text-mention--grey">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
