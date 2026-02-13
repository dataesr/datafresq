import cn from 'classnames';
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import SearchModal, { useSearchModal } from '@/components/SearchModal';
import { searchGuide } from '../guide-content.generated';

function isSection(href: string): boolean {
  const segments = href.replace(/^\/guide\/?/, '').split('/').filter(Boolean);
  return segments.length <= 1;
}

function useGlobalShortcut(key: string, callback: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === key) {
        e.preventDefault();
        callback();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback]);
}

export default function GuideSearchModal() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => searchGuide(deferredQuery), [deferredQuery]);
  const showResults = deferredQuery.trim().length > 0;

  const handleSelect = useCallback(
    (index: number) => {
      const entry = results[index];
      if (entry) navigate(entry.href);
    },
    [results, navigate],
  );

  const search = useSearchModal({
    itemCount: results.length,
    onSelect: handleSelect,
    onClose: () => setQuery(''),
  });

  useEffect(() => {
    search.resetFocus();
  }, [deferredQuery, search.resetFocus]);

  useGlobalShortcut('k', search.open);

  const focusedResult =
    search.focusedIndex >= 0 && results[search.focusedIndex]
      ? `guide-search-result-${search.focusedIndex}`
      : undefined;

  return (
    <>
      <div className="fr-search-bar" role="search">
        <label className="fr-label" htmlFor="guide-search-launcher">
          Rechercher dans le guide
        </label>
        <input
          className="fr-input"
          id="guide-search-launcher"
          type="search"
          placeholder="Rechercher… (Ctrl+K)"
          readOnly
          onFocus={(e) => { e.target.blur(); search.open(); }}
          onClick={search.open}
        />
        <button
          className="fr-btn"
          type="button"
          title="Rechercher dans le guide"
          onClick={search.open}
        >
          Rechercher
        </button>
      </div>

      <SearchModal
        modalProps={search.modalProps}
        query={query}
        onQueryChange={setQuery}
        inputRef={search.inputRef}
        onInputKeyDown={search.handleInputKeyDown}
        placeholder="Ex : opérateurs, espace actif, salaires…"
        listboxId="guide-search-listbox"
        activedescendant={focusedResult}
        footer={
          <>
            <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
              <SearchModal.Kbd>↑↓</SearchModal.Kbd> naviguer
              {' · '}
              <SearchModal.Kbd>↩</SearchModal.Kbd> ouvrir
              {' · '}
              <SearchModal.Kbd>esc</SearchModal.Kbd> fermer
            </p>
            <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
              <SearchModal.Kbd>Ctrl</SearchModal.Kbd>
              {' + '}
              <SearchModal.Kbd>K</SearchModal.Kbd>
            </p>
          </>
        }
      >
        {showResults && results.length === 0 && (
          <SearchModal.Empty>
            Aucun résultat pour « {deferredQuery} »
          </SearchModal.Empty>
        )}

        {results.map((entry, index) => {
          const section = isSection(entry.href);
          return (
            <SearchModal.Item
              key={entry.href}
              id={`guide-search-result-${index}`}
              focused={search.focusedIndex === index}
              ref={(el) => search.setItemRef(index, el)}
              onClick={() => search.select(index)}
            >
              <div className="fx-flex fx-items-start fx-gap-2w">
                <span
                  className={cn('fr-icon--sm', {
                    'fr-icon-folder-2-line': section,
                    'fr-icon-hashtag': !section,
                  })}
                  aria-hidden="true"
                />
                <div className="fx-flex fx-flex-col fx-items-start fx-gap-1w">
                  <p className="fx-clamp-1 fr-text--sm fr-mb-0">
                    {section ? (
                      entry.title
                    ) : (
                      <>
                        <span className="fr-text-mention--grey">{entry.section}</span>
                        <span className="fr-text-mention--grey"> → </span>
                        {entry.title}
                      </>
                    )}
                  </p>
                  <p className="fx-clamp-1 fr-text-mention--grey fr-text--xs fr-mb-0">
                    {entry.description}
                  </p>
                </div>
              </div>
            </SearchModal.Item>
          );
        })}
      </SearchModal>
    </>
  );
}
