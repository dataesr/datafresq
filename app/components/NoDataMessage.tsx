interface NoDataMessageProps {
  icon?: string;
  message: string;
}

export function NoDataMessage({ icon = 'fr-icon-information-line', message }: NoDataMessageProps) {
  return (
    <div className="fr-notice" style={{ filter: 'drop-shadow(var(--raised-shadow))' }}>
      <div className="fr-container">
        <div className="fr-notice__body">
          <p style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className={`${icon} fr-mr-1w`} />
            <span>{message}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
