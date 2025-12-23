import cn from 'classnames';
import { Link } from 'react-router';
import AddToWorkspace from '@/components/AddToWorkspace';
import type { Program } from '~/schemas/programs';

const getAccreditationStatus = (accreditation: Program['accreditation']) => {
  if (!accreditation.endDate) return 'unknown';
  const endDate = new Date(accreditation.endDate);
  const now = new Date();
  const monthsUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (endDate < now) return 'expired';
  if (monthsUntilEnd < 6) return 'ending';
  return 'active';
};

export default function Hero({ formation }: { formation: Program }) {
  const status = getAccreditationStatus(formation.accreditation);

  const formationName = formation.label;

  return (
    <div
      style={{ borderBottom: '1px solid var(--border-default-grey)' }}
      className="fr-pb-6w fr-mb-6w"
    >
      <nav className="fr-breadcrumb" aria-label="vous êtes ici :">
        <button
          type="button"
          className="fr-breadcrumb__button"
          aria-expanded="false"
          aria-controls="breadcrumb-1"
        >
          Voir le fil d'Ariane
        </button>
        <div className="fr-collapse" id="breadcrumb-1">
          <ol className="fr-breadcrumb__list">
            <li>
              <Link className="fr-breadcrumb__link" to="/">
                Accueil
              </Link>
            </li>
            <li>
              <Link className="fr-breadcrumb__link" to="/formations">
                Explorer les formations
              </Link>
            </li>
            <li>
              <Link to="#" className="fr-breadcrumb__link" aria-current="page">
                {formationName}
              </Link>
            </li>
          </ol>
        </div>
      </nav>

      <div className="fx-spacer fr-mb-1w">
        <ul className="fr-badges-group">
          <li className="fr-badge fr-badge--sm">{formation.diploma.type}</li>
          <li
            className={cn('fr-badge fr-badge--sm', {
              'fr-badge--success': status === 'active',
              'fr-badge--warning': status === 'ending' || status === 'unknown',
              'fr-badge--error': status === 'expired',
            })}
          >
            {formation.accreditation.endDate
              ? `Accréditée jusqu'en ${new Date(formation.accreditation.endDate).getFullYear()}`
              : "Statut d'accreditation inconnu"}
          </li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://fresq.enseignementsup.gouv.fr/diplomes/stock/${formation.collectionId}/${formation.recordId}`}
            className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm"
          >
            Voir sur fresq Ref
          </a>
          <AddToWorkspace formationIds={[formation.inf]} />
        </div>
      </div>
      <h1 className="fr-h2 fr-mb-1w fr-text-title--blue-france">{formationName}</h1>

      <div className="fr-text--lg fr-text--bold fr-mb-0">
        {formation.etablissements?.map((etab, index: number) => (
          <>
            {index > 0 && <br />}
            {etab.name}
          </>
        ))}
      </div>

      {/* TODO: Add a way to navigate the page !? */}
    </div>
  );
}
