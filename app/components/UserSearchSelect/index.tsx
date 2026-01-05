import { useId, useMemo, useRef, useState } from 'react';
import { type UserSearchResult, useUserSearch } from '@/api/users';
import './styles.css';
import { Avatar } from '../Avatar';

interface UserSearchSelectProps {
  onSelect: (user: UserSearchResult) => void;
  placeholder?: string;
  excludeUserIds?: string[];
  label?: string;
  hint?: string;
  required?: boolean;
}

function getUserDisplayName(user: UserSearchResult): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.email;
}

export default function UserSearchSelect({
  onSelect,
  placeholder = 'Rechercher un utilisateur...',
  excludeUserIds = [],
  label,
  hint,
  required,
}: UserSearchSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const { data: users = [], isLoading, isFetching } = useUserSearch(query);

  // Filter out excluded users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => !excludeUserIds.includes(user.id));
  }, [users, excludeUserIds]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
    setHighlightedIndex(0);
  };

  const handleSelect = (user: UserSearchResult) => {
    // Close dropdown and clear input first
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(0);
    // Then notify parent
    onSelect(user);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredUsers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredUsers.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredUsers.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredUsers[highlightedIndex]) {
          handleSelect(filteredUsers[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only close if focus is leaving the component entirely
    const relatedTarget = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(relatedTarget)) {
      // Small delay to allow click events to fire first
      setTimeout(() => {
        setIsOpen(false);
      }, 100);
    }
  };

  return (
    <search className="fr-fieldset" onBlur={handleBlur}>
      <div className="fr-input-group fr-mb-0" style={{ width: '100%' }}>
        {label && (
          <label className="fr-label" htmlFor={inputId}>
            {label}
            {required && <span className="fr-hint-text"> *</span>}
            {hint && <span className="fr-hint-text">{hint}</span>}
          </label>
        )}
        <div
          className={`fr-input-wrap ${isFetching ? 'fr-icon-refresh-line' : 'fr-icon-search-line'}`}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className="fr-input fr-mt-1w"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              isOpen && filteredUsers[highlightedIndex]
                ? `${inputId}-option-${highlightedIndex}`
                : undefined
            }
          />
        </div>
      </div>

      {isOpen && (
        <div ref={listRef} className="user-search-select__dropdown">
          {filteredUsers.length === 0 ? (
            <div className="user-search-select__no-results">
              {isLoading ? 'Recherche en cours...' : 'Aucun utilisateur trouvé'}
            </div>
          ) : (
            filteredUsers.map((user, index) => (
              <button
                type="button"
                key={user.id}
                id={`${inputId}-option-${index}`}
                className={`user-search-select__option ${
                  index === highlightedIndex ? 'user-search-select__option--highlighted' : ''
                }`}
                onMouseDown={(e) => {
                  // Prevent blur from firing before click
                  e.preventDefault();
                  handleSelect(user);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <Avatar size={32} name={getUserDisplayName(user)} />
                <div className="user-search-select__user-info">
                  <span className="user-search-select__name">{getUserDisplayName(user)}</span>
                  {(user.firstName || user.lastName) && (
                    <span className="user-search-select__email">{user.email}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </search>
  );
}

export { getUserDisplayName };
export type { UserSearchResult };
