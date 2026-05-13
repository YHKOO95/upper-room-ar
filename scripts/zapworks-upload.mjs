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
 * ZapWorks CDN이 COOP/COEP 헤더를 넣어야 Zappar WASM(멀티스레드)이 iOS 등에서
 * 카메라 텍스처를 그립니다. 기본으로 --cross-origin-isolation 를 붙입니다.
 * 끄려면: ZAPWORKS_COI=0 npm run zapworks:upload
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

const useCoi = process.env.ZAPWORKS_COI !== '0' && process.env.ZAPWORKS_COI !== 'false';

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
if (useCoi) args.push('--cross-origin-isolation');

const result = spawnSync('npx', args, {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

if (result.status === 0) {
  console.log(`
[AR 호스팅] crossOriginIsolated 확인:
  · 크롬 F12 → Console 좌측 상단 컨텍스트가 "top"이면 부모 페이지입니다. AR가 iframe이면
    드롭다운에서 *.zappar.io 를 고른 뒤 crossOriginIsolated 를 입력하세요.
  · Network → 문서(index.html) → Response Headers에
    Cross-Origin-Opener-Policy, Cross-Origin-Embedder-Policy 가 없으면 COI 미적용 버전입니다.
    같은 ZAPWORKS_VERSION 으로는 생성이 스킵될 수 있으니 버전을 올리고 다시 upload·publish 하세요.
  · 대시보드 ZIP 업로드만 했다면 COI가 빠졌을 수 있습니다. 이 스크립트는 기본으로 --cross-origin-isolation 를 붙입니다.
  · ZapWorks CDN에 헤더가 계속 없으면 contact@zappar.com 등으로 해당 프로젝트·버전을 문의하세요.
  · 대안: 레포의 vercel.json 으로 Vercel에 올리면 COOP/COEP를 직접 줄 수 있습니다(Zappar 라이선스 도메인 등록 필요할 수 있음).
`);
}

process.exit(result.status ?? 1);
