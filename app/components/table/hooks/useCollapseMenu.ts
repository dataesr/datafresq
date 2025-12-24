import { useCallback, useEffect, useId, useRef } from 'react';

interface UseCollapseMenuOptions {
  /**
   * CSS selector to find the first focusable item when menu opens
   * @default '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], input, button'
   */
  firstItemSelector?: string;
  /**
   * Callback when menu is opened
   */
  onOpen?: () => void;
  /**
   * Callback when menu is closed
   */
  onClose?: () => void;
}

interface UseCollapseMenuReturn {
  /**
   * Unique ID for the menu (for aria-controls)
   */
  menuId: string;
  /**
   * Ref to attach to the menu container (fr-collapse fr-menu)
   */
  menuRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Ref to attach to the trigger button
   */
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  /**
   * Whether the menu is currently expanded
   */
  isExpanded: boolean;
  /**
   * Close the menu programmatically
   */
  closeMenu: () => void;
  /**
   * Open the menu programmatically
   */
  openMenu: () => void;
  /**
   * Toggle the menu programmatically
   */
  toggleMenu: () => void;
}

/**
 * Hook to manage DSFR's fr-collapse menu pattern
 * Handles:
 * - Unique ID generation for aria-controls
 * - Refs for button and menu
 * - Auto-focus first item when menu opens
 * - Programmatic open/close/toggle
 *
 * @example
 * const { menuId, menuRef, buttonRef, closeMenu } = useCollapseMenu({
 *   firstItemSelector: 'input[type="checkbox"]',
 * });
 *
 * return (
 *   <div className="fr-nav">
 *     <button ref={buttonRef} aria-controls={menuId} aria-expanded="false">
 *       Open Menu
 *     </button>
 *     <div ref={menuRef} className="fr-collapse fr-menu" id={menuId}>
 *       ...
 *     </div>
 *   </div>
 * );
 */
export function useCollapseMenu({
  firstItemSelector = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], input, button',
  onOpen,
  onClose,
}: UseCollapseMenuOptions = {}): UseCollapseMenuReturn {
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isExpandedRef = useRef(false);

  // Watch for class changes to detect open/close and focus first item
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const isExpanded = menu.classList.contains('fr-collapse--expanded');

          // State changed to expanded
          if (isExpanded && !isExpandedRef.current) {
            isExpandedRef.current = true;
            onOpen?.();

            // Focus first focusable item
            const firstItem = menu.querySelector<HTMLElement>(firstItemSelector);
            if (firstItem) {
              // Small delay to ensure the menu is fully visible
              requestAnimationFrame(() => {
                firstItem.focus();
              });
            }
          }

          // State changed to collapsed
          if (!isExpanded && isExpandedRef.current) {
            isExpandedRef.current = false;
            onClose?.();
          }
        }
      }
    });

    observer.observe(menu, { attributes: true });

    return () => observer.disconnect();
  }, [firstItemSelector, onOpen, onClose]);

  const closeMenu = useCallback(() => {
    const button = buttonRef.current;
    const menu = menuRef.current;

    if (button && menu?.classList.contains('fr-collapse--expanded')) {
      button.setAttribute('aria-expanded', 'false');
      menu.classList.remove('fr-collapse--expanded');
      menu.classList.add('fr-collapse');
    }
  }, []);

  const openMenu = useCallback(() => {
    const button = buttonRef.current;
    const menu = menuRef.current;

    if (button && menu && !menu.classList.contains('fr-collapse--expanded')) {
      button.setAttribute('aria-expanded', 'true');
      menu.classList.add('fr-collapse--expanded');
      menu.classList.remove('fr-collapse');
    }
  }, []);

  const toggleMenu = useCallback(() => {
    const menu = menuRef.current;
    if (menu?.classList.contains('fr-collapse--expanded')) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [closeMenu, openMenu]);

  return {
    menuId,
    menuRef,
    buttonRef,
    get isExpanded() {
      return isExpandedRef.current;
    },
    closeMenu,
    openMenu,
    toggleMenu,
  };
}
