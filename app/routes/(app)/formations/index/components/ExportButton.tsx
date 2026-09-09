import { type ExportFormat, ExportMenu } from '@/components/table';

interface ExportButtonProps {
  totalCount?: number;
  disabled?: boolean;
}

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
  return <ExportMenu buildUrl={buildExportUrl} disabled={disabled || totalCount === 0} />;
}
