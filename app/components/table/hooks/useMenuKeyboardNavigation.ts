import { useCallback } from 'react';

interface UseMenuKeyboardNavigationOptions {
  /**
   * CSS selector to find focusable items within the menu
   * @default '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], input, button'
   */
  itemSelector?: string;
  /**
   * Callback when Escape is pressed
   */
  onClose?: () => void;
  /**
   * Ref to the menu container element
   */
  menuRef: React.RefObject<HTMLElement | null>;
}

/**
 * Hook to handle keyboard navigation within a menu
 * Supports: Arrow Up/Down, Home, End, Escape
 *
 * @example
 * const menuRef = useRef<HTMLUListElement>(null);
 * const handleKeyDown = useMenuKeyboardNavigation({
 *   menuRef,
 *   onClose: () => buttonRef.current?.click(),
 * });
 *
 * return <ul ref={menuRef} onKeyDown={handleKeyDown}>...</ul>
 */
export function useMenuKeyboardNavigation({
  itemSelector = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], input, button',
  onClose,
  menuRef,
}: UseMenuKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const items = menuRef.current?.querySelectorAll<HTMLElement>(itemSelector);
      if (!items?.length) return;

      const currentIndex = Array.from(items).findIndex((item) => item === document.activeElement);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          items[(currentIndex + 1) % items.length]?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          items[(currentIndex - 1 + items.length) % items.length]?.focus();
          break;
        case 'Home':
          event.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          items[items.length - 1]?.focus();
          break;
        case 'Escape':
          event.preventDefault();
          onClose?.();
          break;
      }
    },
    [itemSelector, onClose, menuRef],
  );

  return handleKeyDown;
}
