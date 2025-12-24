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
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: '1rem',
      }}
    >
      <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
        <strong>
          {startItem} - {endItem}
        </strong>{' '}
        sur <strong>{totalCount.toLocaleString('fr-FR')}</strong> résultats
      </p>
      <nav aria-label="Pagination">
        <ul style={{ display: 'flex', gap: '.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
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
