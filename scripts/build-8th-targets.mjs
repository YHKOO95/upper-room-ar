/**
 * public/targets/{station}-{ref}.png|jpg → public/image-targets/station-{station}-{ref}.json
 * 역·ref 개수는 src/targets.js 와 동기화
 *
 * 학습 방식: 가운데 3:4 중앙 크롭(getDefaultCrop, isRotated=false).
 * 레터박스는 표식이 작을 때 luminance 대부분이 배경색이 되어 인식이 급띙하는 경우가 많아 제거함.
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

const { targets: appTargets, IMAGE_REFS_PER_STATION } = await import('../src/targets.js');
const STATION_COUNT = Math.max(...appTargets.map((t) => t.stationNum));

const EXTS = ['.png', '.jpg', '.jpeg', '.webp'];

const MIN_CROP_W = 480;
const MIN_CROP_H = 640;
/** luminance(높이 640) 이전 크롭이 더 크면 디테일 유리 */
const PREFERRED_CROP_H = 720;

async function sharpAndGeometryForApply(srcPath) {
  const orientedBuf = await sharp(srcPath).rotate().toBuffer();
  const baseMeta = await sharp(orientedBuf).metadata();
  const bw = baseMeta.width ?? 1;
  const bh = baseMeta.height ?? 1;

  let factor = 1;
  for (let i = 0; i < 22; i++) {
    const w = Math.max(1, Math.round(bw * factor));
    const h = Math.max(1, Math.round(bh * factor));
    const meta = { width: w, height: h };
    const geometry = getDefaultCrop(meta, false);

    if (
      geometry.width >= MIN_CROP_W &&
      geometry.height >= MIN_CROP_H &&
      geometry.height >= PREFERRED_CROP_H
    ) {
      const buf = await sharp(orientedBuf).resize(w, h).png().toBuffer();
      process.stdout.write(
        `  crop ${geometry.width}×${geometry.height} (원본 스케일 ${w}×${h}, ×${factor.toFixed(2)})\n`,
      );
      return { raw: sharp(buf), geometry };
    }

    const next = Math.max(
      MIN_CROP_W / geometry.width,
      PREFERRED_CROP_H / geometry.height,
      MIN_CROP_H / geometry.height,
      1.05,
    );
    factor *= next;
  }

  throw new Error(
    `[image-targets] ${srcPath}: 유효한 3:4 크롭을 만들 수 없습니다. 사진에 표식이 충분히 크게 들어오는지 확인하세요.`,
  );
}

async function resolveSource(station, ref) {
  const base = path.join(root, 'public', 'targets', `${station}-${ref}`);
  for (const ext of EXTS) {
    const p = `${base}${ext}`;
    try {
      await fs.access(p);
      return p;
    } catch {
      /* try next ext */
    }
  }
  for (const ext of EXTS) {
    const fallback = path.join(root, 'public', 'targets', `${station}${ext}`);
    try {
      await fs.access(fallback);
      process.stdout.write(
        `[image-targets] ${station}-${ref}: 없음 → ${path.basename(fallback)} 대체\n`,
      );
      return fallback;
    } catch {
      /* try next ext */
    }
  }
  throw new Error(
    `Missing source for station ${station} ref ${ref}: add targets/${station}-${ref}.png (또는 ${station}.png)`,
  );
}

await fs.mkdir(outDir, { recursive: true });

for (let s = 1; s <= STATION_COUNT; s++) {
  for (let r = 1; r <= IMAGE_REFS_PER_STATION; r++) {
    const src = await resolveSource(s, r);
    const name = `station-${s}-${r}`;
    const { raw, geometry } = await sharpAndGeometryForApply(src);

    await applyCrop(raw, { type: 'PLANAR', geometry }, outDir, name, true);
    process.stdout.write(`Wrote ${name}.json ← ${path.relative(root, src)}\n`);
  }
}
