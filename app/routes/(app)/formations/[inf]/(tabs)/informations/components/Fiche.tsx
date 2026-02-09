import { AccreditationCard } from '@/components/cards/AccreditationCard';
import { KeyValueCard } from '@/components/cards/KeyValueCard';
import { AutoGrid } from '@/components/Grids/AutoGrid';
import type { Program } from '~/schemas/programs';

export default function FicheAdministrative({ formation }: { formation: Program }) {
  const secteur = [...new Set(formation.etablissements?.map((e) => e.sector).filter(Boolean))].join(
    ' • ',
  );

  const parcoursCount = formation.parcours?.length || 0;

  const codesSise = Array.isArray(formation.codeSise) ? formation.codeSise : [formation.codeSise];

  return (
    <section id="fiche-administrative">
      <div className="fr-mb-6w">
        <AutoGrid min={300} gap="sm">
          <KeyValueCard label="Secteur" value={secteur} />
          <KeyValueCard label="Catégorie" value={formation.diploma.category} />
          <KeyValueCard
            label="Type de diplôme"
            value={`${formation.diploma.type} (${formation.diploma.code})`}
          />
          {!!parcoursCount && (
            <KeyValueCard label="Nombre de parcours" value={parcoursCount.toString()} />
          )}
          <KeyValueCard label="Discipline SISE" value={formation.disciplinarySector} />
          {!!formation?.domains?.length && (
            <KeyValueCard label="Domaines" value={formation?.domains?.join(' • ')} />
          )}
        </AutoGrid>
      </div>

      <AutoGrid>
        <AccreditationCard
          dateDebut={formation.accreditation.startDate}
          dateFin={formation.accreditation.endDate}
        />
        <div>
          <AutoGrid min={200} gap="sm">
            <KeyValueCard label="INF" value={formation.inf} monospace copy />
            <KeyValueCard label={`Code RNCP`} value={formation.rncp} monospace copy />
            <KeyValueCard
              copy
              monospace
              label={`Code${codesSise.length > 1 ? 's' : ''} SISE`}
              value={codesSise.join(` • `)}
            />
          </AutoGrid>
        </div>
      </AutoGrid>
    </section>
  );
}
