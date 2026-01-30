import cn from 'classnames';
import { useCallback, useState } from 'react';

export interface ExportButtonProps {
  onExport: () => void | Promise<void>;
  disabled?: boolean;
  label?: string;
}

export function ExportButton({
  onExport,
  disabled = false,
  label = 'Télécharger',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = useCallback(async () => {
    if (isExporting || disabled) return;

    setIsExporting(true);

    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, disabled, onExport]);

  return (
    <button
      type="button"
      className={cn(
        'fr-btn',
        'fr-btn--sm',
        'fr-btn--tertiary-no-outline',
        'fr-btn--icon-left',
        isExporting ? 'fr-icon-refresh-line' : 'fr-icon-download-line',
        { 'fr-icon--spin': isExporting }
      )}
      onClick={handleClick}
      disabled={disabled || isExporting}
      aria-busy={isExporting}
    >
      {label}
    </button>
  );
}
