import { Button } from '@/components/Button';

export default function DownloadUserDataCard() {
  const handleDownload = () => {
    alert('Téléchargement des données utilisateur...');
  };

  return (
    <div className="settings-card">
      <div className="settings-card__main settings-card__main--vertical">
        <div className="settings-card__header">
          <p className="fr-h6 fr-mb-0">Télécharger mes données</p>
          <p className="fr-text--sm fr-mb-0">
            Vous pouvez télécharger toutes les données personnelles associées à votre compte au format ZIP.
          </p>
        </div>
      </div>
      <div className="settings-card__footer">
        <Button variant="secondary" size="sm" onClick={handleDownload}>
          Télécharger mes données
        </Button>
      </div>
    </div>
  );
}
