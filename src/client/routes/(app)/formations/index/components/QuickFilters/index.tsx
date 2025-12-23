import { useProgramsFacets } from '@/api/programs';
import { useProgramsFilters } from '../../hooks/useProgramsFilters';
import { CheckboxMenu } from '../CheckboxMenu';
import FiltersModal from '../FiltersModal';

export default function QuickFilters() {
  const { params, handleCycleChange, handleDiplomaTypeChange } = useProgramsFilters();

  const { facets } = useProgramsFacets({
    query: params.q,
  });

  return (
    <div
      className="fr-mt-2w"
      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}
    >
      <CheckboxMenu
        label="Cycle"
        options={facets.cycles}
        selectedValues={params.cycle}
        onChange={handleCycleChange}
      />

      <CheckboxMenu
        label="Type de diplôme"
        options={facets.diplomaTypes}
        selectedValues={params.diplomaType}
        onChange={handleDiplomaTypeChange}
      />

      <div style={{ marginLeft: 'auto' }}>
        <FiltersModal />
      </div>
    </div>
  );
}
