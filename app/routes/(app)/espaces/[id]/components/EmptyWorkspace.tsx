import { Link } from 'react-router';

export function EmptyWorkspace({
  canEdit,
  description,
}: {
  canEdit: boolean;
  description: string;
}) {
  return (
    <div className="fr-my-12w">
      <p className="fr-text-mention--grey">
        <i>{description}</i>
        <br />
        {canEdit && <i>Rendez-vous dans la section explorer pour ajouter des formations.</i>}
      </p>
      {canEdit && (
        <Link to="/formations" className="fr-btn fr-btn--secondary">
          Explorer les formations
        </Link>
      )}
    </div>
  );
}
