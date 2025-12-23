import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Reads an image file and converts it to a base64 data URL
 */
function imageToDataUrl(relativePath: string): string {
  const fullPath = join(process.cwd(), 'src/emails/assets', relativePath);
  const buffer = readFileSync(fullPath);
  const base64 = buffer.toString('base64');
  const mimeType = relativePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Email assets as base64 data URLs for embedding in emails
 * This ensures images are always available regardless of email client
 */
export const emailAssets = {
  marianneLogoLight: imageToDataUrl('marianne_light.png'),
  marianneLogoDark: imageToDataUrl('marianne_dark.png'),
  siesLogoLight: imageToDataUrl('sies_light.png'),
  siesLogoDark: imageToDataUrl('sies_dark.png'),
};
