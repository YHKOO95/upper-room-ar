# 2026 여호수아 비상수련회 AR 컨텐츠

모바일 웹에서 카메라로 숨겨진 이미지 타겟을 비추면 AR 오브젝트가 나타나는 MVP입니다. **UI는 React 19 + React Router(Hash)** 로, **스캔만** 별도 `scan.html`(8th Wall + A-Frame)입니다.

## 실행

```bash
npm install
npm run dev
```

- 앱 진입: `https://호스트/` → 해시 라우트 예: `/#/hub`, `/#/detail?target=slug`
- 스캔: `./scan.html` (허브·상세에서 이동)

모바일 카메라는 HTTPS가 필요합니다.

## 화면 흐름

| 경로 | 내용 |
|------|------|
| `/#/` | 스플래시 |
| `/#/perm` | 카메라 안내 |
| `/#/hub` | 표식 목록 |
| `scan.html` | AR 스캔·발견 |
| `/#/detail?target=` | 상세 |
| `/#/complete` | 완료 |
| `/#/reflect` → `/#/engrave` → `/#/seal` | 기념 카드 |

`localStorage`(`upper-room-ar-found`), `sessionStorage`(`upper-room-ar-card`)는 그대로입니다.

## 이미지 타겟

1. `public/targets/{역}-{참조}.png` 등
2. `npm run gen:targets` → `public/image-targets/`

## 구조

- `src/main.jsx`, `src/App.jsx` — 라우트
- `src/pages/*.jsx` — UI 화면
- `src/lib/shared.js` — 글리프·카드·저장소
- `src/entry-scan.js` + `scan.html` — 8th Wall only
- `src/scanHref.js` — `scan.html` ↔ React 앱 링크

## 운영

- iOS Safari / Android Chrome에서 스캔·해시 라우트 동작 확인
- 이미지 타깃 인식률·HTTPS 확인
- **스캔에서 8th Wall 로딩만 계속될 때**
  - 배포 서버에 **전역 `Cross-Origin-Embedder-Policy` / `Cross-Origin-Opener-Policy`** 를 켜 두면 WebAR wasm·워커가 막혀 무한 로딩처럼 보일 수 있습니다. 이 저장소의 `vercel.json`은 그런 헤더를 두지 않습니다.
  - **앱 키가 없을 때** 엔진은 CDN이 아니라 빌드 시 `dist/xr-engine/`에 복사된 바이너리를 **같은 사이트**에서 로드합니다(`vite.config.js`). 차단·TLS·기업망 이슈를 줄이려는 대안입니다.
  - 프로덕션에서는 [8th Wall](https://www.8thwall.com) 프로젝트 **앱 키**를 발급받아 루트에 `.env`에 `VITE_8THWALL_APP_KEY=` 로 넣고, **호스트 도메인을 콘솔에 등록**한 뒤 다시 빌드·배포하는 것도 권장합니다. (예시: `.env.example`)
