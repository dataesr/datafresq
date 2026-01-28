import { memo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="fx-flex fx-flex-row fx-justify-between fx-items-baseline fx-gap-4w">
      <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
        <strong>
          {startItem} - {endItem}
        </strong>{' '}
        sur <strong>{totalCount.toLocaleString('fr-FR')}</strong> résultats
      </p>
      <nav aria-label="Pagination">
        <ul className="fx-flex fx-gap-2w fx-reset-list">
          <li>
            <button
              type="button"
              className="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-arrow-left-s-first-line"
              disabled={currentPage === 1}
              onClick={() => onPageChange(1)}
              aria-label="Première page"
            />
          </li>
          <li>
            <button
              type="button"
              className="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-arrow-left-s-line"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Page précédente"
            />
          </li>
          <li>
            <button
              type="button"
              className="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-arrow-right-s-line"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Page suivante"
            />
          </li>
          <li>
            <button
              type="button"
              className="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-arrow-right-s-last-line"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label="Dernière page"
            />
          </li>
        </ul>
      </nav>
    </div>
  );
});
