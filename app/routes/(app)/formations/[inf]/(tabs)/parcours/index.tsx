import { Map as MapLibre, Marker } from '@vis.gl/react-maplibre';
import { useMemo, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { YearSelector } from '@/components/YearSelector';
import type { Etape, Location, Parcours, Program } from '~/schemas/programs';
import './styles.css';

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

function sortByLevel(a: EtapeWithLocations, b: EtapeWithLocations): number {
  const extractNumber = (level: string | null | undefined): number => {
    if (!level) return 999;
    const match = /(\d+)/.exec(level);
    const numStr = match?.[1];
    return numStr ? Number.parseInt(numStr, 10) : 999;
  };
  return extractNumber(a.level) - extractNumber(b.level);
}

function aggregateParcoursData(
  p: Parcours,
  allEtapes: Etape[],
  allLocations: Location[],
): ParcoursAggregation {
  const locationsMap = new Map<string, Location>();
  for (const loc of allLocations) {
    locationsMap.set(loc.id, loc);
  }

  const parcoursEtapes = allEtapes
    .filter((e) => p.cursus?.[0]?.includes(e.infe) && p.openingYear === e.openingYear)
    .map((e) => ({
      ...e,
      locations: (e.siteIds || []).map((id) => locationsMap.get(id)).filter(Boolean) as Location[],
    }))
    .sort(sortByLevel);

  const capacities = parcoursEtapes
    .map((e) => e.capacity)
    .filter((c): c is number => c !== undefined && c !== null);
  const totalCapacity = capacities.length > 0 ? capacities.reduce((a, b) => a + b, 0) : null;

  const modalitiesSet = new Set<string>();
  for (const e of parcoursEtapes) {
    for (const m of e.teachingModalities || []) {
      modalitiesSet.add(m.label);
    }
  }
  const teachingModalities = Array.from(modalitiesSet);

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

  const sitesMap = new Map<string, Location>();
  for (const e of parcoursEtapes) {
    for (const loc of e.locations) {
      sitesMap.set(loc.id, loc);
    }
  }
  const sites = Array.from(sitesMap.values());

  const hasDiplomanteEtape = parcoursEtapes.some((e) => e.isDiplomante);

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

function MiniMap({ locations, isVisible }: { locations: Location[]; isVisible: boolean }) {
  const validLocations = locations.filter(
    (loc) => loc.geo?.coordinates && loc.geo.coordinates.length === 2,
  );

  // Each time isVisible flips back to true, bump the key to force a clean remount.
  // This prevents MapLibre from trying to update a stale/destroyed WebGL context.
  const mountKeyRef = useRef(0);
  const prevVisibleRef = useRef(isVisible);
  if (isVisible && !prevVisibleRef.current) {
    mountKeyRef.current += 1;
  }
  prevVisibleRef.current = isVisible;

  if (validLocations.length === 0) return null;
  if (!isVisible) return null;

  const firstLoc = validLocations[0];
  const theme =
    document.getElementsByTagName('html')?.[0]?.getAttribute('data-fr-theme') === 'dark'
      ? 'dark'
      : 'sunny';
  const API_KEY = '5V4ER9yrsLxoHQrAGQuYNu4yWqXNqKAM6iaX5D1LGpRNTBxvQL3enWXpxMQqTrY8';
  const mapStyle = `https://api.jawg.io/styles/jawg-${theme}.json?access-token=${API_KEY}`;

  return (
    <div style={{ width: '180px', height: '140px', flexShrink: 0 }}>
      <MapLibre
        key={mountKeyRef.current}
        initialViewState={{
          longitude: firstLoc?.geo?.coordinates?.[0] ?? 2.3522,
          latitude: firstLoc?.geo?.coordinates?.[1] ?? 46.6034,
          zoom: 10,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
        scrollZoom={true}
      >
        {validLocations.map((loc) => {
          const coords = loc.geo?.coordinates;
          if (!coords || coords.length < 2) return null;
          const lng = coords[0] as number;
          const lat = coords[1] as number;
          return (
            <Marker key={loc.id} longitude={lng} latitude={lat} anchor="bottom">
              <span
                className="fr-icon-map-pin-2-fill fr-icon--sm"
                style={{ color: 'var(--background-action-high-blue-france)' }}
                aria-hidden="true"
              />
            </Marker>
          );
        })}
      </MapLibre>
    </div>
  );
}

function EtapeCard({ etape, isVisible }: { etape: EtapeWithLocations; isVisible: boolean }) {
  const { pedagogicalInfo, recruitmentInfo, teachingModalities, locations } = etape;
  const hasLocations = locations && locations.length > 0;

  const hasPedagogicalDetails =
    (pedagogicalInfo?.keywords && pedagogicalInfo.keywords.length > 0) ||
    (pedagogicalInfo?.disciplines && pedagogicalInfo.disciplines.length > 0) ||
    pedagogicalInfo?.pedagogicalEmail ||
    pedagogicalInfo?.administrativeEmail ||
    pedagogicalInfo?.programLink;

  const hasRecruitmentDetails =
    (recruitmentInfo?.expectations && recruitmentInfo.expectations.length > 0) ||
    (recruitmentInfo?.recommendedDiplomas && recruitmentInfo.recommendedDiplomas.length > 0) ||
    (recruitmentInfo?.examCriteria && recruitmentInfo.examCriteria.length > 0) ||
    (recruitmentInfo?.selectionMethods && recruitmentInfo.selectionMethods.length > 0);

  return (
    <div className="fr-py-3w fr-px-2v fx-shadow-border-top">
      <div className="fx-flex fx-gap-4w">
        <div style={{ flex: 1 }}>
          <div className="fr-mb-1v fx-flex fx-items-center fx-gap-2w fx-flex-wrap">
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
            {!etape.isOpen && (
              <span className="fr-badge fr-badge--sm fr-badge--no-icon">Fermée</span>
            )}
          </div>

          <p className="fr-text--md fr-text--bold fr-mb-1w">{etape.label}</p>

          <div className="fx-flex fx-flex-col fx-gap-1w">
            {etape.capacity !== undefined && etape.capacity !== null && (
              <div className="fr-text--sm fr-mb-0">
                <span
                  className="fr-icon-user-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
                  aria-hidden="true"
                />
                <span className="fr-text-mention--grey">Capacité </span>
                <span>{etape.capacity} places</span>
              </div>
            )}

            {teachingModalities && teachingModalities.length > 0 && (
              <div className="fr-text--sm fr-mb-0">
                <span
                  className="fr-icon-book-2-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
                  aria-hidden="true"
                />
                <span className="fr-text-mention--grey">Modalités </span>
                <span>{teachingModalities.map((m) => m.label).join(', ')}</span>
              </div>
            )}

            {hasLocations && (
              <div className="fr-text--sm fr-mb-0">
                <span
                  className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
                  aria-hidden="true"
                />
                <span className="fr-text-mention--grey">Sites </span>
                <span>{locations.map((location) => location.name).join(', ')}</span>
              </div>
            )}

            {pedagogicalInfo?.teachingLanguages && pedagogicalInfo.teachingLanguages.length > 0 && (
              <div className="fr-text--sm fr-mb-0">
                <span
                  className="fr-icon-translate-2 fr-icon--sm fr-mr-1v fr-text-mention--grey"
                  aria-hidden="true"
                />
                <span className="fr-text-mention--grey">Langues </span>
                <span>{pedagogicalInfo.teachingLanguages.join(', ')}</span>
              </div>
            )}

            {pedagogicalInfo?.formationLink && (
              <div className="fr-mt-1w">
                <a
                  href={pedagogicalInfo.formationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fr-link fr-link--sm fr-icon-external-link-line fr-link--icon-right"
                >
                  Fiche formation
                </a>
              </div>
            )}
          </div>

          {hasPedagogicalDetails && (
            <details className="fr-mt-2w">
              <summary className="fr-text--sm fr-mb-0 fr-text--bold" style={{ cursor: 'pointer' }}>
                <span className="fr-icon-book-2-line fr-icon--sm fr-mr-1v" aria-hidden="true" />
                Informations pédagogiques
              </summary>
              <div className="fr-pl-3w fr-pt-1w fx-flex fx-flex-col fx-gap-1w">
                {pedagogicalInfo?.keywords && pedagogicalInfo.keywords.length > 0 && (
                  <div className="fr-text--sm fr-mb-0">
                    <span className="fr-text-mention--grey">Mots-clés : </span>
                    <span>{pedagogicalInfo.keywords.join(', ')}</span>
                  </div>
                )}
                {pedagogicalInfo?.disciplines && pedagogicalInfo.disciplines.length > 0 && (
                  <div className="fr-text--sm fr-mb-0">
                    <span className="fr-text-mention--grey">Disciplines : </span>
                    <span>{pedagogicalInfo.disciplines.join(', ')}</span>
                  </div>
                )}
                {pedagogicalInfo?.pedagogicalEmail && (
                  <div className="fr-text--sm fr-mb-0">
                    <span className="fr-text-mention--grey">Email pédagogique : </span>
                    <a
                      href={`mailto:${pedagogicalInfo.pedagogicalEmail}`}
                      className="fr-link fr-link--sm"
                    >
                      {pedagogicalInfo.pedagogicalEmail}
                    </a>
                  </div>
                )}
                {pedagogicalInfo?.administrativeEmail && (
                  <div className="fr-text--sm fr-mb-0">
                    <span className="fr-text-mention--grey">Email administratif : </span>
                    <a
                      href={`mailto:${pedagogicalInfo.administrativeEmail}`}
                      className="fr-link fr-link--sm"
                    >
                      {pedagogicalInfo.administrativeEmail}
                    </a>
                  </div>
                )}
                {pedagogicalInfo?.programLink && (
                  <div className="fr-text--sm fr-mb-0">
                    <a
                      href={pedagogicalInfo.programLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fr-link fr-link--sm fr-icon-external-link-line fr-link--icon-right"
                    >
                      Programme détaillé
                    </a>
                  </div>
                )}
              </div>
            </details>
          )}

          {hasRecruitmentDetails && (
            <details className="fr-mt-2w">
              <summary className="fr-text--sm fr-mb-0 fr-text--bold" style={{ cursor: 'pointer' }}>
                <span className="fr-icon-clipboard-line fr-icon--sm fr-mr-1v" aria-hidden="true" />
                Informations de recrutement
              </summary>
              <div className="fr-pl-3w fr-pt-1w fx-flex fx-flex-col fx-gap-2w">
                {recruitmentInfo?.expectations && recruitmentInfo.expectations.length > 0 && (
                  <div className="fr-text--sm fr-mb-0">
                    <span className="fr-text--bold">Attentes :</span>
                    <ul className="fr-text--sm fr-mb-0 fr-pl-2w fr-mt-1v">
                      {recruitmentInfo.expectations.slice(0, 5).map((exp) => (
                        <li key={exp}>{exp}</li>
                      ))}
                      {recruitmentInfo.expectations.length > 5 && (
                        <li className="fr-text-mention--grey">
                          +{recruitmentInfo.expectations.length - 5} autres...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {recruitmentInfo?.recommendedDiplomas &&
                  recruitmentInfo.recommendedDiplomas.length > 0 && (
                    <div className="fr-text--sm fr-mb-0">
                      <span className="fr-text--bold">Diplômes recommandés :</span>
                      <ul className="fr-text--sm fr-mb-0 fr-pl-2w fr-mt-1v">
                        {recruitmentInfo.recommendedDiplomas.slice(0, 5).map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                        {recruitmentInfo.recommendedDiplomas.length > 5 && (
                          <li className="fr-text-mention--grey">
                            +{recruitmentInfo.recommendedDiplomas.length - 5} autres...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                {recruitmentInfo?.examCriteria && recruitmentInfo.examCriteria.length > 0 && (
                  <div className="fr-text--sm fr-mb-0">
                    <span className="fr-text--bold">Critères d'examen :</span>
                    <ul className="fr-text--sm fr-mb-0 fr-pl-2w fr-mt-1v">
                      {recruitmentInfo.examCriteria.slice(0, 5).map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                      {recruitmentInfo.examCriteria.length > 5 && (
                        <li className="fr-text-mention--grey">
                          +{recruitmentInfo.examCriteria.length - 5} autres...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {recruitmentInfo?.selectionMethods &&
                  recruitmentInfo.selectionMethods.length > 0 && (
                    <div className="fr-text--sm fr-mb-0">
                      <span className="fr-text--bold">Méthodes de sélection :</span>
                      <ul className="fr-text--sm fr-mb-0 fr-pl-2w fr-mt-1v">
                        {recruitmentInfo.selectionMethods.slice(0, 5).map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                        {recruitmentInfo.selectionMethods.length > 5 && (
                          <li className="fr-text-mention--grey">
                            +{recruitmentInfo.selectionMethods.length - 5} autres...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </details>
          )}
        </div>

        {hasLocations && <MiniMap locations={locations} isVisible={isVisible} />}
      </div>
    </div>
  );
}

function ParcoursCard({ data, isVisible }: { data: ParcoursAggregation; isVisible: boolean }) {
  const { parcours: p, etapes: parcoursEtapes } = data;
  const collapseId = `collapse-parcours-${p.infp}-${p.openingYear}`;

  return (
    <div className="fr-card fr-card--shadow fr-mb-2w">
      <div className="fr-accordion parcours-accordion">
        <h3 className="fr-accordion__title">
          <button
            type="button"
            className="fr-accordion__btn"
            aria-expanded="false"
            aria-controls={collapseId}
          >
            <div className="fx-spacer">
              <div>
                <span className="fr-text--bold">{p.label}</span>
                {p.sigle && (
                  <span className="fr-text--sm fr-ml-1w fr-text-mention--grey">({p.sigle})</span>
                )}
              </div>
              <div className="fx-flex fx-items-center fx-gap-2w fx-flex-wrap">
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
                <span className="fr-text--sm fr-text-mention--grey">
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
          <div className="fr-pt-2w fr-px-2w">
            <div className="fr-mb-2w fx-flex fx-gap-4w fx-flex-wrap fx-items-center">
              {p.rncp && (
                <div className="fr-text--sm fr-mb-0">
                  <span
                    className="fr-icon-award-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
                    aria-hidden="true"
                  />
                  <span className="fr-text-mention--grey">RNCP </span>
                  <span className="fr-text--bold fx-text--monospace">{p.rncp}</span>
                </div>
              )}

              {p.codeSise && (
                <div className="fr-text--sm fr-mb-0">
                  <span
                    className="fr-icon-file-text-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
                    aria-hidden="true"
                  />
                  <span className="fr-text-mention--grey">SISE </span>
                  <span className="fr-text--bold fx-text--monospace">{String(p.codeSise)}</span>
                </div>
              )}

              {data.totalCapacity !== null && (
                <div className="fr-text--sm fr-mb-0">
                  <span
                    className="fr-icon-user-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
                    aria-hidden="true"
                  />
                  <span className="fr-text-mention--grey">Capacité </span>
                  <span className="fr-text--bold">{data.totalCapacity} places</span>
                </div>
              )}

              {data.sites.length > 0 && (
                <div className="fr-text--sm fr-mb-0">
                  <span
                    className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
                    aria-hidden="true"
                  />
                  <span className="fr-text-mention--grey">Lieux </span>
                  <span className="fr-text--bold">{data.sites.length}</span>
                </div>
              )}

              {data.languages.length > 0 && (
                <div className="fr-text--sm fr-mb-0">
                  <span
                    className="fr-icon-translate-2 fr-icon--sm fr-mr-1v fr-text-mention--grey"
                    aria-hidden="true"
                  />
                  <span>{data.languages.join(', ')}</span>
                </div>
              )}
            </div>

            {parcoursEtapes.length > 0 && (
              <div className="fx-flex fx-flex-col fx-gap-3w">
                {parcoursEtapes.map((etape) => (
                  <EtapeCard key={etape.infe} etape={etape} isVisible={isVisible} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalStats({ stats, year }: { stats: ReturnType<typeof useGlobalStats>; year: number }) {
  return (
    <div className="fr-py-2w fr-px-1w fr-mb-3w fx-flex fx-gap-6w fx-flex-wrap fx-items-center">
      <div className="fr-text--lg fr-text--bold fr-mb-0">
        <span className="">{stats.total}</span> parcours en {year}
        {stats.openCount > 0 && (
          <span className="fr-ml-1v">
            (
            <span style={{ color: 'var(--text-default-success)' }}>
              {stats.openCount} ouvert{stats.openCount > 1 ? 's' : ''}
            </span>
            {stats.closedCount > 0 && (
              <>
                , {stats.closedCount} fermé{stats.closedCount > 1 ? 's' : ''}
              </>
            )}
            )
          </span>
        )}
      </div>
    </div>
  );
}

function useGlobalStats(aggregatedParcours: ParcoursAggregation[]) {
  return useMemo(() => {
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
}

export default function ParcoursOrganisation({
  parcours,
  etapes,
  locations,
  isVisible = true,
}: ParcoursOrganisationProps & { isVisible?: boolean }) {
  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    const years = [...new Set(parcours.map((p) => p.openingYear as number))].sort((a, b) => b - a);
    return years[0] || new Date().getFullYear();
  });

  const aggregatedParcours = useMemo(() => {
    if (!selectedYear) return [];
    return parcours
      .filter((p) => p.openingYear === selectedYear)
      .map((p) => aggregateParcoursData(p, etapes, locations || []));
  }, [parcours, etapes, locations, selectedYear]);

  const parcoursYears = useMemo(() => {
    return [...new Set(parcours.map((p) => p.openingYear as number))]
      .sort((a, b) => b - a)
      .map(String);
  }, [parcours]);

  const globalStats = useGlobalStats(aggregatedParcours);

  if (parcours.length === 0) return null;

  return (
    <section id="parcours">
      {parcoursYears.length > 1 && (
        <YearSelector
          availableYears={parcoursYears}
          selectedYear={selectedYear ? String(selectedYear) : null}
          onYearChange={(year) => setSelectedYear(year ? Number(year) : null)}
          legend="Choix de l'année d'ouverture"
          hint="Afficher les parcours pour une année spécifique"
          hideEvolution
        />
      )}

      <GlobalStats stats={globalStats} year={selectedYear || new Date().getFullYear()} />

      <div>
        {aggregatedParcours.map((data) => (
          <ParcoursCard
            key={`parcours-${data.parcours.infp}-${data.parcours.openingYear}`}
            data={data}
            // Fix by annelhote
            // isVisible={isVisible}
            isVisible={false}
          />
        ))}
      </div>
    </section>
  );
}
