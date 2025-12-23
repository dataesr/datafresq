import homeIllustration from '@/assets/home/illustration.svg';
import ovoid from '@/assets/home/ovoid.svg';

export default function Home() {
  return (
    <section
      style={{
        background:
          'linear-gradient(to bottom, var(--background-contrast-blue-france) 0%, var(--background-default-grey) 50%)',
      }}
    >
      <div
        className="page"
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="fr-artwork"
          aria-hidden="true"
          width="100%"
          height="100%"
          viewBox="0 0 160 200"
          style={{ maxWidth: '100%', position: 'absolute', left: '100px', bottom: 0, zIndex: 0 }}
        >
          <use className="fr-artwork-motif" href={`${ovoid}#artwork-motif"`} />
          <use className="fr-artwork-motif" href={`${ovoid}#artwork-background`} />
        </svg>
        <div style={{ maxWidth: '45%', zIndex: 100 }}>
          <p className="fr-text fr-mb-1w fr-text--lead fr-text-label">FRESQ VISUALISATIONS</p>
          <hr
            style={{
              width: '10%',
              backgroundSize: '100% 3px',
              backgroundImage:
                'linear-gradient(0deg,var(--border-default-blue-france),var(--border-default-blue-france))',
              height: '3px',
            }}
          />
          <h1 className="fr-display--xs">
            Explorez les données des formations de l'enseignement supérieur
          </h1>
          <p className="fr-text fr-mb-3w">
            <em>fresq visualisations</em> est un outil de visualisation des données des formations
            de l'enseignement supérieur. Il permet de consulter des indicateurs sur les formations,
            les mentions, les établissements, les régions et les métiers.
          </p>
          <div style={{ display: 'flex', justifyContent: 'start' }}>
            <a className="fr-mb-6w fr-icon-arrow-right-s-line" href="/explore/formations">
              Commencer l'exploration
            </a>
          </div>
        </div>
        <div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img
            src={homeIllustration}
            alt="Illustration de visualisation de données"
            aria-hidden="true"
            style={{ width: '100%', height: 'auto', zIndex: 10 }}
          />
        </div>
      </div>
    </section>
  );
}
