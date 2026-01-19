import { useId } from 'react';

interface YearSelectorProps {
  availableYears: string[];
  selectedYear: string | null;
  onYearChange: (year: string | null) => void;
  className?: string;
  legend?: string;
  hint?: string;
  evolutionLabel?: string;
  disableEvolution?: boolean;
  disableEvolutionTooltip?: string;
  hideEvolution?: boolean;
}

export function YearSelector({
  availableYears,
  selectedYear,
  onYearChange,
  className = 'fr-mb-3w',
  legend = 'Choix de la vue',
  hint = "Afficher les données pour une promotion spécifique ou l'évolution à travers les promotions",
  evolutionLabel = 'Evolution',
  disableEvolution = false,
  disableEvolutionTooltip = "Pas assez de données pour afficher l'évolution",
  hideEvolution = false,
}: YearSelectorProps) {
  const id = useId();

  return (
    <fieldset className={`fr-segmented ${className}`}>
      <legend className="fr-segmented__legend">
        {legend}
        {hint && <span className="fr-hint-text">{hint}</span>}
      </legend>
      <div className="fr-segmented__elements">
        {availableYears.length > 0 &&
          availableYears.map((year: string) => (
            <div key={year} className="fr-segmented__element">
              <input
                checked={year === selectedYear}
                value={year}
                type="radio"
                id={`${id}-year-${year}`}
                name={`${id}-year`}
                onChange={() => onYearChange(year)}
              />
              <label className="fr-label" htmlFor={`${id}-year-${year}`}>
                {year}
              </label>
            </div>
          ))}
        {!hideEvolution && (
          <div key="evolution" className="fr-segmented__element">
            <input
              checked={!selectedYear}
              value=""
              type="radio"
              id={`${id}-year-evolution`}
              name={`${id}-year`}
              onChange={() => onYearChange(null)}
              disabled={disableEvolution}
            />
            <label
              className="fr-label"
              htmlFor={`${id}-year-evolution`}
              title={disableEvolution ? disableEvolutionTooltip : undefined}
            >
              {evolutionLabel}
            </label>
          </div>
        )}
      </div>
    </fieldset>
  );
}
