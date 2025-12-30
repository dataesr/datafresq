import { useAuth } from '@/api/auth';
import { Avatar } from '@/components/Avatar';
import './styles.css';

export default function ManageAvatar() {
  const { user } = useAuth();

  if (!user) return null;

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <div className="settings-card">
      <div className="settings-card__main">
        <div className="settings-card__header">
          <p className="fr-h6 fr-mb-0">Avatar</p>
          <p className="fr-text--sm fr-mb-0">Choisissez votre image de profil</p>
        </div>
        <div className="settings-card__content">
          <div className="avatar-wrapper">
            <Avatar name={displayName} size={192} className="avatar-image" />
            <p className="fr-text--sm fr-text--mention-grey fr-mt-2w">
              La personnalisation de l'avatar sera bientôt disponible.
            </p>
          </div>
        </div>
      </div>
      <div className="settings-card__footer">
        <button type="button" className="fr-btn fr-btn--secondary fr-btn--sm" disabled>
          Modifier mon avatar
        </button>
      </div>
    </div>
  );
}
