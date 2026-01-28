import { useMemo } from 'react';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import FormationMap from '@/components/maps/FormationMap';
import type { Etablissement as EtablissementType, Program } from '~/schemas/programs';

type EtablissementsProps = {
  etabs: Program['etablissements'];
  locations: Program['locations'];
  isVisible?: boolean;
};

interface GroupedEtablissement {
  paysageId: string;
  paysageName: string;
  mainEtab: EtablissementType | null;
  subEtabs: Array<{
    etab: EtablissementType;
    method: string | undefined;
  }>;
  allEtabs: EtablissementType[];
}

function groupEtablissementsByPaysage(etabs: Program['etablissements']): GroupedEtablissement[] {
  const grouped = new Map<string, GroupedEtablissement>();

  for (const etab of etabs) {
    const paysageEltToUse = etab.paysageEltToUse;
    const paysageElt = etab.paysageElt;

    if (!paysageEltToUse) {
      const key = etab.uai;
      if (!grouped.has(key)) {
        grouped.set(key, {
          paysageId: paysageElt?.id || etab.uai,
          paysageName: paysageElt?.name || etab.name,
          mainEtab: etab,
          subEtabs: [],
          allEtabs: [etab],
        });
      }
      continue;
    }

    const key = paysageEltToUse.id;

    if (!grouped.has(key)) {
      grouped.set(key, {
        paysageId: paysageEltToUse.id,
        paysageName: paysageEltToUse.name,
        mainEtab: null,
        subEtabs: [],
        allEtabs: [],
      });
    }

    const group = grouped.get(key)!;
    group.allEtabs.push(etab);

    const isDirectFiliation = paysageElt?.id === paysageEltToUse.id;

    if (isDirectFiliation) {
      group.mainEtab = etab;
    } else {
      group.subEtabs.push({
        etab,
        method: paysageElt?.uaiToPaysageMethod,
      });
    }
  }

  return Array.from(grouped.values());
}

function SubEtabCard({ etab, method }: { etab: EtablissementType; method: string | undefined }) {
  return (
    <div className="fr-py-1w fr-px-2v fr-background-contrast--grey fx-radius--sm">
      <div className="fx-spacer">
        <span className="fr-text--sm fr-text--bold fr-mb-0">
          {etab.paysageElt?.name || etab.name}
        </span>
        {method && (
          <span className="fr-badge fr-badge--sm fr-badge--no-icon" title="Méthode de rattachement">
            {method}
          </span>
        )}
      </div>
      <div className="fr-text--xs fr-text-mention--grey fr-mb-0">
        {etab.paysageElt?.id && <span>{etab.paysageElt.id}</span>}
        {etab.paysageElt?.id && etab.uai && <span className="fr-mx-1v">•</span>}
        {etab.uai && <span>{etab.uai}</span>}
      </div>
    </div>
  );
}

function EtablissementGroupCard({ group }: { group: GroupedEtablissement }) {
  const { mainEtab, subEtabs, paysageName, paysageId, allEtabs } = group;

  const displayEtab = mainEtab || subEtabs[0]?.etab;
  const hasMultiple = allEtabs.length > 1;
  const hasSubElements = subEtabs.length > 0;

  if (!displayEtab) return null;

  return (
    <div className="fr-card fr-card--shadow fr-p-3w">
      <div className="fr-mb-2w">
        <div className="fr-mb-1v fx-flex fx-items-center fx-gap-2w fx-flex-wrap">
          {displayEtab.typeDelivrance && (
            <span className="fr-badge fr-badge--success fr-badge--sm">
              {displayEtab.typeDelivrance}
            </span>
          )}
          {displayEtab.sector && (
            <span
              className={`fr-badge fr-badge--sm fr-badge--no-icon ${
                displayEtab.sector.toLowerCase() === 'public'
                  ? 'fr-badge--blue-cumulus'
                  : 'fr-badge--pink-tuile'
              }`}
            >
              {displayEtab.sector}
            </span>
          )}
          {hasMultiple && (
            <span className="fr-badge fr-badge--sm fr-badge--purple-glycine fr-badge--no-icon">
              {allEtabs.length} établissement{allEtabs.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <h3 className="fr-text--lg fr-text--bold fr-mb-0">{paysageName}</h3>
      </div>

      <div className="fx-flex fx-flex-col fx-gap-1w">
        <div className="fr-text--sm fr-mb-0">
          <span
            className="fr-icon-barcode-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
            aria-hidden="true"
          />
          <span className="fr-text-mention--grey">Paysage </span>
          <span className="fr-text--bold fx-text--monospace">{paysageId}</span>
        </div>

        {mainEtab?.uai && (
          <div className="fr-text--sm fr-mb-0">
            <span
              className="fr-icon-profile-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
              aria-hidden="true"
            />
            <span className="fr-text-mention--grey">UAI </span>
            <span className="fr-text--bold fx-text--monospace">{mainEtab.uai}</span>
          </div>
        )}

        {(displayEtab.academy || displayEtab.region) && (
          <div className="fr-text--sm fr-mb-0">
            <span
              className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
              aria-hidden="true"
            />
            <span className="fr-text-mention--grey">Territoire </span>
            <span>
              {displayEtab.academy && `Académie de ${displayEtab.academy}`}
              {displayEtab.academy && displayEtab.region && ' • '}
              {displayEtab.region}
            </span>
          </div>
        )}

        {displayEtab.nature && (
          <div className="fr-text--sm fr-mb-0">
            <span
              className="fr-icon-government-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
              aria-hidden="true"
            />
            <span className="fr-text-mention--grey">Nature </span>
            <span>{displayEtab.nature}</span>
          </div>
        )}
      </div>

      {hasSubElements && (
        <div className="fr-mt-2w">
          <p className="fr-text--sm fr-text--bold fr-mb-1w fr-text-mention--grey">
            {subEtabs.length} composante{subEtabs.length > 1 ? 's' : ''} rattachée
            {subEtabs.length > 1 ? 's' : ''}
          </p>
          <div className="fx-flex fx-flex-col fx-gap-2w">
            {subEtabs.map(({ etab, method }) => (
              <SubEtabCard key={etab.uai} etab={etab} method={method} />
            ))}
          </div>
        </div>
      )}

      {!hasSubElements && !mainEtab && allEtabs.length === 1 && allEtabs[0] && (
        <div className="fr-mt-2w fr-text--sm">
          {allEtabs[0].uai && (
            <>
              <span
                className="fr-icon-profile-line fr-icon--sm fr-mr-1v fr-text-mention--grey"
                aria-hidden="true"
              />
              <span className="fr-text-mention--grey">UAI </span>
              <span className="fr-text--bold fx-text--monospace">{allEtabs[0].uai}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MapLegend({
  totalEtabLocations,
  totalSites,
}: {
  totalEtabLocations: number;
  totalSites: number;
}) {
  return (
    <div className="fx-spacer fr-py-2w fr-px-2v fr-background-alt--grey fr-text--xs fr-mb-0 fr-mt-3w">
      {totalEtabLocations > 0 && (
        <div className="fx-flex fx-items-center fx-gap-1w">
          <span
            className="fr-icon-map-pin-2-fill fr-icon--sm"
            style={{ color: 'var(--background-action-high-blue-france)' }}
            aria-hidden="true"
          />
          <span>
            {totalEtabLocations} établissement{totalEtabLocations > 1 ? 's' : ''}
          </span>
        </div>
      )}
      {totalSites > 0 && (
        <div className="fx-flex fx-items-center fx-gap-1w">
          <span
            className="fr-icon-map-pin-user-fill fr-icon--sm"
            style={{ color: 'var(--background-action-high-green-emeraude)' }}
            aria-hidden="true"
          />
          <span>
            {totalSites} site{totalSites > 1 ? 's' : ''} de formation
          </span>
        </div>
      )}
    </div>
  );
}

export default function Etablissement({ etabs, locations, isVisible = true }: EtablissementsProps) {
  const groupedEtabs = useMemo(() => groupEtablissementsByPaysage(etabs), [etabs]);

  const totalSites = locations.filter((loc) => loc.types.includes('site')).length;
  const totalEtabLocations = locations.filter((loc) => loc.types.includes('etablissement')).length;

  return (
    <section id="etablissement">
      <h2 className="fr-h4">Établissements</h2>
      <AutoGrid min={450}>
        <div className="fx-flex fx-flex-col fx-gap-6w">
          {groupedEtabs.map((group) => (
            <EtablissementGroupCard key={group.paysageId} group={group} />
          ))}
        </div>

        <div
          className="fx-flex fx-flex-col"
          style={{
            position: 'sticky',
            top: '1rem',
          }}
        >
          <div
            style={{
              height: '600px',
              overflow: 'hidden',
            }}
          >
            {isVisible ? (
              <FormationMap locations={locations} />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--background-contrast-grey)',
                }}
              />
            )}
          </div>

          {(totalEtabLocations > 0 || totalSites > 0) && (
            <MapLegend totalEtabLocations={totalEtabLocations} totalSites={totalSites} />
          )}
        </div>
      </AutoGrid>
    </section>
  );
}
