interface NoDataMessageProps {
  icon?: string;
  message: string;
}

export function NoDataMessage({ icon = 'fr-icon-information-line', message }: NoDataMessageProps) {
  return (
    <div className="fr-p-2w fx-card--shadow">
      <p className="fr-mb-0 fx-flex fx-items-baseline">
        <span className={`${icon} fr-mr-1w`} />
        <span>{message}</span>
      </p>
    </div>
  );
}
