import { useCallback, useState } from 'react';
import { Dropdown } from '@/components/Dropdown';

interface ExportButtonProps {
  totalCount?: number;
  disabled?: boolean;
}

type ExportFormat = 'json' | 'xlsx';

/**
 * Build the export URL from current search params
 * Simply takes the current URL search string and adds /export path with format
 */
function buildExportUrl(format: ExportFormat): string {
  const currentSearch = window.location.search;
  const params = new URLSearchParams(currentSearch);

  // Remove pagination params (not needed for export)
  params.delete('page');
  params.delete('pageSize');

  // Add format
  params.set('format', format);

  return `/api/programs/export?${params.toString()}`;
}

export default function ExportButton({ totalCount = 0, disabled = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (isExporting) return;

      setIsExporting(true);
      setExportingFormat(format);

      try {
        const url = buildExportUrl(format);
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Export failed: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `formations-export.${format}`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
          if (filenameMatch?.[1]) {
            filename = filenameMatch[1];
          }
        }

        // Trigger download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Export error:', error);
      } finally {
        setIsExporting(false);
        setExportingFormat(null);
      }
    },
    [isExporting],
  );

  const getItemIcon = (format: ExportFormat, defaultIcon: string) => {
    if (isExporting && exportingFormat === format) {
      return 'fr-icon-refresh-line fr-icon--spin';
    }
    return defaultIcon;
  };

  return (
    <Dropdown
      label="Télécharger"
      icon="download-line"
      disabled={disabled || totalCount === 0 || isExporting}
      align="end"
      size="sm"
      outline={false}
    >
      <button
        type="button"
        className={`fx-dropdown__item ${getItemIcon('xlsx', 'fr-icon-file-text-line')}`}
        onClick={() => handleExport('xlsx')}
        disabled={isExporting}
      >
        Exporter en Excel (.xlsx)
      </button>
      <button
        type="button"
        className={`fx-dropdown__item ${getItemIcon('json', 'fr-icon-code-s-slash-line')}`}
        onClick={() => handleExport('json')}
        disabled={isExporting}
      >
        Exporter en JSON (.json)
      </button>
    </Dropdown>
  );
}
