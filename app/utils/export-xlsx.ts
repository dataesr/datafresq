import * as XLSX from 'xlsx';

export function toSnakeCase(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  accessor?: (row: T) => unknown;
}

export interface ExportOptions<T> {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  sheetName?: string;
}

function getCellValue<T>(row: T, column: ExportColumn<T>): unknown {
  if (column.accessor) {
    return column.accessor(row);
  }

  const value = (row as Record<string, unknown>)[column.key as string];

  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non';
  }

  return value ?? '';
}

function formatCellForExport(value: unknown): string | number | boolean {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

export function exportToXlsx<T>({
  data,
  columns,
  filename,
  sheetName = 'Export',
}: ExportOptions<T>): void {
  const worksheetData = [
    columns.map((c) => c.header),
    ...data.map((row) => columns.map((column) => formatCellForExport(getCellValue(row, column)))),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const columnWidths = columns.map((col) => {
    const headerLength = col.header.length;
    const maxDataLength = data.reduce((max, row) => {
      const value = String(getCellValue(row, col) ?? '');
      return Math.max(max, value.length);
    }, 0);
    return { wch: Math.min(Math.max(headerLength, maxDataLength, 10), 50) };
  });

  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, finalFilename);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
