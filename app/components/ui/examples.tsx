import { useMemo, useState } from 'react';
import { type Institution, useInstitutionsSearch } from '@/api/institutions';
import { Dropdown } from './Dropdown';
import { useDebounce } from './hooks/useDebounce';
import { Select } from './Select';
import { toast } from './Toast';

// =============================================================================
// EXAMPLE WRAPPER COMPONENT
// =============================================================================

function ExampleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fr-mb-4w">
      <h3 className="fr-h6 fr-mb-2w">{title}</h3>
      <div className="fr-p-2w" style={{ backgroundColor: 'var(--background-alt-grey)' }}>
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// DROPDOWN EXAMPLES
// =============================================================================

export function DropdownBasic() {
  return (
    <Dropdown label="Actions" icon="settings-5-line">
      <Dropdown.Item onClick={() => console.log('Edit')}>Modifier</Dropdown.Item>
      <Dropdown.Item onClick={() => console.log('Duplicate')}>Dupliquer</Dropdown.Item>
      <Dropdown.Separator />
      <Dropdown.Item destructive onClick={() => console.log('Delete')}>
        Supprimer
      </Dropdown.Item>
    </Dropdown>
  );
}

export function DropdownWithGroups() {
  return (
    <Dropdown label="Options" icon="more-2-fill">
      <Dropdown.Header>Actions</Dropdown.Header>
      <Dropdown.Group label="Édition">
        <Dropdown.Item icon="edit-line" onClick={() => console.log('Edit')}>
          Modifier
        </Dropdown.Item>
        <Dropdown.Item icon="file-copy-line" onClick={() => console.log('Duplicate')}>
          Dupliquer
        </Dropdown.Item>
      </Dropdown.Group>
      <Dropdown.Separator />
      <Dropdown.Group label="Navigation">
        <Dropdown.Link to="/dashboard" icon="dashboard-line">
          Tableau de bord
        </Dropdown.Link>
        <Dropdown.Link to="/settings" icon="settings-4-line">
          Paramètres
        </Dropdown.Link>
      </Dropdown.Group>
      <Dropdown.Footer>
        <button type="button" className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline">
          Fermer
        </button>
      </Dropdown.Footer>
    </Dropdown>
  );
}

export function DropdownWithRightIcons() {
  return (
    <Dropdown label="Navigation" icon="menu-line">
      <Dropdown.Item
        icon="arrow-right-line"
        iconPosition="right"
        onClick={() => console.log('Home')}
      >
        Accueil
      </Dropdown.Item>
      <Dropdown.Item
        icon="arrow-right-line"
        iconPosition="right"
        onClick={() => console.log('Projects')}
      >
        Projets
      </Dropdown.Item>
      <Dropdown.Item
        icon="arrow-right-line"
        iconPosition="right"
        onClick={() => console.log('Profile')}
      >
        Profil
      </Dropdown.Item>
      <Dropdown.Separator />
      <Dropdown.Item
        icon="external-link-line"
        iconPosition="right"
        onClick={() => console.log('External')}
      >
        Lien externe
      </Dropdown.Item>
    </Dropdown>
  );
}

export function DropdownIconOnly() {
  return (
    <Dropdown icon="more-2-fill" title="Plus d'options">
      <Dropdown.Item onClick={() => console.log('Option 1')}>Option 1</Dropdown.Item>
      <Dropdown.Item onClick={() => console.log('Option 2')}>Option 2</Dropdown.Item>
    </Dropdown>
  );
}

export function DropdownSizes() {
  return (
    <div className="fx-flex fx-gap-4w fx-items-start">
      <Dropdown label="Small" size="sm">
        <Dropdown.Item>Option 1</Dropdown.Item>
        <Dropdown.Item>Option 2</Dropdown.Item>
      </Dropdown>

      <Dropdown label="Medium" size="md">
        <Dropdown.Item>Option 1</Dropdown.Item>
        <Dropdown.Item>Option 2</Dropdown.Item>
      </Dropdown>

      <Dropdown label="Large" size="lg">
        <Dropdown.Item>Option 1</Dropdown.Item>
        <Dropdown.Item>Option 2</Dropdown.Item>
      </Dropdown>
    </div>
  );
}

// =============================================================================
// SELECT EXAMPLES
// =============================================================================

export function SelectBasic() {
  const [value, setValue] = useState<string | null>(null);

  const options = [
    { value: 'apple', label: 'Pomme' },
    { value: 'banana', label: 'Banane' },
    { value: 'orange', label: 'Orange' },
    { value: 'grape', label: 'Raisin' },
  ];

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <Select label={selectedLabel || 'Choisir un fruit'}>
      {options.map((option) => (
        <Select.Option
          key={option.value}
          value={option.value}
          selected={value === option.value}
          onClick={() => setValue(option.value)}
        >
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
}

export function SelectWithRadio() {
  const [value, setValue] = useState<string>('option1');

  return (
    <Select label={`Sélectionné: ${value}`}>
      <Select.Radio
        value="option1"
        name="radio-example"
        checked={value === 'option1'}
        onChange={() => setValue('option1')}
      >
        Option 1
      </Select.Radio>
      <Select.Radio
        value="option2"
        name="radio-example"
        checked={value === 'option2'}
        onChange={() => setValue('option2')}
      >
        Option 2
      </Select.Radio>
      <Select.Radio
        value="option3"
        name="radio-example"
        checked={value === 'option3'}
        onChange={() => setValue('option3')}
      >
        Option 3
      </Select.Radio>
    </Select>
  );
}

export function SelectMultiple() {
  const [values, setValues] = useState<string[]>([]);

  const options = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' },
  ];

  const toggleValue = (val: string) => {
    setValues((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  };

  const label = values.length > 0 ? `${values.length} sélectionné(s)` : 'Choisir des frameworks';

  return (
    <Select label={label} multiple>
      {options.map((option) => (
        <Select.Checkbox
          key={option.value}
          value={option.value}
          checked={values.includes(option.value)}
          onChange={() => toggleValue(option.value)}
        >
          {option.label}
        </Select.Checkbox>
      ))}
      <Select.Footer>
        <button
          type="button"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
          onClick={() => setValues([])}
        >
          Effacer
        </button>
        <button
          type="button"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
          onClick={() => setValues(options.map((o) => o.value))}
        >
          Tout sélectionner
        </button>
      </Select.Footer>
    </Select>
  );
}

export function SelectWithSearch() {
  const [value, setValue] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const allOptions = [
    { value: 'paris', label: 'Paris' },
    { value: 'lyon', label: 'Lyon' },
    { value: 'marseille', label: 'Marseille' },
    { value: 'toulouse', label: 'Toulouse' },
    { value: 'bordeaux', label: 'Bordeaux' },
    { value: 'lille', label: 'Lille' },
    { value: 'nantes', label: 'Nantes' },
    { value: 'strasbourg', label: 'Strasbourg' },
  ];

  const filteredOptions = allOptions.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  const selectedLabel = allOptions.find((o) => o.value === value)?.label;

  return (
    <Select label={selectedLabel || 'Choisir une ville'}>
      <Select.Search
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une ville..."
      />
      {filteredOptions.length > 0 ? (
        filteredOptions.map((option) => (
          <Select.Option
            key={option.value}
            value={option.value}
            selected={value === option.value}
            onClick={() => setValue(option.value)}
          >
            {option.label}
          </Select.Option>
        ))
      ) : (
        <Select.Empty>Aucune ville trouvée</Select.Empty>
      )}
    </Select>
  );
}

export function SelectWithGroups() {
  const [values, setValues] = useState<string[]>([]);

  const groups = [
    {
      label: 'Fruits',
      options: [
        { value: 'apple', label: 'Pomme' },
        { value: 'banana', label: 'Banane' },
        { value: 'orange', label: 'Orange' },
      ],
    },
    {
      label: 'Légumes',
      options: [
        { value: 'carrot', label: 'Carotte' },
        { value: 'potato', label: 'Pomme de terre' },
        { value: 'tomato', label: 'Tomate' },
      ],
    },
  ];

  const toggleValue = (val: string) => {
    setValues((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  };

  const label = values.length > 0 ? `${values.length} sélectionné(s)` : 'Choisir des aliments';

  return (
    <Select label={label} multiple>
      {groups.map((group) => (
        <Select.Group key={group.label} label={group.label}>
          {group.options.map((option) => (
            <Select.Checkbox
              key={option.value}
              value={option.value}
              checked={values.includes(option.value)}
              onChange={() => toggleValue(option.value)}
            >
              {option.label}
            </Select.Checkbox>
          ))}
        </Select.Group>
      ))}
    </Select>
  );
}

export function SelectAsyncSearch() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Institution[]>([]);
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebounce(query, { delay: 300 });
  const isQueryValid = debouncedQuery.trim().length >= 2;
  const isDebouncing = query !== debouncedQuery;

  const { institutions, isLoading } = useInstitutionsSearch({
    query: debouncedQuery,
    enabled: isQueryValid,
    pageSize: 20,
  });

  const handleToggle = (inst: Institution) => {
    if (selectedIds.includes(inst.id)) {
      setSelectedIds(selectedIds.filter((id) => id !== inst.id));
      setSelectedItems(selectedItems.filter((i) => i.id !== inst.id));
    } else {
      setSelectedIds([...selectedIds, inst.id]);
      setSelectedItems([...selectedItems, inst]);
    }
  };

  const handleClear = () => {
    setSelectedIds([]);
    setSelectedItems([]);
  };

  const displayOptions = useMemo(() => {
    const result = [...selectedItems];
    for (const inst of institutions) {
      if (!result.find((i) => i.id === inst.id)) {
        result.push(inst);
      }
    }
    return result.sort((a, b) => {
      const aSelected = selectedIds.includes(a.id);
      const bSelected = selectedIds.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [institutions, selectedItems, selectedIds]);

  const buttonLabel =
    selectedIds.length > 0 ? `Établissement (${selectedIds.length})` : 'Établissement';

  return (
    <Select label={buttonLabel} icon="building-line" multiple>
      <Select.Search
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un établissement..."
      />
      <div className="fx-select__options">
        {isLoading || isDebouncing ? (
          <Select.Loading>Recherche en cours...</Select.Loading>
        ) : displayOptions.length === 0 ? (
          <Select.Empty>
            {!isQueryValid
              ? 'Tapez au moins 2 caractères pour rechercher'
              : 'Aucun établissement trouvé'}
          </Select.Empty>
        ) : (
          displayOptions.map((inst) => (
            <Select.Checkbox
              key={inst.id}
              value={inst.id}
              checked={selectedIds.includes(inst.id)}
              onChange={() => handleToggle(inst)}
            >
              <div>
                <div className="fr-text--bold">{inst.label}</div>
                {inst.city && (
                  <div className="fr-text--xs fr-mb-0 fr-text-mention--grey">{inst.city}</div>
                )}
              </div>
            </Select.Checkbox>
          ))
        )}
      </div>
      {selectedIds.length > 0 && (
        <Select.Footer>
          <button
            type="button"
            className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
            onClick={handleClear}
          >
            Effacer ({selectedIds.length})
          </button>
        </Select.Footer>
      )}
    </Select>
  );
}

export function SelectFullWidth() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <div style={{ width: '300px' }}>
      <Select label={value || 'Choisir une option'} fullWidth>
        <Select.Option value="opt1" selected={value === 'opt1'} onClick={() => setValue('opt1')}>
          Option 1
        </Select.Option>
        <Select.Option value="opt2" selected={value === 'opt2'} onClick={() => setValue('opt2')}>
          Option 2
        </Select.Option>
        <Select.Option value="opt3" selected={value === 'opt3'} onClick={() => setValue('opt3')}>
          Option 3
        </Select.Option>
      </Select>
    </div>
  );
}

export function SelectWithIcon() {
  const [value, setValue] = useState<string | null>(null);

  const options = [
    { value: 'paris', label: 'Paris' },
    { value: 'lyon', label: 'Lyon' },
    { value: 'marseille', label: 'Marseille' },
  ];

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <Select label={selectedLabel || 'Choisir une ville'} icon="map-pin-2-line">
      {options.map((option) => (
        <Select.Option
          key={option.value}
          value={option.value}
          selected={value === option.value}
          onClick={() => setValue(option.value)}
          icon="map-pin-2-line"
        >
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
}

export function SelectWithRightIcon() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Select label={value || 'Choisir une action'}>
      <Select.Option
        value="download"
        selected={value === 'Télécharger'}
        onClick={() => setValue('Télécharger')}
        icon="arrow-right-line"
        iconPosition="right"
      >
        Télécharger
      </Select.Option>
      <Select.Option
        value="share"
        selected={value === 'Partager'}
        onClick={() => setValue('Partager')}
        icon="arrow-right-line"
        iconPosition="right"
      >
        Partager
      </Select.Option>
      <Select.Option
        value="print"
        selected={value === 'Imprimer'}
        onClick={() => setValue('Imprimer')}
        icon="arrow-right-line"
        iconPosition="right"
      >
        Imprimer
      </Select.Option>
    </Select>
  );
}

export function SelectWithIconVariants() {
  const [country, setCountry] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  return (
    <div className="fx-flex fx-gap-4w fx-items-start">
      <Select label={country || 'Pays'} icon="earth-line" size="sm">
        <Select.Option value="fr" selected={country === 'fr'} onClick={() => setCountry('France')}>
          France
        </Select.Option>
        <Select.Option
          value="de"
          selected={country === 'de'}
          onClick={() => setCountry('Allemagne')}
        >
          Allemagne
        </Select.Option>
        <Select.Option value="es" selected={country === 'es'} onClick={() => setCountry('Espagne')}>
          Espagne
        </Select.Option>
      </Select>

      <Select label={status || 'Statut'} icon="checkbox-circle-line">
        <Select.Option
          value="active"
          selected={status === 'Actif'}
          onClick={() => setStatus('Actif')}
        >
          Actif
        </Select.Option>
        <Select.Option
          value="pending"
          selected={status === 'En attente'}
          onClick={() => setStatus('En attente')}
        >
          En attente
        </Select.Option>
        <Select.Option
          value="inactive"
          selected={status === 'Inactif'}
          onClick={() => setStatus('Inactif')}
        >
          Inactif
        </Select.Option>
      </Select>

      <Select label={category || 'Catégorie'} icon="folder-line" size="lg">
        <Select.Option
          value="tech"
          selected={category === 'Technologie'}
          onClick={() => setCategory('Technologie')}
        >
          Technologie
        </Select.Option>
        <Select.Option
          value="science"
          selected={category === 'Science'}
          onClick={() => setCategory('Science')}
        >
          Science
        </Select.Option>
        <Select.Option value="art" selected={category === 'Art'} onClick={() => setCategory('Art')}>
          Art
        </Select.Option>
      </Select>
    </div>
  );
}

function SelectWithScrollableContent() {
  const [values, setValues] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const allOptions = [
    { value: 'paris', label: 'Paris' },
    { value: 'lyon', label: 'Lyon' },
    { value: 'marseille', label: 'Marseille' },
    { value: 'toulouse', label: 'Toulouse' },
    { value: 'bordeaux', label: 'Bordeaux' },
    { value: 'lille', label: 'Lille' },
    { value: 'nantes', label: 'Nantes' },
    { value: 'strasbourg', label: 'Strasbourg' },
    { value: 'montpellier', label: 'Montpellier' },
    { value: 'rennes', label: 'Rennes' },
    { value: 'grenoble', label: 'Grenoble' },
    { value: 'rouen', label: 'Rouen' },
    { value: 'toulon', label: 'Toulon' },
    { value: 'clermont', label: 'Clermont-Ferrand' },
    { value: 'nice', label: 'Nice' },
    { value: 'nancy', label: 'Nancy' },
    { value: 'orleans', label: 'Orléans' },
    { value: 'dijon', label: 'Dijon' },
    { value: 'angers', label: 'Angers' },
    { value: 'lemans', label: 'Le Mans' },
  ];

  const filteredOptions = allOptions.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  const toggleValue = (val: string) => {
    setValues((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  };

  const label = values.length > 0 ? `${values.length} ville(s)` : 'Choisir des villes';

  return (
    <Select label={label} multiple>
      <Select.Search
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une ville..."
      />
      <Select.Content maxHeight="250px">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <Select.Checkbox
              key={option.value}
              value={option.value}
              checked={values.includes(option.value)}
              onChange={() => toggleValue(option.value)}
            >
              {option.label}
            </Select.Checkbox>
          ))
        ) : (
          <Select.Empty>Aucune ville trouvée</Select.Empty>
        )}
      </Select.Content>
      <Select.Footer>
        <button
          type="button"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
          onClick={() => setValues([])}
        >
          Effacer
        </button>
        <span className="fr-text--sm fr-text-mention--grey">{values.length} sélectionnée(s)</span>
      </Select.Footer>
    </Select>
  );
}

function SelectIconOnlyTrigger() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Select icon="filter-line" title="Filtrer par statut">
      <Select.Header>Filtrer par statut</Select.Header>
      <Select.Option value="all" selected={value === 'all'} onClick={() => setValue('all')}>
        Tous
      </Select.Option>
      <Select.Option
        value="active"
        selected={value === 'active'}
        onClick={() => setValue('active')}
      >
        Actifs uniquement
      </Select.Option>
      <Select.Option
        value="archived"
        selected={value === 'archived'}
        onClick={() => setValue('archived')}
      >
        Archivés uniquement
      </Select.Option>
    </Select>
  );
}

// =============================================================================
// COMBINED EXAMPLES COMPONENTS (for exemples page)
// =============================================================================

export function DropdownExamples() {
  return (
    <div>
      <ExampleSection title="Dropdown basique">
        <DropdownBasic />
      </ExampleSection>

      <ExampleSection title="Dropdown avec groupes">
        <DropdownWithGroups />
      </ExampleSection>

      <ExampleSection title="Dropdown avec icône à droite">
        <DropdownWithRightIcons />
      </ExampleSection>

      <ExampleSection title="Dropdown icône seule">
        <DropdownIconOnly />
      </ExampleSection>

      <ExampleSection title="Tailles de dropdown">
        <DropdownSizes />
      </ExampleSection>
    </div>
  );
}

export function SelectExamples() {
  return (
    <div>
      <ExampleSection title="Select basique">
        <SelectBasic />
      </ExampleSection>

      <ExampleSection title="Select avec radio">
        <SelectWithRadio />
      </ExampleSection>

      <ExampleSection title="Select multiple (checkbox)">
        <SelectMultiple />
      </ExampleSection>

      <ExampleSection title="Select avec recherche">
        <SelectWithSearch />
      </ExampleSection>

      <ExampleSection title="Select avec groupes">
        <SelectWithGroups />
      </ExampleSection>

      <ExampleSection title="Select avec recherche async">
        <SelectAsyncSearch />
      </ExampleSection>

      <ExampleSection title="Select pleine largeur">
        <SelectFullWidth />
      </ExampleSection>

      <ExampleSection title="Select avec Select.Content scrollable">
        <SelectWithScrollableContent />
      </ExampleSection>

      <ExampleSection title="Select avec icône">
        <SelectWithIcon />
      </ExampleSection>

      <ExampleSection title="Select avec icône à droite">
        <SelectWithRightIcon />
      </ExampleSection>

      <ExampleSection title="Select avec icônes (variantes de taille)">
        <SelectWithIconVariants />
      </ExampleSection>

      <ExampleSection title="Select icône seule (trigger)">
        <SelectIconOnlyTrigger />
      </ExampleSection>
    </div>
  );
}

export function ToastExamples() {
  const handleSuccess = () => {
    toast.success({ title: 'Succès', description: 'Opération réussie' });
  };

  const handleError = () => {
    toast.error({
      title: 'Erreur',
      description:
        'Une erreur est survenue Une erreur est survenue Une erreur est survenue Une erreur est survenue',
      duration: 0,
    });
  };

  const handleWarning = () => {
    toast.warning({ title: 'Attention', description: 'Vérifiez les informations' });
  };

  const handleInfo = () => {
    toast.info({ title: 'Information', description: 'Voici une information utile' });
  };

  const handlePromise = () => {
    const fakePromise = new Promise<{ name: string }>((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve({ name: 'Formation' }) : reject(new Error('Échec'));
      }, 2000);
    });

    toast.promise(fakePromise, {
      loading: { title: 'Chargement...', description: 'Veuillez patienter' },
      success: (data) => ({ title: 'Succès', description: `${data.name} chargé` }),
      error: () => ({ title: 'Erreur', description: 'Le chargement a échoué' }),
    });
  };

  const handlePositions = () => {
    toast.info({ title: 'Top Left', position: 'top-left' });
    setTimeout(() => toast({ title: 'Top Center', position: 'top-center' }), 100);
    setTimeout(() => toast.success({ title: 'Top Center', position: 'top-center' }), 100);
    setTimeout(() => toast.warning({ title: 'Top Right', position: 'top-right' }), 200);
    setTimeout(() => toast.error({ title: 'Bottom Left', position: 'bottom-left' }), 300);
    setTimeout(() => toast.info({ title: 'Bottom Center', position: 'bottom-center' }), 400);
    setTimeout(() => toast.success({ title: 'Bottom Right', position: 'bottom-right' }), 500);
  };

  const handleMultiple = () => {
    toast.success({ title: 'Premier toast' });
    setTimeout(() => toast.info({ title: 'Deuxième toast' }), 300);
    setTimeout(() => toast.warning({ title: 'Troisième toast' }), 600);
  };

  return (
    <div>
      <ExampleSection title="Types de toast">
        <div className="fr-btns-group fr-btns-group--inline">
          <button type="button" className="fr-btn fr-btn--secondary" onClick={handleSuccess}>
            Success
          </button>
          <button type="button" className="fr-btn fr-btn--secondary" onClick={handleError}>
            Error
          </button>
          <button type="button" className="fr-btn fr-btn--secondary" onClick={handleWarning}>
            Warning
          </button>
          <button type="button" className="fr-btn fr-btn--secondary" onClick={handleInfo}>
            Info
          </button>
        </div>
      </ExampleSection>

      <ExampleSection title="Toast avec promesse">
        <button type="button" className="fr-btn fr-btn--secondary" onClick={handlePromise}>
          Lancer une promesse (aléatoire)
        </button>
      </ExampleSection>

      <ExampleSection title="Positions">
        <button type="button" className="fr-btn fr-btn--secondary" onClick={handlePositions}>
          Afficher toutes les positions
        </button>
      </ExampleSection>

      <ExampleSection title="Toasts multiples">
        <button type="button" className="fr-btn fr-btn--secondary" onClick={handleMultiple}>
          Afficher plusieurs toasts
        </button>
      </ExampleSection>
    </div>
  );
}
