import type { Program } from '~/schemas/programs';
import Etablissements from './components/Etablissements';
import Fiche from './components/Fiche';

interface InformationsProps {
  formation: Program;
  activeTab: string;
}

export default function Informations({ formation, activeTab }: InformationsProps) {
  return (
    <>
      <Fiche formation={formation} />
      <div className="fr-mt-6w">
        <Etablissements
          etabs={formation.etablissements}
          locations={formation.locations}
          isVisible={activeTab === 'informations'}
        />
      </div>
    </>
  );
}
