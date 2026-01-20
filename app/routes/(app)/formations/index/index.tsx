import { useState } from 'react';
import { Link } from 'react-router';
import { useProgramsSearch } from '@/api/programs';
import { FilterBuilder } from './components/FilterBuilder';
import ProgramsTable from './components/ProgramTable';
import { useProgramsFilters } from './hooks/useProgramsFilters';

export default function FormationsListPage() {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  const { params, currentFilters, handleSearchChange, handleApplyFilters } = useProgramsFilters();

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
      <div className="page">
        <nav className="fr-breadcrumb" aria-label="vous êtes ici :">
          <button
            type="button"
            className="fr-breadcrumb__button"
            aria-expanded="false"
            aria-controls="breadcrumb-1"
          >
            Voir le fil d'Ariane
          </button>
          <div className="fr-collapse" id="breadcrumb-1">
            <ol className="fr-breadcrumb__list">
              <li>
                <Link className="fr-breadcrumb__link" to="/">
                  Accueil
                </Link>
              </li>
              <li>
                <span className="fr-breadcrumb__link" aria-current="page">
                  Explorer les formations
                </span>
              </li>
            </ol>
          </div>
        </nav>

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
            <div className="fr-py-4w" style={{ textAlign: 'center' }}>
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
            />
          )}

          {!isProgramsLoading && programs.length === 0 && !programsError && (
            <div className="fr-py-4w" style={{ textAlign: 'center' }}>
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
