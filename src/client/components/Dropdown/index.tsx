import cn from 'classnames';
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import './styles.css';

/**
 * Selector for all focusable elements within the dropdown
 */
const FOCUSABLE_SELECTOR =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

type DropdownSize = 'sm' | 'md' | 'lg';

interface DropdownProps {
  /**
   * Button label/content. If not provided, the button will be icon-only.
   */
  label?: ReactNode;
  /**
   * DSFR icon class name (without the "fr-icon-" prefix)
   * Icon is always positioned on the left.
   * @example "settings-5-line"
   */
  icon?: string;
  /**
   * Button size - matches DSFR button sizes
   * @default "md"
   */
  size?: DropdownSize;
  /**
   * Whether to show the outline (tertiary vs tertiary-no-outline)
   * @default true (tertiary with outline)
   */
  outline?: boolean;
  /**
   * Hide the dropdown arrow. By default, arrow is shown when there's a label,
   * and hidden when icon-only.
   */
  hideArrow?: boolean;
  /**
   * Dropdown content - keyboard navigation works automatically
   * for any focusable elements (button, a, input, etc.)
   */
  children: ReactNode;
  /**
   * Additional class names for the container
   */
  className?: string;
  /**
   * Button title/tooltip
   */
  title?: string;
  /**
   * Accessible label for the trigger button.
   * Required for icon-only buttons (no label).
   * Falls back to title if not provided.
   */
  'aria-label'?: string;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Align dropdown menu to end (right) instead of start (left)
   * When set to "auto" (default), alignment is calculated based on viewport position
   */
  align?: 'start' | 'end' | 'auto';
}

/**
 * Minimal dropdown component with custom styling
 *
 * Features:
 * - Custom fx-dropdown classes (no dependency on fr-nav/fr-translate)
 * - Three sizes: sm, md, lg (matching DSFR buttons)
 * - Tertiary button style only (with or without outline)
 * - Icon always on the left, arrow on the right (when label is present)
 * - Keyboard navigation (Arrow Up/Down, Home, End, Escape)
 * - Auto-focus first focusable element on open (or element with data-autofocus attribute)
 * - Smart left/right positioning based on viewport
 * - Closes on route navigation
 *
 * @example
 * <Dropdown label="Options" icon="settings-5-line">
 *   <button className="fx-dropdown__item">Edit</button>
 *   <button className="fx-dropdown__item">Delete</button>
 * </Dropdown>
 *
 * @example
 * // Icon-only trigger (no arrow by default)
 * <Dropdown icon="more-2-fill" title="More options">
 *   <button className="fx-dropdown__item">Option 1</button>
 * </Dropdown>
 *
 * @example
 * // With custom autofocus on search input (use data-autofocus, not autoFocus)
 * <Dropdown label="Search" icon="search-line">
 *   <input type="search" data-autofocus placeholder="Search..." />
 *   <button className="fx-dropdown__item">Option 1</button>
 * </Dropdown>
 */
export function Dropdown({
  label,
  icon,
  size = 'md',
  outline = true,
  hideArrow,
  children,
  className,
  title,
  'aria-label': ariaLabel,
  disabled = false,
  align: alignProp = 'auto',
}: DropdownProps) {
  const id = useId();
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [align, setAlign] = useState<'start' | 'end'>('start');
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);

  // Determine if this is an icon-only button (no label)
  const isIconOnly = !label && !!icon;

  // Accessible label - required for icon-only, falls back to title
  const accessibleLabel = ariaLabel ?? (isIconOnly ? title : undefined);

  // Determine if arrow should be shown
  // By default: show arrow if there's a label, hide if icon-only
  // User can override with hideArrow prop
  const showArrow = hideArrow !== undefined ? !hideArrow : !isIconOnly;

  /**
   * Open the menu and calculate alignment
   */
  const openMenu = useCallback(() => {
    if (!buttonRef.current) return;

    // Calculate alignment based on prop or button position
    if (alignProp === 'auto') {
      const rect = buttonRef.current.getBoundingClientRect();
      const buttonCenter = rect.left + rect.width / 2;
      setAlign(buttonCenter > window.innerWidth / 2 ? 'end' : 'start');
    } else {
      setAlign(alignProp);
    }

    setIsOpen(true);
  }, [alignProp]);

  /**
   * Close the menu
   */
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Toggle menu on button click
   */
  const handleTriggerClick = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  /**
   * Close menu on route navigation (useful for Header dropdowns)
   */
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      closeMenu();
    }
  }, [pathname, closeMenu]);

  /**
   * Focus management when menu opens
   */
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    // Delay must be >= CSS visibility transition time (150ms) for focus to work
    const timeoutId = setTimeout(() => {
      if (!menuRef.current) return;

      // Look for element with data-autofocus first, then fall back to first focusable
      const autoFocusEl = menuRef.current.querySelector<HTMLElement>('[data-autofocus]');
      const firstFocusable = menuRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      const targetEl = autoFocusEl || firstFocusable;

      if (targetEl) {
        targetEl.focus();
      }
    }, 160);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        closeMenu();
      }
    };

    // Use capture phase to catch clicks before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isOpen, closeMenu]);

  /**
   * Keyboard navigation - attached to the container to catch all key events
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Handle Escape from anywhere in the dropdown
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        buttonRef.current?.focus();
        return;
      }

      // Only handle arrow keys when menu is open
      if (!isOpen || !menuRef.current) return;

      const items = menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!items.length) return;

      const itemsArray = Array.from(items);
      const currentIndex = itemsArray.indexOf(document.activeElement as HTMLElement);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex === -1) {
            // If no item is focused, focus the first one
            itemsArray[0]?.focus();
          } else {
            // Move to next item (wrap around)
            itemsArray[(currentIndex + 1) % itemsArray.length]?.focus();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex === -1) {
            // If no item is focused, focus the last one
            itemsArray[itemsArray.length - 1]?.focus();
          } else {
            // Move to previous item (wrap around)
            itemsArray[(currentIndex - 1 + itemsArray.length) % itemsArray.length]?.focus();
          }
          break;
        case 'Home':
          event.preventDefault();
          itemsArray[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          itemsArray[itemsArray.length - 1]?.focus();
          break;
        case 'Tab':
          // Close menu on Tab to allow natural focus flow
          closeMenu();
          break;
      }
    },
    [isOpen, closeMenu],
  );

  /**
   * Handle trigger button keyboard events
   */
  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        if (!isOpen) {
          event.preventDefault();
          openMenu();
        }
      } else if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        closeMenu();
      }
    },
    [isOpen, openMenu, closeMenu],
  );

  // Build trigger button classes
  const sizeClass = size === 'sm' ? 'fr-btn--sm' : size === 'lg' ? 'fr-btn--lg' : null;
  const variantClass = outline ? 'fr-btn--tertiary' : 'fr-btn--tertiary-no-outline';
  const iconClass = icon ? `fr-icon-${icon}` : null;
  const iconPositionClass = icon && label ? 'fr-btn--icon-left' : null;
  const arrowClass = showArrow ? 'fx-dropdown__trigger--has-arrow' : null;

  const triggerClasses = cn(
    'fr-btn',
    'fx-dropdown__trigger',
    sizeClass,
    variantClass,
    iconClass,
    iconPositionClass,
    arrowClass,
  );

  const containerClasses = cn('fx-dropdown', `fx-dropdown--${size}`, className);

  const menuClasses = cn(
    'fx-dropdown__menu',
    isOpen && 'fx-dropdown__menu--expanded',
    align === 'end' && 'fx-dropdown__menu--align-end',
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: container handles keyboard navigation
    <div ref={containerRef} className={containerClasses} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        id={triggerId}
        type="button"
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={accessibleLabel}
        title={title ?? (typeof label === 'string' ? label : undefined)}
        className={triggerClasses}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {label}
      </button>
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-labelledby={triggerId}
        aria-hidden={!isOpen}
        className={menuClasses}
      >
        <div className="fx-dropdown__content">{children}</div>
      </div>
    </div>
  );
}

export default Dropdown;
