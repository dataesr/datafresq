import { useEtablissementsFacets, useEtablissementsSearch } from '@/api/etablissements';
import { Breadcrumb } from '@/components/Breadcrumb';
import EtablissementsTable from './components/EtablissementsTable';
import { FilterBar } from './components/FilterBar';
import { useEtablissementsFilters } from './hooks/useEtablissementsFilters';

export default function EtablissementsListPage() {
  const {
    params,
    currentFilters,
    activeFilterCount,
    handleSearchChange,
    handleFilterChange,
    handleRemoveFilter,
    handleClearAllFilters,
  } = useEtablissementsFilters();

  const { totalCount, isLoading, isFetching, error } = useEtablissementsSearch({
    query: params.q,
    page: params.page,
    pageSize: Number(params.pageSize),
    filters: currentFilters,
    sort: params.sort,
  });

  const { facets } = useEtablissementsFacets({
    query: params.q,
    filters: currentFilters,
  });

  return (
    <section>
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Établissements', current: true },
        ]}
      />

      <h1 className="fr-h2">Explorer les établissements</h1>

      <FilterBar
        searchQuery={params.q}
        onSearchQueryChange={handleSearchChange}
        filters={currentFilters}
        onFilterChange={handleFilterChange}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
        resultCount={totalCount}
        isLoading={isFetching}
        facets={facets}
        activeFilterCount={activeFilterCount}
      />

      {isLoading && totalCount === 0 && (
        <div className="fr-py-4w fx-flex fx-justify-center">
          <p className="fr-text--lg fr-text-mention--grey">Chargement des établissements...</p>
        </div>
      )}

      {error && (
        <div className="fr-alert fr-alert--error fr-my-3w">
          <p>Erreur lors du chargement des établissements.</p>
        </div>
      )}

      {totalCount > 0 && <EtablissementsTable />}

      {!isLoading && totalCount === 0 && !error && (
        <div className="fr-py-4w fx-flex fx-flex-col fx-items-center">
          <p className="fr-text--lg fr-text-mention--grey">Aucun établissement trouvé</p>
          <p className="fr-text--sm fr-text-mention--grey">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}
    </section>
  );
}
