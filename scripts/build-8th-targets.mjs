/**
 * Generates 8th Wall PLANAR image-target JSON + luminance assets from public/targets/*.png
 * Output: public/image-targets/ (served at /image-targets/… in dev and build)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { applyCrop } from '@8thwall/image-target-cli/src/apply.js';
import { getDefaultCrop } from '@8thwall/image-target-cli/src/crop.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'image-targets');

const TARGETS = [
  { file: '1.png', name: 'station-1' },
  { file: '2.png', name: 'station-2' },
  { file: '3.png', name: 'station-3' },
];

await fs.mkdir(outDir, { recursive: true });

for (const { file, name } of TARGETS) {
  const src = path.join(root, 'public', 'targets', file);
  await fs
    .access(src)
    .catch(() => {
      throw new Error(`Missing source image: ${path.relative(root, src)}`);
    });

  const rawImage = sharp(src);
  const meta = await rawImage.metadata();
  const sourceIsLandscape = (meta.width ?? 0) >= (meta.height ?? 0);
  const geometry = getDefaultCrop(meta, sourceIsLandscape);

  await applyCrop(rawImage, { type: 'PLANAR', geometry }, outDir, name, true);
  process.stdout.write(`Wrote ${name}.json + assets → public/image-targets/\n`);
}
