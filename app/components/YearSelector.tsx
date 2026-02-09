import { useId, useState } from 'react';

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
  maxYears?: number;
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
  maxYears = 5,
}: YearSelectorProps) {
  const id = useId();
  const [showAll, setShowAll] = useState(false);

  const hiddenYearsCount = availableYears.length - maxYears;
  const showMoreIndicator = hiddenYearsCount > 1 && !showAll;
  const displayYears = showAll || availableYears.length <= maxYears ? availableYears : availableYears.slice(0, maxYears);

  return (
    <>
      <div className="fr-select-group fr-hidden-md">
        <label className="fr-label" htmlFor={`${id}-select`}>
          {legend}
          {hint && <span className="fr-hint-text">{hint}</span>}
        </label>
        <select
          className="fr-select"
          id={`${id}-select`}
          value={selectedYear ?? 'evolution'}
          onChange={(e) => onYearChange(e.target.value === 'evolution' ? null : e.target.value)}
        >
          {!hideEvolution && (
            <option value="evolution" disabled={disableEvolution}>
              {evolutionLabel}
            </option>
          )}
          {availableYears.map((year: string) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="fr-hidden fr-unhidden-md">

        <fieldset className={`fr-segmented ${className}`}>
          <legend className="fr-segmented__legend">
            {legend}
            {hint && <span className="fr-hint-text">{hint}</span>}
          </legend>
          <div className="fr-segmented__elements">
            {displayYears.length > 0 &&
              displayYears.map((year: string) => (
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
            {showMoreIndicator && (
              <div key="more" className="fr-segmented__element">
                <input
                  checked={false}
                  type="radio"
                  id={`${id}-year-extend`}
                  name={`${id}-year`}
                  onChange={() => setShowAll(true)}

                />
                <label aria-describedby="tooltip-0" className="fr-label" htmlFor={`${id}-year-extend`} title={`${hiddenYearsCount} années supplémentaires disponibles`}>
                  ...
                </label>
                <span className="fr-tooltip fr-placement" id="tooltip-0" role="tooltip">{`${hiddenYearsCount} années supplémentaires disponibles`}</span>
              </div>
            )}
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
      </div>
    </>
  );
}
