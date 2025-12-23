import { useMemo, useState } from 'react';
import PillsTitle from '@/components/PillsTitle';
import type { Etape, Location, Parcours, Program } from '~/schemas/programs';

interface ParcoursOrganisationProps {
  parcours: Program['parcours'];
  etapes: Program['etapes'];
  locations?: Program['locations'];
}

interface ParcoursAggregation {
  parcours: Parcours;
  etapes: EtapeWithLocations[];
  totalCapacity: number | null;
  teachingModalities: string[];
  sites: Location[];
  hasDiplomanteEtape: boolean;
  languages: string[];
  hasAlternance: boolean;
  hasDistanciel: boolean;
}

interface EtapeWithLocations extends Etape {
  locations: Location[];
}

function aggregateParcoursData(
  p: Parcours,
  allEtapes: Etape[],
  allLocations: Location[],
): ParcoursAggregation {
  // Create a map of locations by ID for quick lookup
  const locationsMap = new Map<string, Location>();
  for (const loc of allLocations) {
    locationsMap.set(loc.id, loc);
  }

  const parcoursEtapes = allEtapes
    .filter((e) => p.cursus?.[0]?.includes(e.infe) && p.openingYear === e.openingYear)
    .map((e) => ({
      ...e,
      locations: (e.siteIds || []).map((id) => locationsMap.get(id)).filter(Boolean) as Location[],
    }));

  // Aggregate capacity (sum of all etapes with capacity)
  const capacities = parcoursEtapes
    .map((e) => e.capacity)
    .filter((c): c is number => c !== undefined && c !== null);
  const totalCapacity = capacities.length > 0 ? capacities.reduce((a, b) => a + b, 0) : null;

  // Collect unique teaching modalities
  const modalitiesSet = new Set<string>();
  for (const e of parcoursEtapes) {
    for (const m of e.teachingModalities || []) {
      modalitiesSet.add(m.label);
    }
  }
  const teachingModalities = Array.from(modalitiesSet);

  // Check for alternance and distanciel
  const hasAlternance = parcoursEtapes.some((e) =>
    e.teachingModalities?.some(
      (m) =>
        m.code?.toLowerCase().includes('alternance') ||
        m.label?.toLowerCase().includes('alternance') ||
        m.code?.toLowerCase().includes('apprentissage') ||
        m.label?.toLowerCase().includes('apprentissage'),
    ),
  );

  const hasDistanciel = parcoursEtapes.some((e) =>
    e.teachingModalities?.some(
      (m) =>
        m.code?.toLowerCase().includes('distance') ||
        m.label?.toLowerCase().includes('distance') ||
        m.code?.toLowerCase().includes('distanciel') ||
        m.label?.toLowerCase().includes('distanciel'),
    ),
  );

  // Collect unique sites with full location data
  const sitesMap = new Map<string, Location>();
  for (const e of parcoursEtapes) {
    for (const loc of e.locations) {
      sitesMap.set(loc.id, loc);
    }
  }
  const sites = Array.from(sitesMap.values());

  // Check if any etape is diplomante
  const hasDiplomanteEtape = parcoursEtapes.some((e) => e.isDiplomante);

  // Collect unique languages
  const languagesSet = new Set<string>();
  for (const e of parcoursEtapes) {
    for (const l of e.pedagogicalInfo?.teachingLanguages || []) {
      languagesSet.add(l);
    }
  }
  const languages = Array.from(languagesSet);

  return {
    parcours: p,
    etapes: parcoursEtapes,
    totalCapacity,
    teachingModalities,
    sites,
    hasDiplomanteEtape,
    languages,
    hasAlternance,
    hasDistanciel,
  };
}

function LocationCard({ location }: { location: Location }) {
  const { address, name, types } = location;
  const fullAddress = [address?.street, address?.postalCode, address?.city]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className="fr-p-2w fr-mb-1w"
      style={{
        backgroundColor: 'var(--background-contrast-grey)',
        borderRadius: '4px',
        borderLeft: '3px solid var(--border-action-high-blue-france)',
      }}
    >
      <div className="fr-text--sm fr-text--bold fr-mb-1v">
        <span className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v" aria-hidden="true" />
        {name}
      </div>
      {address?.siteName && (
        <div className="fr-text--xs fr-text--mention-grey fr-mb-1v">{address.siteName}</div>
      )}
      {fullAddress && <div className="fr-text--xs">{fullAddress}</div>}
      {types && types.length > 0 && (
        <div className="fr-mt-1v">
          {types.map((type) => (
            <span
              key={type}
              className="fr-badge fr-badge--sm fr-badge--no-icon fr-mr-1v"
              style={{ fontSize: '0.625rem' }}
            >
              {type === 'etablissement' ? 'Établissement' : 'Site'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EtapeCard({ etape, isLast }: { etape: EtapeWithLocations; isLast: boolean }) {
  const { pedagogicalInfo, recruitmentInfo, teachingModalities, locations } = etape;

  return (
    <li className="parcours-step" data-is-last={isLast}>
      <div className="fr-card fr-card--sm fr-card--no-border fr-card--grey fr-mb-2w">
        <div className="fr-card__body">
          <div className="fr-card__content">
            <div
              className="fr-card__start"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '0.5rem',
              }}
            >
              {etape.level && (
                <span className="fr-badge fr-badge--sm fr-badge--blue-france fr-badge--no-icon">
                  {etape.level}
                </span>
              )}
              {etape.isDiplomante && (
                <span className="fr-badge fr-badge--sm fr-badge--green-emeraude fr-badge--no-icon">
                  Diplômante
                </span>
              )}
              {etape.isOpen ? (
                <span className="fr-badge fr-badge--sm fr-badge--success fr-badge--no-icon">
                  Ouverte
                </span>
              ) : (
                <span className="fr-badge fr-badge--sm fr-badge--no-icon">Fermée</span>
              )}
            </div>

            <h4 className="fr-card__title fr-text--md fr-mb-1w">{etape.label}</h4>

            <div className="fr-card__desc">
              <dl className="fr-mb-0" style={{ display: 'grid', gap: '0.5rem' }}>
                {etape.capacity !== undefined && etape.capacity !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <dt className="fr-text--sm fr-text--bold fr-mb-0">
                      <span className="fr-icon-user-line fr-icon--sm" aria-hidden="true" /> Capacité
                      :
                    </dt>
                    <dd className="fr-text--sm fr-mb-0">{etape.capacity} places</dd>
                  </div>
                )}

                {teachingModalities && teachingModalities.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <dt className="fr-text--sm fr-text--bold fr-mb-0">
                      <span className="fr-icon-book-2-line fr-icon--sm" aria-hidden="true" />{' '}
                      Modalités :
                    </dt>
                    <dd className="fr-text--sm fr-mb-0">
                      {teachingModalities.map((m) => m.label).join(', ')}
                    </dd>
                  </div>
                )}

                {locations && locations.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <dt className="fr-text--sm fr-text--bold fr-mb-0">
                      <span className="fr-icon-map-pin-2-line fr-icon--sm" aria-hidden="true" />{' '}
                      Sites :
                    </dt>
                    <dd className="fr-text--sm fr-mb-0">
                      {locations.length} lieu{locations.length > 1 ? 'x' : ''}
                    </dd>
                  </div>
                )}

                {pedagogicalInfo?.teachingLanguages &&
                  pedagogicalInfo.teachingLanguages.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <dt className="fr-text--sm fr-text--bold fr-mb-0">
                        <span className="fr-icon-translate-2 fr-icon--sm" aria-hidden="true" />{' '}
                        Langues :
                      </dt>
                      <dd className="fr-text--sm fr-mb-0">
                        {pedagogicalInfo.teachingLanguages.join(', ')}
                      </dd>
                    </div>
                  )}
              </dl>

              {recruitmentInfo &&
                (recruitmentInfo.expectations?.length ||
                  recruitmentInfo.recommendedDiplomas?.length) && (
                  <details className="fr-mt-2w">
                    <summary className="fr-text--sm fr-text--bold" style={{ cursor: 'pointer' }}>
                      <span className="fr-icon-clipboard-line fr-icon--sm" aria-hidden="true" />{' '}
                      Informations de recrutement
                    </summary>
                    <div className="fr-pl-2w fr-pt-1w">
                      {recruitmentInfo.expectations && recruitmentInfo.expectations.length > 0 && (
                        <div className="fr-mb-1w">
                          <span className="fr-text--xs fr-text--bold">Attentes :</span>
                          <ul className="fr-text--xs fr-mb-0 fr-pl-2w">
                            {recruitmentInfo.expectations.slice(0, 3).map((exp) => (
                              <li key={exp}>{exp}</li>
                            ))}
                            {recruitmentInfo.expectations.length > 3 && (
                              <li className="fr-text--mention-grey">
                                +{recruitmentInfo.expectations.length - 3} autres...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      {recruitmentInfo.recommendedDiplomas &&
                        recruitmentInfo.recommendedDiplomas.length > 0 && (
                          <div>
                            <span className="fr-text--xs fr-text--bold">
                              Diplômes recommandés :
                            </span>
                            <ul className="fr-text--xs fr-mb-0 fr-pl-2w">
                              {recruitmentInfo.recommendedDiplomas.slice(0, 3).map((d) => (
                                <li key={d}>{d}</li>
                              ))}
                              {recruitmentInfo.recommendedDiplomas.length > 3 && (
                                <li className="fr-text--mention-grey">
                                  +{recruitmentInfo.recommendedDiplomas.length - 3} autres...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </details>
                )}

              {locations && locations.length > 0 && (
                <details className="fr-mt-2w">
                  <summary className="fr-text--sm fr-text--bold" style={{ cursor: 'pointer' }}>
                    <span className="fr-icon-map-pin-2-line fr-icon--sm" aria-hidden="true" /> Voir
                    les {locations.length} lieu{locations.length > 1 ? 'x' : ''} de formation
                  </summary>
                  <div className="fr-pl-2w fr-pt-1w">
                    {locations.map((loc) => (
                      <LocationCard key={loc.id} location={loc} />
                    ))}
                  </div>
                </details>
              )}

              {pedagogicalInfo?.formationLink && (
                <div className="fr-mt-2w">
                  <a
                    href={pedagogicalInfo.formationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fr-link fr-link--sm fr-icon-external-link-line fr-link--icon-right"
                  >
                    Voir la fiche formation
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function ParcoursCard({ data }: { data: ParcoursAggregation }) {
  const { parcours: p, etapes: parcoursEtapes } = data;
  const collapseId = `parcours-${p.infp}-${p.openingYear}`;

  return (
    <section className="fr-accordion">
      <h3 className="fr-accordion__title">
        <button
          type="button"
          className="fr-accordion__btn"
          aria-expanded="false"
          aria-controls={collapseId}
        >
          <div className="fx-spacer">
            <div>
              <span>{p.label}</span>
              {p.sigle && (
                <span
                  className="fr-text--sm fr-ml-1w"
                  style={{ color: 'var(--text-mention-grey)' }}
                >
                  ({p.sigle})
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Aggregated badges */}
              {data.hasAlternance && (
                <span className="fr-badge fr-badge--sm fr-badge--purple-glycine fr-badge--no-icon">
                  Alternance
                </span>
              )}
              {data.hasDistanciel && (
                <span className="fr-badge fr-badge--sm fr-badge--yellow-tournesol fr-badge--no-icon">
                  Distanciel
                </span>
              )}
              <span className="fr-text--sm" style={{ color: 'var(--text-mention-grey)' }}>
                {parcoursEtapes.length} étape{parcoursEtapes.length > 1 ? 's' : ''}
              </span>
              {p.isOpen ? (
                <span className="fr-badge fr-badge--sm fr-badge--success fr-badge--no-icon">
                  Ouvert
                </span>
              ) : (
                <span className="fr-badge fr-badge--sm fr-badge--no-icon">Fermé</span>
              )}
            </div>
          </div>
        </button>
      </h3>

      <div className="fr-collapse" id={collapseId}>
        <div className="fr-p-2w fr-mb-2w" style={{ backgroundColor: 'var(--background-alt-grey)' }}>
          <h4 className="fr-text--md fr-mb-2w">Résumé du parcours</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {p.rncp && (
              <div>
                <span className="fr-text--sm fr-text--bold">
                  <span className="fr-icon-award-line fr-icon--sm" aria-hidden="true" /> Code RNCP :
                </span>
                <span className="fr-text--sm fr-ml-1w">{p.rncp}</span>
              </div>
            )}

            {p.codeSise && (
              <div>
                <span className="fr-text--sm fr-text--bold">
                  <span className="fr-icon-file-text-line fr-icon--sm" aria-hidden="true" /> Code
                  SISE :
                </span>
                <span className="fr-text--sm fr-ml-1w">{String(p.codeSise)}</span>
              </div>
            )}

            {data.totalCapacity !== null && (
              <div>
                <span className="fr-text--sm fr-text--bold">
                  <span className="fr-icon-user-line fr-icon--sm" aria-hidden="true" /> Capacité
                  totale :
                </span>
                <span className="fr-text--sm fr-ml-1w">{data.totalCapacity} places</span>
              </div>
            )}

            {data.sites.length > 0 && (
              <div>
                <span className="fr-text--sm fr-text--bold">
                  <span className="fr-icon-map-pin-2-line fr-icon--sm" aria-hidden="true" /> Lieux
                  de formation :
                </span>
                <span className="fr-text--sm fr-ml-1w">{data.sites.length}</span>
              </div>
            )}

            {data.teachingModalities.length > 0 && (
              <div style={{ gridColumn: 'span 2' }}>
                <span className="fr-text--sm fr-text--bold">
                  <span className="fr-icon-book-2-line fr-icon--sm" aria-hidden="true" /> Modalités
                  d'enseignement :
                </span>
                <span className="fr-text--sm fr-ml-1w">{data.teachingModalities.join(', ')}</span>
              </div>
            )}

            {data.languages.length > 0 && (
              <div>
                <span className="fr-text--sm fr-text--bold">
                  <span className="fr-icon-translate-2 fr-icon--sm" aria-hidden="true" /> Langues :
                </span>
                <span className="fr-text--sm fr-ml-1w">{data.languages.join(', ')}</span>
              </div>
            )}

            {data.hasDiplomanteEtape && (
              <div>
                <span className="fr-badge fr-badge--sm fr-badge--green-emeraude fr-badge--no-icon">
                  Parcours diplômant
                </span>
              </div>
            )}
          </div>
        </div>

        {data.sites.length > 0 && (
          <details className="fr-mb-3w fr-pl-2w">
            <summary className="fr-text--md fr-text--bold" style={{ cursor: 'pointer' }}>
              <span className="fr-icon-map-pin-2-line fr-icon--sm" aria-hidden="true" /> Tous les
              lieux de formation ({data.sites.length})
            </summary>
            <div
              className="fr-pt-2w"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {data.sites.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </div>
          </details>
        )}

        {parcoursEtapes.length > 0 && (
          <>
            <h4 className="fr-text--md fr-mb-2w fr-pl-2w">
              Étapes du parcours ({parcoursEtapes.length})
            </h4>
            <ol className="parcours-steps fr-pl-2w">
              {parcoursEtapes.map((etape, idx) => (
                <EtapeCard
                  key={etape.infe}
                  etape={etape}
                  isLast={idx === parcoursEtapes.length - 1}
                />
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}

export default function ParcoursOrganisation({
  parcours,
  etapes,
  locations,
}: ParcoursOrganisationProps) {
  const [selectedYear, setSelectedYear] = useState(() => {
    const years = [...new Set(parcours.map((p) => p.openingYear as number))].sort((a, b) => b - a);
    return years[0] || new Date().getFullYear();
  });

  const aggregatedParcours = useMemo(() => {
    return parcours
      .filter((p) => p.openingYear === selectedYear)
      .map((p) => aggregateParcoursData(p, etapes, locations || []));
  }, [parcours, etapes, locations, selectedYear]);

  const parcoursYears = useMemo(() => {
    return [...new Set(parcours.map((p) => p.openingYear as number))].sort((a, b) => b - a);
  }, [parcours]);

  const globalStats = useMemo(() => {
    const openCount = aggregatedParcours.filter((a) => a.parcours.isOpen).length;
    const totalCapacity = aggregatedParcours.reduce((sum, a) => sum + (a.totalCapacity || 0), 0);
    const hasAnyCapacity = aggregatedParcours.some((a) => a.totalCapacity !== null);
    const alternanceCount = aggregatedParcours.filter((a) => a.hasAlternance).length;
    const distancielCount = aggregatedParcours.filter((a) => a.hasDistanciel).length;

    const allSitesMap = new Map<string, Location>();
    for (const a of aggregatedParcours) {
      for (const site of a.sites) {
        allSitesMap.set(site.id, site);
      }
    }
    const totalSites = allSitesMap.size;

    return {
      total: aggregatedParcours.length,
      openCount,
      closedCount: aggregatedParcours.length - openCount,
      totalCapacity: hasAnyCapacity ? totalCapacity : null,
      alternanceCount,
      distancielCount,
      totalSites,
    };
  }, [aggregatedParcours]);

  if (parcours.length === 0) return null;

  return (
    <section id="parcours">
      <PillsTitle icon="fr-icon-road-map-line" as="h2">
        Parcours de formation ({parcours.length})
      </PillsTitle>

      <div className="fr-mb-4w">
        <fieldset className="fr-segmented">
          <legend className="fr-segmented__legend">Voir les parcours pour l'année :</legend>
          <div className="fr-segmented__elements">
            {parcoursYears.map((year) => (
              <div key={year} className="fr-segmented__element">
                <input
                  checked={year === selectedYear}
                  value={year}
                  type="radio"
                  id={`segmented-${year}`}
                  name="segmented"
                  onChange={() => setSelectedYear(year)}
                />
                <label className="fr-label" htmlFor={`segmented-${year}`}>
                  {year}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="fr-callout fr-callout--blue-france fr-mb-3w">
        <h4 className="fr-callout__title">Synthèse {selectedYear}</h4>
        <div
          className="fr-callout__text"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <strong>{globalStats.total}</strong> parcours
            {globalStats.openCount > 0 && (
              <span className="fr-ml-1w">
                (
                <span className="fr-text--success">
                  {globalStats.openCount} ouvert{globalStats.openCount > 1 ? 's' : ''}
                </span>
                {globalStats.closedCount > 0 && (
                  <>
                    , {globalStats.closedCount} fermé{globalStats.closedCount > 1 ? 's' : ''}
                  </>
                )}
                )
              </span>
            )}
          </div>
          {globalStats.totalCapacity !== null && globalStats.totalCapacity > 0 && (
            <div>
              <span className="fr-icon-user-line fr-icon--sm" aria-hidden="true" />{' '}
              <strong>{globalStats.totalCapacity}</strong> places au total
            </div>
          )}
          {globalStats.alternanceCount > 0 && (
            <div>
              <span className="fr-badge fr-badge--sm fr-badge--purple-glycine fr-badge--no-icon">
                {globalStats.alternanceCount} en alternance
              </span>
            </div>
          )}
          {globalStats.distancielCount > 0 && (
            <div>
              <span className="fr-badge fr-badge--sm fr-badge--yellow-tournesol fr-badge--no-icon">
                {globalStats.distancielCount} en distanciel
              </span>
            </div>
          )}
          {globalStats.totalSites > 0 && (
            <div>
              <span className="fr-icon-map-pin-2-line fr-icon--sm" aria-hidden="true" />{' '}
              <strong>{globalStats.totalSites}</strong> lieu{globalStats.totalSites > 1 ? 'x' : ''}{' '}
              de formation
            </div>
          )}
        </div>
      </div>

      <div className="fr-accordion-group">
        {aggregatedParcours.map((data) => (
          <ParcoursCard
            key={`parcours-${data.parcours.infp}-${data.parcours.openingYear}`}
            data={data}
          />
        ))}
      </div>
    </section>
  );
}
