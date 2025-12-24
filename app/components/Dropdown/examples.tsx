import { useCallback, useMemo, useState } from 'react';
import Dropdown from './index';

// =============================================================================
// EXAMPLE DATA
// =============================================================================

const STATUS_OPTIONS = [
  { id: 'active', label: 'Actif' },
  { id: 'pending', label: 'En attente' },
  { id: 'archived', label: 'Archivé' },
  { id: 'draft', label: 'Brouillon' },
];

const CATEGORY_OPTIONS = [
  { id: 'licence', label: 'Licence' },
  { id: 'master', label: 'Master' },
  { id: 'doctorat', label: 'Doctorat' },
  { id: 'dut', label: 'DUT' },
  { id: 'bts', label: 'BTS' },
  { id: 'ingenieur', label: 'Ingénieur' },
  { id: 'prepa', label: 'Prépa' },
];

const REGION_OPTIONS = [
  { id: 'idf', label: 'Île-de-France' },
  { id: 'aura', label: 'Auvergne-Rhône-Alpes' },
  { id: 'paca', label: "Provence-Alpes-Côte d'Azur" },
  { id: 'occitanie', label: 'Occitanie' },
  { id: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { id: 'bretagne', label: 'Bretagne' },
  { id: 'normandie', label: 'Normandie' },
  { id: 'hauts-de-france', label: 'Hauts-de-France' },
  { id: 'grand-est', label: 'Grand Est' },
  { id: 'pays-loire', label: 'Pays de la Loire' },
];

// =============================================================================
// FILTER DROPDOWN WITH SEARCH COMPONENT
// =============================================================================

interface FilterOption {
  id: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function FilterDropdown({
  label,
  options,
  selectedIds,
  onSelectionChange,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
}: FilterDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const handleToggle = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    },
    [selectedIds, onSelectionChange],
  );

  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
    setSearchQuery('');
  }, [onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    onSelectionChange(filteredOptions.map((opt) => opt.id));
  }, [filteredOptions, onSelectionChange]);

  const selectedCount = selectedIds.length;
  const buttonLabel = selectedCount > 0 ? `${label} (${selectedCount})` : label;

  return (
    <Dropdown label={buttonLabel} size="md" outline>
      {searchable && (
        <div className="fx-dropdown__search">
          <input
            type="search"
            data-autofocus
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {filteredOptions.length === 0 ? (
          <div className="fx-dropdown__empty">Aucun résultat</div>
        ) : (
          filteredOptions.map((option) => {
            const isChecked = selectedIds.includes(option.id);
            return (
              <div
                key={option.id}
                role="menuitemcheckbox"
                aria-checked={isChecked}
                className="fx-dropdown__input"
                tabIndex={0}
                onClick={() => handleToggle(option.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(option.id);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(option.id)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <span>{option.label}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="fx-dropdown__actions">
        <button
          type="button"
          role="menuitem"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
          onClick={handleClearAll}
          disabled={selectedCount === 0}
        >
          Effacer
        </button>
        <button
          type="button"
          role="menuitem"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
          onClick={handleSelectAll}
        >
          Tout sélectionner
        </button>
      </div>
    </Dropdown>
  );
}

// =============================================================================
// RADIO DROPDOWN COMPONENT
// =============================================================================

interface RadioDropdownProps {
  label: string;
  options: FilterOption[];
  selectedId: string | null;
  onSelectionChange: (id: string | null) => void;
}

export function RadioDropdown({
  label,
  options,
  selectedId,
  onSelectionChange,
}: RadioDropdownProps) {
  const selectedOption = options.find((opt) => opt.id === selectedId);
  const buttonLabel = selectedOption ? `${label}: ${selectedOption.label}` : label;

  return (
    <Dropdown label={buttonLabel} size="md" outline>
      {options.map((option) => {
        const isChecked = selectedId === option.id;
        return (
          <div
            key={option.id}
            role="menuitemradio"
            aria-checked={isChecked}
            className="fx-dropdown__input"
            tabIndex={0}
            onClick={() => onSelectionChange(option.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectionChange(option.id);
              }
            }}
          >
            <input
              type="radio"
              name="radio-dropdown"
              checked={isChecked}
              onChange={() => onSelectionChange(option.id)}
              tabIndex={-1}
              aria-hidden="true"
            />
            <span>{option.label}</span>
          </div>
        );
      })}
      {selectedId && (
        <>
          <hr />
          <button
            type="button"
            role="menuitem"
            className="fx-dropdown__item"
            onClick={() => onSelectionChange(null)}
          >
            Effacer la sélection
          </button>
        </>
      )}
    </Dropdown>
  );
}

// =============================================================================
// ALL EXAMPLES COMPONENT
// =============================================================================

export default function DropdownExamples() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['licence', 'master']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string | null>('date-desc');

  return (
    <div className="fr-container fr-py-4w">
      <h2 className="fr-h3 fr-mb-3w">Exemples de Dropdown</h2>

      {/* Example 1: Simple Menu with role="menuitem" */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">1. Menu simple avec actions (role=menuitem)</h3>
        <Dropdown label="Actions">
          <button type="button" role="menuitem" className="fx-dropdown__item">
            Modifier
          </button>
          <button type="button" role="menuitem" className="fx-dropdown__item">
            Dupliquer
          </button>
          <button type="button" role="menuitem" className="fx-dropdown__item">
            Partager
          </button>
          <hr />
          <button
            type="button"
            role="menuitem"
            className="fx-dropdown__item fx-dropdown__item--destructive"
          >
            Supprimer
          </button>
        </Dropdown>
      </div>

      {/* Example 2: Sizes */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">2. Tailles (sm, md, lg)</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Dropdown label="Small" size="sm">
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 2
            </button>
          </Dropdown>

          <Dropdown label="Medium" size="md">
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 2
            </button>
          </Dropdown>

          <Dropdown label="Large" size="lg">
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 2
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Example 3: Outline vs No Outline */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">3. Avec et sans bordure</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Dropdown label="Avec bordure" outline>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 2
            </button>
          </Dropdown>

          <Dropdown label="Sans bordure" outline={false}>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 2
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Example 4: With Icons */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">4. Avec icône (toujours à gauche)</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Dropdown label="Paramètres" icon="settings-5-line">
            <button type="button" role="menuitem" className="fx-dropdown__item fr-icon-user-line">
              Mon profil
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item fr-icon-lock-line">
              Sécurité
            </button>
            <hr />
            <button
              type="button"
              role="menuitem"
              className="fx-dropdown__item fr-icon-logout-box-r-line"
            >
              Se déconnecter
            </button>
          </Dropdown>

          <Dropdown label="Menu" icon="menu-line" size="sm" outline={false}>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 2
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Example 5: Icon Only (with aria-label) */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">5. Bouton icône seule (avec aria-label)</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Dropdown
            icon="more-fill"
            aria-label="Plus d'options"
            title="Plus d'options"
            size="sm"
            outline={false}
          >
            <button type="button" role="menuitem" className="fx-dropdown__item fr-icon-edit-line">
              Modifier
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item fr-icon-delete-line">
              Supprimer
            </button>
          </Dropdown>

          <Dropdown icon="settings-5-line" aria-label="Paramètres" title="Paramètres" size="md">
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 2
            </button>
          </Dropdown>

          <Dropdown icon="add-line" aria-label="Ajouter" title="Ajouter" size="lg" outline={false}>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Nouvelle formation
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Nouvel espace
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Example 6: Hide Arrow Explicitly */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">6. Masquer la flèche explicitement</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Dropdown label="Avec flèche">
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
          </Dropdown>

          <Dropdown label="Sans flèche" hideArrow>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
          </Dropdown>

          <Dropdown label="Icône + Sans flèche" icon="filter-line" hideArrow>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Example 7: Menu with Icons in Items */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">7. Éléments avec icônes</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Dropdown label="Icônes à gauche">
            <button type="button" role="menuitem" className="fx-dropdown__item fr-icon-edit-line">
              Modifier
            </button>
            <button
              type="button"
              role="menuitem"
              className="fx-dropdown__item fr-icon-file-copy-line"
            >
              Dupliquer
            </button>
            <button
              type="button"
              role="menuitem"
              className="fx-dropdown__item fr-icon-download-line"
            >
              Télécharger
            </button>
            <hr />
            <button
              type="button"
              role="menuitem"
              className="fx-dropdown__item fx-dropdown__item--destructive fr-icon-delete-line"
            >
              Supprimer
            </button>
          </Dropdown>

          <Dropdown label="Icônes à droite">
            <button
              type="button"
              role="menuitem"
              className="fx-dropdown__item fx-dropdown__item--icon-right fr-icon-arrow-right-s-line"
            >
              Voir les détails
            </button>
            <button
              type="button"
              role="menuitem"
              className="fx-dropdown__item fx-dropdown__item--icon-right fr-icon-external-link-line"
            >
              Ouvrir dans un nouvel onglet
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Example 8: Filter Dropdowns with menuitemcheckbox */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">8. Filtres avec checkboxes (role=menuitemcheckbox)</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <FilterDropdown
            label="Statut"
            options={STATUS_OPTIONS}
            selectedIds={selectedStatuses}
            onSelectionChange={setSelectedStatuses}
            searchable={false}
          />
          <FilterDropdown
            label="Catégorie"
            options={CATEGORY_OPTIONS}
            selectedIds={selectedCategories}
            onSelectionChange={setSelectedCategories}
          />
          <FilterDropdown
            label="Région"
            options={REGION_OPTIONS}
            selectedIds={selectedRegions}
            onSelectionChange={setSelectedRegions}
            searchPlaceholder="Rechercher une région..."
          />
        </div>
      </div>

      {/* Example 9: Radio Dropdown with menuitemradio */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">9. Menu radio (role=menuitemradio)</h3>
        <RadioDropdown
          label="Trier par"
          options={[
            { id: 'date-desc', label: 'Date (récent → ancien)' },
            { id: 'date-asc', label: 'Date (ancien → récent)' },
            { id: 'name-asc', label: 'Nom (A → Z)' },
            { id: 'name-desc', label: 'Nom (Z → A)' },
          ]}
          selectedId={selectedSort}
          onSelectionChange={setSelectedSort}
        />
      </div>

      {/* Example 10: Grouped Options */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">10. Options groupées</h3>
        <Dropdown label="Paramètres" icon="settings-5-line">
          <div className="fx-dropdown__header">Affichage</div>
          <button
            type="button"
            role="menuitem"
            className="fx-dropdown__item fr-icon-layout-grid-line"
          >
            Vue grille
          </button>
          <button
            type="button"
            role="menuitem"
            className="fx-dropdown__item fr-icon-list-unordered"
          >
            Vue liste
          </button>
          <hr />
          <div className="fx-dropdown__header">Compte</div>
          <button type="button" role="menuitem" className="fx-dropdown__item fr-icon-user-line">
            Mon profil
          </button>
          <button type="button" role="menuitem" className="fx-dropdown__item fr-icon-lock-line">
            Sécurité
          </button>
          <hr />
          <button
            type="button"
            role="menuitem"
            className="fx-dropdown__item fx-dropdown__item--destructive fr-icon-logout-box-r-line"
          >
            Se déconnecter
          </button>
        </Dropdown>
      </div>

      {/* Example 11: Search with Autofocus */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">11. Recherche avec autofocus</h3>
        <Dropdown label="Rechercher" icon="search-line">
          <input type="search" data-autofocus placeholder="Rechercher une formation..." />
          <div className="fx-dropdown__empty">Tapez pour rechercher...</div>
        </Dropdown>
      </div>

      {/* Example 12: Custom Content */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">12. Contenu personnalisé</h3>
        <Dropdown label="Statistiques">
          <div className="fx-dropdown__header">Résumé du mois</div>
          <div style={{ padding: '1rem' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
            >
              <span>Formations consultées</span>
              <strong>1,234</strong>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
            >
              <span>Espaces créés</span>
              <strong>12</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Exports réalisés</span>
              <strong>45</strong>
            </div>
          </div>
          <div className="fx-dropdown__footer">
            <button type="button" role="menuitem" className="fr-btn fr-btn--sm fr-btn--tertiary">
              Voir tout
            </button>
          </div>
        </Dropdown>
      </div>

      {/* Example 13: Links Menu */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">13. Menu de navigation avec liens</h3>
        <Dropdown label="Navigation" icon="menu-line">
          <a href="#accueil" role="menuitem" className="fx-dropdown__item fr-icon-home-4-line">
            Accueil
          </a>
          <a href="#formations" role="menuitem" className="fx-dropdown__item fr-icon-book-2-line">
            Formations
          </a>
          <a href="#espaces" role="menuitem" className="fx-dropdown__item fr-icon-stack-line">
            Mes espaces
          </a>
          <hr />
          <a href="#aide" role="menuitem" className="fx-dropdown__item fr-icon-question-line">
            Aide
          </a>
        </Dropdown>
      </div>

      {/* Example 14: Alignment */}
      <div className="fr-mb-4w">
        <h3 className="fr-h5 fr-mb-2w">14. Alignement automatique</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Dropdown label="Aligné à gauche" size="sm" align="start">
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 2
            </button>
          </Dropdown>
          <Dropdown label="Aligné à droite" size="sm" align="end">
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 1
            </button>
            <button type="button" role="menuitem" className="fx-dropdown__item">
              Option 2
            </button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
