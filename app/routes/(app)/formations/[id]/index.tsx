import { useParams } from 'react-router';
import { useProgram } from '@/api/programs';
import './styles.css';
import RawData from '@/components/RawData';
import Debouches from './components/Debouches';
import Effectifs from './components/Effectifs';
import Etablissement from './components/Etablissement';
import FicheAdministrative from './components/FicheAdministrative';
import Hero from './components/Hero';
import Insersup from './components/Insersup';
import ParcoursOrganisation from './components/Parcours';

export default function FormationPage() {
  const { inf } = useParams<{ inf: string }>();

  const { data } = useProgram(inf!);

  if (!data) return null;

  const { program: formation } = data;

  // SISE stats (enrollment data)
  const siseData = data.sise || [];

  return (
    <section className="page">
      <Hero formation={formation} />

      <div className="formation-grid">
        <FicheAdministrative formation={formation} />

        <Etablissement etabs={formation.etablissements} locations={formation.locations} />

        <ParcoursOrganisation
          parcours={formation.parcours}
          etapes={formation.etapes}
          locations={formation.locations}
        />

        <Effectifs siseData={siseData} />

        <Insersup insersupData={data.insersup} />

        <Debouches romeInfos={Array.isArray(formation?.romeInfos) ? formation.romeInfos : []} />

        <RawData data={data} />
      </div>
    </section>
  );
}
