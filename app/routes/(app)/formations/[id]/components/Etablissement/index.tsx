import { AutoGrid } from '@/components/Grids/AutoGrid';
import FormationMap from '@/components/maps/FormationMap';
import PillsTitle from '@/components/PillsTitle';
import type { Program } from '~/schemas/programs';

type EtablissementsProps = {
  etabs: Program['etablissements'];
  locations: Program['locations'];
};

export default function Etablissement({ etabs, locations }: EtablissementsProps) {
  return (
    <section id="etablissement" className="etab-section">
      <PillsTitle as="h2" icon="fr-icon-building-line">
        Établissement{etabs.length > 0 ? 's' : ''}
      </PillsTitle>
      <AutoGrid gap="xl">
        <AutoGrid type="fit">
          {etabs.map((etab) => (
            <div key={etab.uai} className="fx-card fx-card--hover-border">
              <div key={etab.uai} className="establishment-main">
                <div className="establishment-header">
                  <span className="fr-badge fr-badge--success fr-badge--sm">
                    {etab.typeDelivrance}
                  </span>
                  <h3 className="fr-text--lg fr-text--bold fr-mb-0">
                    {etab.paysageEltToUse?.name
                      ? etab.paysageEltToUse.name
                      : etab.paysageElt?.name || etab.name}
                  </h3>
                </div>

                <div className="establishment-info">
                  {etab.paysageElt?.id && (
                    <div className="info-row">
                      <span className="info-row__label">
                        <span
                          className="fr-icon-barcode-line fr-icon--sm fr-mr-1v"
                          aria-hidden="true"
                        ></span>
                        Paysage
                      </span>
                      <span className="info-row__value info-row__value--code">
                        {etab.paysageElt?.id}
                      </span>
                    </div>
                  )}

                  {etab.sector && (
                    <div className="info-row">
                      <span className="info-row__label">
                        <span
                          className="fr-icon-government-line fr-icon--sm fr-mr-1v"
                          aria-hidden="true"
                        ></span>
                        Secteur
                      </span>
                      <span className="info-row__value">{etab.sector}</span>
                    </div>
                  )}

                  {(etab.academy || etab.region) && (
                    <div className="info-row">
                      <span className="info-row__label">
                        <span
                          className="fr-icon-map-pin-2-line fr-icon--sm fr-mr-1v"
                          aria-hidden="true"
                        ></span>
                        Territoire
                      </span>
                      <span className="info-row__value">
                        {etab.academy && `Académie de ${etab.academy}`}
                        {etab.academy && etab.region && ' • '}
                        {etab.region}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </AutoGrid>
        <div style={{ minWidth: '300px', minHeight: '400px' }}>
          <FormationMap locations={locations} />
        </div>
      </AutoGrid>
    </section>
  );
}
