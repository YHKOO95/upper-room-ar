# 2026 여호수아 비상수련회 AR 컨텐츠

모바일 웹에서 카메라로 숨겨진 이미지 타겟을 비추면 AR 오브젝트가 나타나는 MVP입니다. 런타임은 **8th Wall**(A-Frame 연동)을 사용합니다.

## 실행

```bash
npm install
npm run dev
```

모바일 카메라는 HTTPS 환경에서만 안정적으로 동작합니다. 이 프로젝트는 개발 서버도 HTTPS로 실행되도록 설정되어 있습니다.

## 화면(멀티 페이지) 흐름

| 파일 | 역할 |
|------|------|
| `index.html` | 스플래시 |
| `perm.html` | 카메라 안내 |
| `hub.html` | 표식 목록·진행도 |
| `scan.html` | **8th Wall + A-Frame** 스캔·발견 오버레이만 |
| `detail.html?target=` | 오브제 상세 |
| `complete.html` | 네 표식 완료 |
| `reflect.html` → `engrave.html` → `seal.html` | 기념 카드 |

발견한 표식은 `localStorage`(`upper-room-ar-found`), 카드 작성 중 데이터는 `sessionStorage`(`upper-room-ar-card`)에 둡니다.

## 이미지 타겟 준비

1. 실물 표식 사진을 `public/targets/{역번호}-{참조번호}.png`(또는 `jpg`/`webp`)로 넣습니다. (`scripts/build-8th-targets.mjs`와 `src/targets.js`의 역·참조 개수와 맞춥니다.)
2. 빌드 전에 8th Wall용 메타데이터를 생성합니다.

```bash
npm run gen:targets
```

생성물은 `public/image-targets/` 아래 `.json` 및 관련 이미지입니다. `npm run build`의 `prebuild`에서 자동으로 실행됩니다.

현재 앱 타깃(예시):

1. 기도의 창문
2. 하나님의 격려
3. 하늘의 빛
4. 기도의 능력 (어퍼룸 스카시 · 다니엘 9:23)

## 구현 구조

- `scan.html` + `src/entry-scan.js`: 8th Wall XR, 이미지 타깃, 스캔 UI
- `src/entry-*.js`: 화면별 진입 스크립트
- `src/lib/shared.js`: 공통(글리프, 카드 빌더, 저장소 헬퍼)
- `src/targets.js`: 역 메타데이터·`station-N-M` 이름 규칙
- `src/styles.css`: 모바일 우선 UI
- `public/targets`: 원본 표식 이미지(빌드 입력)
- `public/image-targets`: 8th Wall 이미지 타깃 산출물(빌드 출력)

## 운영 체크리스트

- iOS Safari와 Android Chrome에서 모두 테스트
- 실내 조명과 실제 오브제 위치에서 타겟 인식률 확인
- 이미지 타겟은 반사, 흔들림, 반복 패턴이 적은 디자인으로 제작
- 3D 모델 용량은 모바일 네트워크 기준으로 최적화
