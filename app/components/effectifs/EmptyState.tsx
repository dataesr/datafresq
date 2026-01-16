interface EmptyStateProps {
  message?: string;
}

export function EmptyState({
  message = "Aucune donnée d'effectifs étudiants disponible.",
}: EmptyStateProps) {
  return (
    <div className="fr-py-2w fr-px-3v fr-background-alt--grey fx-radius--sm">
      <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">{message}</p>
    </div>
  );
}
