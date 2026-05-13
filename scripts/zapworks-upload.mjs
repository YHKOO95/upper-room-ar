#!/usr/bin/env node
/**
 * ZapWorks Universal AR 호스팅 업로드
 *
 * 사전 준비:
 * 1. https://zap.works 에서 Universal AR 프로젝트 생성
 * 2. 프로젝트 상세에서 Project ID 복사 (대시보드/URL에 표시되는 식별자)
 * 3. 환경 변수 또는 인자로 ID 전달 후 실행
 *
 * 사용:
 *   npm run zapworks:upload
 *   ZAPWORKS_PROJECT_ID=xxxxx ZAPWORKS_VERSION=1.0.1 npm run zapworks:upload
 *   node scripts/zapworks-upload.mjs <projectId> [version]
 *
 * 첫 실행 시 CLI가 ZapWorks API 인증(브라우저)을 요구할 수 있습니다.
 * 업로드만으로 체험이 바로 안 열리면 대시보드에서 버전을 활성화하거나, 터미널에서 `npx zapworks publish` 를 대화식으로 실행해 보세요(업로드 디렉터리는 비움).
 * @see https://docs.zap.works/universal-ar/general/hosting/
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const projectId = process.env.ZAPWORKS_PROJECT_ID || process.argv[2];
const version = process.env.ZAPWORKS_VERSION || process.argv[3] || pkg.version;

if (!projectId) {
  console.error(
    'ZAPWORKS_PROJECT_ID가 없습니다. ZapWorks에서 Universal AR 프로젝트 ID를 확인한 뒤:\n' +
      '  export ZAPWORKS_PROJECT_ID="여기에_ID"\n' +
      '  npm run zapworks:upload\n' +
      '또는: node scripts/zapworks-upload.mjs <projectId> [version]',
  );
  process.exit(1);
}

const args = [
  'zapworks',
  'upload',
  '--dir',
  'dist',
  '--project',
  projectId,
  '--version',
  String(version),
  '--yes',
];

const result = spawnSync('npx', args, {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

process.exit(result.status ?? 1);
