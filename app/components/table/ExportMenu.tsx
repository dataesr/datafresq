import { useCallback, useState } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { downloadServerExport } from '@/utils/download-export';

export type ExportFormat = 'json' | 'xlsx';

export interface ExportMenuProps {
  /** Builds the API url to download for a given format */
  buildUrl: (format: ExportFormat) => string;
  /** File name (without extension) used when the server sends no Content-Disposition */
  fallbackName?: string;
  disabled?: boolean;
  label?: string;
}

/**
 * Download menu for the server-side (Elasticsearch) programs export,
 * shared by the search page and the workspace formations tab so both
 * produce the exact same files.
 */
export function ExportMenu({
  buildUrl,
  fallbackName = 'formations-export',
  disabled = false,
  label = 'Télécharger',
}: ExportMenuProps) {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const isExporting = exportingFormat !== null;

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (isExporting) return;

      setExportingFormat(format);

      try {
        await downloadServerExport(buildUrl(format), `${fallbackName}.${format}`);
      } catch (error) {
        console.error('Export error:', error);
      } finally {
        setExportingFormat(null);
      }
    },
    [isExporting, buildUrl, fallbackName],
  );

  const getItemIcon = (format: ExportFormat, defaultIcon: string) =>
    exportingFormat === format ? 'refresh-line' : defaultIcon;

  return (
    <Dropdown
      label={label}
      icon="download-line"
      disabled={disabled || isExporting}
      align="end"
      size="sm"
      outline={false}
    >
      <Dropdown.Item
        icon={getItemIcon('xlsx', 'file-text-line')}
        onClick={() => handleExport('xlsx')}
        disabled={isExporting}
      >
        Exporter en Excel (.xlsx)
      </Dropdown.Item>
      <Dropdown.Item
        icon={getItemIcon('json', 'code-s-slash-line')}
        onClick={() => handleExport('json')}
        disabled={isExporting}
      >
        Exporter en JSON (.json)
      </Dropdown.Item>
    </Dropdown>
  );
}
