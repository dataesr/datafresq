import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router';

const FOCUSABLE_SELECTOR =
  'button:not(:disabled):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not(:disabled):not([tabindex="-1"]), select:not(:disabled):not([tabindex="-1"]), textarea:not(:disabled):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]), [role="option"]:not([aria-disabled="true"]), [role="menuitem"]:not([aria-disabled="true"])';

export type PopoverAlign = 'start' | 'end' | 'auto';

export interface UsePopoverOptions {
  align?: PopoverAlign;
  closeOnRouteChange?: boolean;
  focusDelay?: number;
  autoFocusFirst?: boolean;
}

export interface UsePopoverReturn {
  isOpen: boolean;
  computedAlign: 'start' | 'end';
  open: () => void;
  close: () => void;
  toggle: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
  handleTriggerClick: () => void;
  handleTriggerKeyDown: (event: React.KeyboardEvent) => void;
  handleContainerKeyDown: (event: React.KeyboardEvent) => void;
  triggerId: string;
  menuId: string;
}

export function usePopover(options: UsePopoverOptions = {}): UsePopoverReturn {
  const {
    align: alignProp = 'auto',
    closeOnRouteChange = true,
    focusDelay = 160,
    autoFocusFirst = false,
  } = options;

  const id = useId();
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [computedAlign, setComputedAlign] = useState<'start' | 'end'>('start');

  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);

  const open = useCallback(() => {
    if (!triggerRef.current) return;

    if (alignProp === 'auto') {
      const rect = triggerRef.current.getBoundingClientRect();
      const buttonCenter = rect.left + rect.width / 2;
      setComputedAlign(buttonCenter > window.innerWidth / 2 ? 'end' : 'start');
    } else {
      setComputedAlign(alignProp);
    }

    setIsOpen(true);
  }, [alignProp]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const handleTriggerClick = useCallback(() => {
    toggle();
  }, [toggle]);

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        if (!isOpen) {
          event.preventDefault();
          open();
        }
      } else if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        close();
      }
    },
    [isOpen, open, close],
  );

  const handleContainerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
        triggerRef.current?.focus();
        return;
      }

      if (!isOpen || !menuRef.current) return;

      const items = menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!items.length) return;

      const itemsArray = Array.from(items);
      const currentIndex = itemsArray.indexOf(document.activeElement as HTMLElement);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex === -1) {
            itemsArray[0]?.focus();
          } else {
            itemsArray[(currentIndex + 1) % itemsArray.length]?.focus();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex === -1) {
            itemsArray[itemsArray.length - 1]?.focus();
          } else {
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
          close();
          break;
      }
    },
    [isOpen, close],
  );

  // Close on route change
  useEffect(() => {
    if (!closeOnRouteChange) return;
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      close();
    }
  }, [pathname, close, closeOnRouteChange]);

  // Focus management when menu opens
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const timeoutId = setTimeout(() => {
      if (!menuRef.current) return;

      // Always focus [data-autofocus] element (like search input) if present
      const autoFocusEl = menuRef.current.querySelector<HTMLElement>('[data-autofocus]');
      if (autoFocusEl) {
        autoFocusEl.focus();
        return;
      }

      // Only auto-focus first item if explicitly enabled
      if (autoFocusFirst) {
        const firstFocusable = menuRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        firstFocusable?.focus();
      }
    }, focusDelay);

    return () => clearTimeout(timeoutId);
  }, [isOpen, focusDelay, autoFocusFirst]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isOpen, close]);

  return {
    isOpen,
    computedAlign,
    open,
    close,
    toggle,
    containerRef,
    triggerRef,
    menuRef,
    handleTriggerClick,
    handleTriggerKeyDown,
    handleContainerKeyDown,
    triggerId,
    menuId,
  };
}
