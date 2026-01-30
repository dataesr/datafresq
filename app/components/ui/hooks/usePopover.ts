import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router';

const FOCUSABLE_SELECTOR =
  'button:not(:disabled):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not(:disabled):not([tabindex="-1"]), select:not(:disabled):not([tabindex="-1"]), textarea:not(:disabled):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]), [role="option"]:not([aria-disabled="true"]), [role="menuitem"]:not([aria-disabled="true"])';

export type PopoverAlign = 'start' | 'end' | 'auto';
export type PopoverPlacement = 'top' | 'bottom';

const VIEWPORT_PADDING = 8;

export interface PopoverPosition {
  top: number;
  left: number;
  minWidth: number;
}

export interface UsePopoverOptions {
  align?: PopoverAlign;
  placement?: PopoverPlacement | 'auto';
  closeOnRouteChange?: boolean;
  focusDelay?: number;
  autoFocusFirst?: boolean;
  portal?: boolean;
}

export interface UsePopoverReturn {
  isOpen: boolean;
  computedAlign: 'start' | 'end';
  computedPlacement: PopoverPlacement;
  maxHeight: number | null;
  position: PopoverPosition | null;
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
    placement: placementProp = 'auto',
    closeOnRouteChange = true,
    focusDelay = 160,
    autoFocusFirst = false,
    portal = false,
  } = options;

  const id = useId();
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [computedAlign, setComputedAlign] = useState<'start' | 'end'>('start');
  const [computedPlacement, setComputedPlacement] = useState<PopoverPlacement>('bottom');
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuEl = menuRef.current;

    // Temporarily make the menu visible to measure its natural height
    const originalStyles = {
      visibility: menuEl.style.visibility,
      maxHeight: menuEl.style.maxHeight,
      position: menuEl.style.position,
    };

    menuEl.style.visibility = 'hidden';
    menuEl.style.maxHeight = 'none';
    menuEl.style.position = 'absolute';

    const contentHeight = menuEl.scrollHeight;

    // Restore original styles
    menuEl.style.visibility = originalStyles.visibility;
    menuEl.style.maxHeight = originalStyles.maxHeight;
    menuEl.style.position = originalStyles.position;

    // Calculate available space
    const spaceBelow = window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING;
    const spaceAbove = triggerRect.top - VIEWPORT_PADDING;

    // Calculate horizontal alignment
    let align: 'start' | 'end';
    if (alignProp === 'auto') {
      const buttonCenter = triggerRect.left + triggerRect.width / 2;
      align = buttonCenter > window.innerWidth / 2 ? 'end' : 'start';
    } else {
      align = alignProp;
    }
    setComputedAlign(align);

    // Determine placement (mimicking native browser select behavior)
    let placement: PopoverPlacement;
    let availableHeight: number;

    if (placementProp !== 'auto') {
      // Manual placement specified
      placement = placementProp;
      availableHeight = placement === 'bottom' ? spaceBelow : spaceAbove;
    } else {
      // Auto placement: prefer bottom, flip only if necessary
      const fitsBelow = contentHeight <= spaceBelow;
      const fitsAbove = contentHeight <= spaceAbove;

      if (fitsBelow) {
        // Content fits below without scrolling - use bottom
        placement = 'bottom';
        availableHeight = spaceBelow;
      } else if (fitsAbove && !fitsBelow) {
        // Content fits above but not below - use top
        placement = 'top';
        availableHeight = spaceAbove;
      } else {
        // Content doesn't fit either side without scrolling
        // Choose the side with more space
        if (spaceBelow >= spaceAbove) {
          placement = 'bottom';
          availableHeight = spaceBelow;
        } else {
          placement = 'top';
          availableHeight = spaceAbove;
        }
      }
    }

    setComputedPlacement(placement);
    setMaxHeight(availableHeight);

    // Calculate absolute position for portal rendering
    if (portal) {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      let top: number;
      if (placement === 'bottom') {
        top = triggerRect.bottom + scrollY;
      } else {
        // For top placement, we'll set the bottom of the popover at the top of the trigger
        // The actual positioning will be handled by CSS transform or by measuring the popover
        top = triggerRect.top + scrollY;
      }

      let left: number;
      if (align === 'start') {
        left = triggerRect.left + scrollX;
      } else {
        left = triggerRect.right + scrollX;
      }

      setPosition({
        top,
        left,
        minWidth: triggerRect.width,
      });
    }
  }, [alignProp, placementProp, portal]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

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

  // Calculate position after menu is rendered (when isOpen becomes true)
  useEffect(() => {
    if (!isOpen) return;

    // Use requestAnimationFrame to ensure the DOM has updated
    const rafId = requestAnimationFrame(() => {
      calculatePosition();
    });

    return () => cancelAnimationFrame(rafId);
  }, [isOpen, calculatePosition]);

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

      const autoFocusEl = menuRef.current.querySelector<HTMLElement>('[data-autofocus]');
      if (autoFocusEl) {
        autoFocusEl.focus();
        return;
      }

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

      // Check both container and menu (for portal case where menu is outside container)
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideMenu = menuRef.current?.contains(target);

      if (!isInsideContainer && !isInsideMenu) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isOpen, close]);

  // Prevent page scroll while popover is open (wheel + touch)
  useEffect(() => {
    if (!isOpen) return;

    let touchStartY = 0;

    const getScrollableContent = () =>
      menuRef.current?.querySelector(
        '.fx-dropdown__content, .fx-select__content',
      ) as HTMLElement | null;

    const shouldPreventScroll = (deltaY: number): boolean => {
      const scrollableEl = getScrollableContent();
      if (!scrollableEl) return true;

      const { scrollTop, scrollHeight, clientHeight } = scrollableEl;
      const isAtTop = scrollTop === 0 && deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight && deltaY > 0;

      return isAtTop || isAtBottom;
    };

    const isInsidePopover = (target: Node): boolean => {
      return (
        (containerRef.current?.contains(target) ?? false) ||
        (menuRef.current?.contains(target) ?? false)
      );
    };

    const handleWheel = (event: WheelEvent) => {
      const target = event.target as Node;
      if (!isInsidePopover(target)) {
        event.preventDefault();
        return;
      }

      if (shouldPreventScroll(event.deltaY)) {
        event.preventDefault();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const target = event.target as Node;
      if (!isInsidePopover(target)) {
        event.preventDefault();
        return;
      }

      const touchY = event.touches[0]?.clientY ?? 0;
      const deltaY = touchStartY - touchY;

      if (shouldPreventScroll(deltaY)) {
        event.preventDefault();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen]);

  // Recalculate position on scroll/resize when using portal
  useEffect(() => {
    if (!isOpen || !portal) return;

    const handlePositionUpdate = () => {
      calculatePosition();
    };

    window.addEventListener('scroll', handlePositionUpdate, true);
    window.addEventListener('resize', handlePositionUpdate);

    return () => {
      window.removeEventListener('scroll', handlePositionUpdate, true);
      window.removeEventListener('resize', handlePositionUpdate);
    };
  }, [isOpen, portal, calculatePosition]);

  return {
    isOpen,
    computedAlign,
    computedPlacement,
    maxHeight,
    position,
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
