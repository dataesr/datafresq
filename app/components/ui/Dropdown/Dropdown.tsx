import cn from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import { type PopoverAlign, type PopoverPlacement, usePopover } from '../hooks/usePopover';
import { Portal } from '../Portal';
import { DropdownContext, type DropdownSize } from './context';

export interface DropdownProps {
  label?: ReactNode;
  icon?: string;
  size?: DropdownSize;
  outline?: boolean;
  hideArrow?: boolean;
  children: ReactNode;
  className?: string;
  title?: string;
  'aria-label'?: string;
  disabled?: boolean;
  align?: PopoverAlign;
  placement?: PopoverPlacement | 'auto';
  closeOnAction?: boolean;
  fullWidth?: boolean;
  portal?: boolean;
  popoverMinWidth?: string;
}

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
  align = 'auto',
  placement = 'auto',
  closeOnAction = true,
  fullWidth = false,
  portal = true,
  popoverMinWidth,
}: DropdownProps) {
  const {
    isOpen,
    computedAlign,
    computedPlacement,
    maxHeight,
    position,
    close,
    containerRef,
    triggerRef,
    menuRef,
    handleTriggerClick,
    handleTriggerKeyDown,
    handleContainerKeyDown,
    triggerId,
    menuId,
  } = usePopover({ align, placement, portal });

  const isIconOnly = !label && !!icon;
  const accessibleLabel = ariaLabel ?? (isIconOnly ? title : undefined);
  const showArrow = hideArrow !== undefined ? !hideArrow : !isIconOnly;

  const handleMenuClick = (event: React.MouseEvent) => {
    if (!closeOnAction) return;

    const target = event.target as HTMLElement;
    const clickedItem = target.closest('button, a[href], [role="menuitem"]');

    if (!clickedItem) return;
    if (clickedItem.hasAttribute('disabled')) return;
    if (clickedItem.getAttribute('aria-disabled') === 'true') return;

    requestAnimationFrame(() => {
      close();
      triggerRef.current?.focus();
    });
  };

  const sizeClass = size === 'sm' ? 'fr-btn--sm' : size === 'lg' ? 'fr-btn--lg' : null;
  const variantClass = outline ? 'fr-btn--tertiary' : 'fr-btn--tertiary-no-outline';
  const iconClass = icon ? `fr-icon-${icon}` : null;
  const iconPositionClass = icon && label ? 'fr-btn--icon-left' : null;

  const triggerClasses = cn(
    'fr-btn',
    'dropdown__trigger',
    sizeClass,
    variantClass,
    iconClass,
    iconPositionClass,
    showArrow && 'dropdown__trigger--has-arrow',
    fullWidth && 'dropdown__trigger--full-width',
  );

  const containerClasses = cn(
    'dropdown',
    size !== 'md' && `dropdown--${size}`,
    fullWidth && 'dropdown--full-width',
    className,
  );

  const popoverClasses = cn(
    'dropdown__popover',
    isOpen && 'dropdown__popover--expanded',
    computedAlign === 'end' && 'dropdown__popover--align-end',
    computedPlacement === 'top' && 'dropdown__popover--placement-top',
    portal && 'dropdown__popover--portal',
  );

  const popoverStyle: CSSProperties = {
    ...(maxHeight != null && {
      '--popover-max-height': `${maxHeight}px`,
    }),
    ...(portal &&
      position && {
        position: 'absolute',
        top: position.top,
        left: position.left,
        minWidth: popoverMinWidth ?? position.minWidth,
      }),
    ...(!portal &&
      popoverMinWidth && {
        minWidth: popoverMinWidth,
      }),
  } as CSSProperties;

  const contextValue = {
    close,
    size,
    closeOnAction,
    isOpen,
  };

  const popoverContent = (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      aria-hidden={!isOpen}
      className={popoverClasses}
      style={popoverStyle}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: event delegation for action behavior */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: event delegation pattern */}
      <div className="dropdown__popover-inner" onClick={handleMenuClick}>
        {children}
      </div>
    </div>
  );

  return (
    <DropdownContext.Provider value={contextValue}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: container handles keyboard navigation */}
      <div ref={containerRef} className={containerClasses} onKeyDown={handleContainerKeyDown}>
        <button
          ref={triggerRef}
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
        {portal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </div>
    </DropdownContext.Provider>
  );
}
