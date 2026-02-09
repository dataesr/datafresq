import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type PopoverAlign = 'start' | 'end' | 'auto';
export type PopoverPlacement = 'top' | 'bottom';

const VIEWPORT_PADDING = 8;

export interface PopoverPosition {
  top: number;
  left: number;
  minWidth: number;
}

export interface UsePopoverPositionOptions {
  enabled?: boolean;
  align?: PopoverAlign;
  placement?: PopoverPlacement | 'auto';
  portal?: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLElement | null>;
}

export interface UsePopoverPositionReturn {
  computedAlign: 'start' | 'end';
  computedPlacement: PopoverPlacement;
  maxHeight: number | null;
  position: PopoverPosition | null;
  recalculate: () => void;
}

export function usePopoverPosition({
  enabled = true,
  align: alignProp = 'auto',
  placement: placementProp = 'auto',
  portal = false,
  triggerRef,
  menuRef,
}: UsePopoverPositionOptions): UsePopoverPositionReturn {
  const [computedAlign, setComputedAlign] = useState<'start' | 'end'>('start');
  const [computedPlacement, setComputedPlacement] = useState<PopoverPlacement>('bottom');
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const prevPositionRef = useRef<PopoverPosition | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuEl = menuRef.current;

    const originalStyles = {
      visibility: menuEl.style.visibility,
      maxHeight: menuEl.style.maxHeight,
      position: menuEl.style.position,
    };

    menuEl.style.visibility = 'hidden';
    menuEl.style.maxHeight = 'none';
    menuEl.style.position = 'absolute';

    const contentHeight = menuEl.scrollHeight;

    menuEl.style.visibility = originalStyles.visibility;
    menuEl.style.maxHeight = originalStyles.maxHeight;
    menuEl.style.position = originalStyles.position;

    const spaceBelow = window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING;
    const spaceAbove = triggerRect.top - VIEWPORT_PADDING;

    let align: 'start' | 'end';
    if (alignProp === 'auto') {
      const buttonCenter = triggerRect.left + triggerRect.width / 2;
      align = buttonCenter > window.innerWidth / 2 ? 'end' : 'start';
    } else {
      align = alignProp;
    }
    setComputedAlign(align);

    let placement: PopoverPlacement;
    let availableHeight: number;

    if (placementProp !== 'auto') {
      placement = placementProp;
      availableHeight = placement === 'bottom' ? spaceBelow : spaceAbove;
    } else {
      const fitsBelow = contentHeight <= spaceBelow;
      const fitsAbove = contentHeight <= spaceAbove;

      if (fitsBelow) {
        placement = 'bottom';
        availableHeight = spaceBelow;
      } else if (fitsAbove && !fitsBelow) {
        placement = 'top';
        availableHeight = spaceAbove;
      } else {
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

    if (portal) {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const viewportWidth = window.innerWidth;
      const popoverWidth = menuEl.offsetWidth;
      const popoverHeight = menuEl.offsetHeight || availableHeight;

      let top: number;
      if (placement === 'bottom') {
        top = triggerRect.bottom + scrollY;
      } else {
        top = triggerRect.top + scrollY - popoverHeight;
      }

      let left: number;
      if (align === 'start') {
        left = triggerRect.left + scrollX;
      } else {
        left = triggerRect.right + scrollX - popoverWidth;
      }

      const minLeft = scrollX + VIEWPORT_PADDING;
      const maxLeft = scrollX + viewportWidth - popoverWidth - VIEWPORT_PADDING;

      if (left < minLeft) {
        left = minLeft;
      } else if (left > maxLeft && maxLeft > minLeft) {
        left = maxLeft;
      }

      const newPosition = {
        top,
        left,
        minWidth: triggerRect.width,
      };

      const prev = prevPositionRef.current;
      if (
        !prev ||
        prev.top !== newPosition.top ||
        prev.left !== newPosition.left ||
        prev.minWidth !== newPosition.minWidth
      ) {
        prevPositionRef.current = newPosition;
        setPosition(newPosition);
      }
    }
  }, [alignProp, placementProp, portal, triggerRef, menuRef]);

  useEffect(() => {
    if (!enabled || !menuRef.current) return;

    const menuEl = menuRef.current;

    calculatePosition();

    const resizeObserver = new ResizeObserver(() => {
      calculatePosition();
    });

    resizeObserver.observe(menuEl);

    return () => {
      resizeObserver.disconnect();
    };
  }, [enabled, calculatePosition, menuRef]);

  useEffect(() => {
    if (!enabled || !portal) return;

    const handleScroll = (event: Event) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;

      calculatePosition();
    };

    const handleResize = () => {
      calculatePosition();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, portal, calculatePosition, menuRef]);

  useEffect(() => {
    if (!enabled) {
      prevPositionRef.current = null;
    }
  }, [enabled]);

  return {
    computedAlign,
    computedPlacement,
    maxHeight,
    position,
    recalculate: calculatePosition,
  };
}
