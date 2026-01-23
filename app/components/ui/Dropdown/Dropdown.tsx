import cn from 'classnames';
import type { ReactNode } from 'react';
import { type PopoverAlign, usePopover } from '../hooks/usePopover';
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
  closeOnAction?: boolean;
  fullWidth?: boolean;
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
  closeOnAction = true,
  fullWidth = false,
}: DropdownProps) {
  const {
    isOpen,
    computedAlign,
    close,
    containerRef,
    triggerRef,
    menuRef,
    handleTriggerClick,
    handleTriggerKeyDown,
    handleContainerKeyDown,
    triggerId,
    menuId,
  } = usePopover({ align });

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
    'fx-dropdown__trigger',
    sizeClass,
    variantClass,
    iconClass,
    iconPositionClass,
    showArrow && 'fx-dropdown__trigger--has-arrow',
    fullWidth && 'fx-dropdown__trigger--full-width',
  );

  const containerClasses = cn(
    'fx-dropdown',
    size !== 'md' && `fx-dropdown--${size}`,
    fullWidth && 'fx-dropdown--full-width',
    className,
  );

  const popoverClasses = cn(
    'fx-dropdown__popover',
    isOpen && 'fx-dropdown__popover--expanded',
    computedAlign === 'end' && 'fx-dropdown__popover--align-end',
  );

  const contextValue = {
    close,
    size,
    closeOnAction,
  };

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
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          aria-hidden={!isOpen}
          className={popoverClasses}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: event delegation for action behavior */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: event delegation pattern */}
          <div className="fx-dropdown__popover-inner" onClick={handleMenuClick}>
            {children}
          </div>
        </div>
      </div>
    </DropdownContext.Provider>
  );
}
