import { useState } from 'react';
import { Link } from 'react-router';
import { useProgramsSearch } from '@/api/programs';
import { Button } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import FiltersModal from './components/FiltersModal';
import ProgramsTable from './components/ProgramTable';
import { useProgramsFilters } from './hooks/useProgramsFilters';

export default function FormationsListPage() {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  // Get URL state and handlers from hook
  const { params, currentFilters, handleSearchChange } = useProgramsFilters();

  // Fetch programs based on URL state
  const {
    programs,
    isLoading: isProgramsLoading,
    error: programsError,
  } = useProgramsSearch({
    query: params.q,
    page: params.page,
    pageSize: Number(params.pageSize),
    filters: currentFilters,
  });

  // Sync search input with URL on mount
  useState(() => {
    setSearchInputValue(params.q);
  });

  // Handle search form submit
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearchChange(searchInputValue);
  };

  return (
    <section>
      <div className="page">
        {/* Breadcrumb */}
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

        {/* Page title */}
        <h1 className="fr-h2">Explorer les formations</h1>

        {/* Search form */}
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}
        >
          <SearchInput
            placeholder="Rechercher des formations..."
            size="md"
            type="text"
            value={searchInputValue}
            onChange={setSearchInputValue}
          />
          <Button icon="search-line" size="md" type="submit">
            Rechercher
          </Button>
          <FiltersModal />
        </form>

        {/* Active filters pills */}
        {/*<ActiveFilters />*/}

        {/* Results section */}
        <div className="fr-mt-3w">
          {/* Loading state */}
          {isProgramsLoading && programs.length === 0 && (
            <div className="fr-py-4w" style={{ textAlign: 'center' }}>
              <p className="fr-text--lg">Chargement des formations...</p>
            </div>
          )}

          {/* Error state */}
          {programsError && (
            <div className="fr-alert fr-alert--error fr-my-3w">
              <p>Erreur lors du chargement des formations: {programsError.message}</p>
            </div>
          )}

          {/* Results */}
          {programs.length > 0 && (
            <ProgramsTable
              selectedPrograms={selectedPrograms}
              onSelectionChange={setSelectedPrograms}
            />
          )}

          {/* Empty state */}
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
