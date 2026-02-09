import { useRevokeAllSessions, useRevokeSession, useSessions } from '@/api/users';
import { toast } from '@/components/ui/Toast';

export default function ManageSessions() {
  const { data: sessions, isLoading, error } = useSessions();
  const { mutateAsync: revokeSession, isPending: isRevokingSession } = useRevokeSession();
  const { mutateAsync: revokeAllSessions, isPending: isRevokingAll } = useRevokeAllSessions();

  const sessionCount = sessions.length;

  const handleRevokeSession = (sessionId: string) => {
    toast.promise(revokeSession(sessionId), {
      loading: { title: 'Suppression de la session...' },
      success: { title: 'La session a été supprimée avec succès' },
      error: { title: 'Erreur lors de la suppression de la session' },
    });
  };

  const handleRevokeAllSessions = () => {
    toast.promise(revokeAllSessions(), {
      loading: { title: 'Révocation des sessions...' },
      success: { title: 'Toutes les sessions ont été supprimées avec succès' },
      error: { title: 'Erreur lors de la suppression des sessions' },
    });
  };

  if (error) {
    return (
      <div className="settings-card">
        <div className="settings-card__main">
          <p className="fr-text--error">Erreur lors de la récupération des sessions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-card">
      <div className="settings-card__main settings-card__main--vertical">
        <div className="settings-card__header">
          <p className="fr-h6 fr-mb-0">Sessions</p>
          <p className="fr-text--sm fr-mb-0">Toutes les sessions actives pour votre compte</p>
        </div>
        <div className="settings-card__content">
          <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-mb-1w">
            <div className="fr-col-12">
              {isLoading ? (
                <p className="fr-text--sm">Chargement des sessions...</p>
              ) : (
                <>
                  <p className="fr-text--bold fr-text--lg fr-mb-1w">
                    {sessionCount} session{sessionCount > 1 ? 's' : ''}
                  </p>
                  <ul className="xfr-simple-card-list">
                    {sessions.map((session, index) => (
                      <li key={session.id} className="fx-flex fx-items-center fx-gap-4w">
                        <div style={{ flexGrow: 1 }}>
                          {index === 0 && (
                            <p className="fr-badge fr-badge--sm fr-badge--success fr-mb-0">
                              Session active
                            </p>
                          )}
                          <p className="fr-text--bold fr-text--xs fr-mb-0">{session.userAgent}</p>
                          <p className="fr-text--xs fr-mb-0 fr-text--mention-grey">
                            {session.ipAddress || 'IP inconnue'} •{' '}
                            {new Date(session.lastRefreshedAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {index !== 0 && (
                          <button
                            type="button"
                            className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-delete-bin-line fr-btn--icon-left fr-btn--error"
                            onClick={() => handleRevokeSession(session.id)}
                            title="Révoquer cette session"
                            disabled={isRevokingSession}
                          >
                            Révoquer
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="settings-card__footer">
        <button
          type="button"
          className="fr-btn fr-btn--secondary fr-btn--sm"
          disabled={sessionCount < 2 || isRevokingAll}
          onClick={handleRevokeAllSessions}
        >
          {isRevokingAll ? 'Révocation...' : 'Tout révoquer'}
        </button>
      </div>
    </div>
  );
}
