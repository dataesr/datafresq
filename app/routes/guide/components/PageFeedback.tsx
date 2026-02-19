import cn from 'classnames';
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { useSubmitGuideReview } from '@/api/guide';

type ThumbValue = 1 | -1 | null;

export default function PageFeedback() {
  const { pathname } = useLocation();
  const pageId = pathname.replace(/\/$/, '') || '/guide';

  const [thumb, setThumb] = useState<ThumbValue>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending } = useSubmitGuideReview({
    onSuccess: () => setSubmitted(true),
  });

  const handleThumbClick = useCallback((value: 1 | -1) => {
    setThumb((prev) => (prev === value ? null : value));
    setSubmitted(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!thumb) return;
    mutate({
      pageId,
      thumb,
      comment: comment.trim() || undefined,
    });
  }, [thumb, comment, pageId, mutate]);

  const handleNewReview = useCallback(() => {
    setThumb(null);
    setComment('');
    setSubmitted(false);
  }, []);

  if (submitted) {
    return (
      <div>
        <p className="fr-text--lg fr-text--bold fr-mb-2w">Merci pour votre retour !</p>
        <button
          type="button"
          className="fr-btn fr-btn--sm fr-btn--tertiary"
          onClick={handleNewReview}
        >
          Laisser un autre avis
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="fr-text--lg fr-text--bold">Cette page vous a été utile ?</p>
      <div className="fx-flex fx-gap-2w">
        <button
          type="button"
          className={cn(
            'fr-btn fr-btn--sm fr-btn--icon-left fr-icon--sm',
            thumb === 1 ? 'fr-icon-thumb-up-fill' : 'fr-icon-thumb-up-line',
            thumb === 1 ? 'fr-btn--secondary' : 'fr-btn--tertiary',
          )}
          aria-pressed={thumb === 1}
          onClick={() => handleThumbClick(1)}
        >
          Oui
        </button>
        <button
          type="button"
          className={cn(
            'fr-btn fr-btn--sm fr-btn--icon-left fr-icon--sm',
            thumb === -1 ? 'fr-icon-thumb-down-fill' : 'fr-icon-thumb-down-line',
            thumb === -1 ? 'fr-btn--secondary' : 'fr-btn--tertiary',
          )}
          aria-pressed={thumb === -1}
          onClick={() => handleThumbClick(-1)}
        >
          Non
        </button>
      </div>
      {thumb !== null && (
        <>
          <div className="fr-input-group fr-mt-2w">
            <label className="fr-label" htmlFor="guide-feedback-comment">
              Souhaitez-vous ajouter un commentaire ?
              <span className="fr-hint-text">Facultatif — 2000 caractères max.</span>
            </label>
            <textarea
              className="fr-input"
              id="guide-feedback-comment"
              rows={3}
              maxLength={2000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isPending}
            />
          </div>
          <button
            type="button"
            className="fr-btn fr-btn--sm"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Envoi…' : 'Envoyer'}
          </button>
        </>
      )}
    </div>
  );
}
