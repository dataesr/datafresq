import { downloadBlob } from '@/utils/export-xlsx';

function filenameFromHeaders(headers: Headers): string | null {
  const contentDisposition = headers.get('Content-Disposition');
  if (!contentDisposition) return null;

  const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
  return match?.[1] ?? null;
}

/**
 * Fetch a server-generated export and trigger its download.
 * The file name comes from the `Content-Disposition` header when present.
 */
export async function downloadServerExport(url: string, fallbackFilename: string): Promise<void> {
  const response = await fetch(url, { method: 'GET', credentials: 'include' });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`);
  }

  const blob = await response.blob();
  downloadBlob(blob, filenameFromHeaders(response.headers) ?? fallbackFilename);
}
