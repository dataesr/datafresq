import { join } from 'node:path';

function imageToDataUrl(relativePath: string): string {
  const fullPath = join(process.cwd(), 'public/emails', relativePath);
  const buffer = Bun.file(fullPath);
  const base64 = buffer.toString();
  const mimeType = relativePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}

export const emailAssets = {
  marianneLogoLight: imageToDataUrl('marianne_light.png'),
  marianneLogoDark: imageToDataUrl('marianne_dark.png'),
  siesLogoLight: imageToDataUrl('sies_light.png'),
  siesLogoDark: imageToDataUrl('sies_dark.png'),
};
