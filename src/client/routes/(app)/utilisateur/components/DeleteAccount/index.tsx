export default function DeleteAccount() {
  return (
    <div className="settings-card">
      <div className="settings-card__main">
        <div className="settings-card__header">
          <p className="fr-h6 fr-mb-0">Supprimer mon compte</p>
          <p className="fr-text--sm fr-mb-0">
            Cette action est irréversible. Toutes vos données seront supprimées définitivement.
          </p>
        </div>
        <div className="settings-card__content">
          <div className="fr-callout fr-callout--brown-caramel fr-icon-warning-line">
            <p className="fr-callout__text">
              La suppression de compte sera bientôt disponible. Pour supprimer votre compte
              actuellement, veuillez contacter l'équipe support.
            </p>
          </div>
        </div>
      </div>
      <div className="settings-card__footer">
        <button
          type="button"
          className="fr-btn fr-btn--secondary fr-btn--error fr-btn--sm"
          disabled
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
