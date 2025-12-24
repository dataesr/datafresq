import './styles.css';
interface AccreditationCardProps {
  dateDebut?: string;
  dateFin?: string;
}

export function AccreditationCard({ dateDebut, dateFin }: AccreditationCardProps) {
  const getAccreditationStatus = () => {
    if (!dateFin) return { status: 'unknown', label: 'Non renseigné', color: 'grey' };

    const endDate = new Date(dateFin);
    const now = new Date();
    const monthsUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (endDate < now) return { status: 'expired', label: 'Expirée', color: 'error' };
    if (monthsUntilEnd < 12) return { status: 'ending', label: 'Expire bientôt', color: 'warning' };
    return { status: 'active', label: 'Active', color: 'success' };
  };

  const getAccreditationProgress = () => {
    if (!dateDebut || !dateFin) return 0;

    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
    const now = new Date();

    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();

    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  const accreditationStatus = getAccreditationStatus();
  const accreditationProgress = getAccreditationProgress();

  return (
    <div className="fx-card accreditation-card">
      <div className="fx-spacer fr-mb-3w">
        <h3 className="fr-text-title--blue-france fr-text--lg fr-mb-0">
          <span className="fr-icon-award-line fr-mr-1w" aria-hidden="true" />
          Accréditation
        </h3>
        <span className={`fr-badge fr-badge--${accreditationStatus.color}`}>
          {accreditationStatus.label}
        </span>
      </div>

      {dateDebut && dateFin && (
        <>
          <div className="accreditation-dates">
            <div className="accreditation-date">
              <span className="accreditation-date__label">Début</span>
              <span className="accreditation-date__value">{new Date(dateDebut).getFullYear()}</span>
            </div>
            <div className="accreditation-timeline">
              <div className="accreditation-timeline__track">
                <div
                  className="accreditation-timeline__progress"
                  style={{ width: `${accreditationProgress}%` }}
                />
              </div>
              <span className="accreditation-timeline__label">
                {Math.round(accreditationProgress)}% écoulé
              </span>
            </div>
            <div className="accreditation-date">
              <span className="accreditation-date__label">Fin</span>
              <span className="accreditation-date__value">{new Date(dateFin).getFullYear()}</span>
            </div>
          </div>

          <div className="accreditation-details">
            <p className="fr-text--sm fr-mb-0">
              <strong>Période en cours :</strong> {formatDate(dateDebut)}
              {' → '}
              {formatDate(dateFin)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
