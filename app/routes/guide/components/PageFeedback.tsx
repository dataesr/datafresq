export default function PageFeedback() {
  return (
    <div>
      <p className="fr-text--lg fr-text--bold">Cette page vous a été utile ?</p>
      <div className="fx-flex fx-gap-2w">
        <button className="fr-btn fr-btn--sm fr-btn--tertiary fr-btn--icon-left fr-icon-thumb-up-line fr-icon--sm fr-icon--left">
          Oui
        </button>
        <button className="fr-btn fr-btn--sm fr-btn--tertiary fr-btn--icon-left fr-icon-thumb-down-line fr-icon--sm fr-icon--left">
          Non
        </button>
      </div>
    </div>
  );
}
