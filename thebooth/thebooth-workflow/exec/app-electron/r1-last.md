Electron 앱 뼈대를 `app/`에 구현했습니다. 지정한 앱·Python 게이트는 모두 `EXIT=0`이며, 개발 실행에서 사이드카 `ready`와 종료 후 프로세스 소멸을 확인했습니다.

### 1. 변경 파일

- [.gitignore](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/.gitignore) — 앱 빌드 산출물과 pnpm 캐시를 제외했습니다.
- [package.json](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/package.json) — 스크립트와 의존성을 정의하고 Electron 바이너리 설치를 연결했습니다.
- [pnpm-lock.yaml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/pnpm-lock.yaml) — 의존성 버전을 잠갔습니다.
- [pnpm-workspace.yaml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/pnpm-workspace.yaml) — 필요한 의존성 빌드 스크립트만 허용했습니다.
- [electron.vite.config.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/electron.vite.config.ts) — 세 프로세스의 빌드와 별칭, 개발용 CSP를 구성했습니다.
- [eslint.config.js](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/eslint.config.js), [vitest.config.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/vitest.config.ts) — 린트와 테스트 설정을 추가했습니다.
- [tsconfig.node.json](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tsconfig.node.json), [tsconfig.web.json](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tsconfig.web.json) — main·preload·renderer의 strict 타입 검사를 구성했습니다.
- [ipc.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/shared/ipc.ts) — 공유 IPC 계약을 정의했습니다.
- [main/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/index.ts) — 창 보안, IPC 출처 검사, 파일 대화상자와 앱 종료 처리를 구현했습니다.
- [sidecar.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/sidecar.ts) — 사이드카 시작·상태·재시작·종료와 프로세스 트리 정리를 구현했습니다.
- [sidecarUtils.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/sidecarUtils.ts) — 준비 응답, 렌더러 출처, 종료 명령 계산을 분리했습니다.
- [preload/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/preload/index.ts) — 최소 preload API를 노출했습니다.
- [index.html](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/index.html), [env.d.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/env.d.ts) — CSP와 `window.thebooth` 타입을 추가했습니다.
- [main.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/main.tsx), [styles.css](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/styles.css) — React 진입점과 UI·Tailwind 스타일을 연결했습니다.
- [App.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/App.tsx) — 준비·만들기 자리 화면과 처리 엔진 상태 표시를 추가했습니다.
- [api.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/api.ts) — 인증 HTTP 클라이언트와 계약 타입을 정의했습니다.
- [jobEvents.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobEvents.ts), [jobStream.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobStream.ts) — 이벤트 순서 처리와 공유 SSE 연결을 구현했습니다.
- [sidecarContext.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/sidecarContext.tsx), [useJob.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/hooks/useJob.ts) — 사이드카 상태와 작업 구독 훅을 연결했습니다.
- [fixtures.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/fixtures.ts) — 테스트용 작업 스냅샷을 추가했습니다.
- [sidecarUtils.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/sidecarUtils.test.ts), [api.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/api.test.ts) — 시작 응답·출처·종료 명령과 API 오류를 검증했습니다.
- [jobEvents.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobEvents.test.ts), [jobStream.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobStream.test.ts) — 이벤트 순서, 연결 공유와 복구를 검증했습니다.
- [sidecar.integration.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/sidecar.integration.test.ts) — 실제 사이드카의 인증·CORS·재시작·종료를 검증했습니다.

### 2. 판단 사항

설치된 주요 버전은 Electron **45.3.1**, electron-vite **6.0.0**, Vite **8.3.8**, React **19.3.1**, Tailwind **4.3.5**, `@thewrong/ui` **0.2.0**, TypeScript **5.9.3**, Vitest **5.1.0**, ESLint **10.14.0**, pnpm **10.33.0**입니다.

Electron 45의 바이너리가 electron-vite 실행 전에 필요해 `pnpm install`의 `postinstall`에 설치 명령을 추가했습니다. `@thewrong/ui`의 공개 진입점을 Vite가 해석할 때 필요한 선택 의존성도 명시했습니다. 자동 생성된 잠금 파일을 제외한 코드 파일은 모두 400줄 미만입니다.

### 3. 빈틈/TODO

준비·만들기 화면의 실제 기능과 패키징·첫 실행 구성은 후속 범위로 남겼습니다. Windows의 프로세스 트리 종료 명령은 단위 테스트로 확인했으며, Windows 실기 실행은 하지 않았습니다. 화면의 시각적 확인도 남아 있습니다.

### 4. 검증 EXIT와 테스트 마지막 줄

- `pnpm install`, `typecheck`, `lint`, `test`, `build`: 각각 **EXIT=0**
- `uv run ruff check .`, `ruff format --check .`, `mypy`, `pytest -q`: 각각 **EXIT=0**
- Vitest: `Test Files 5 passed (5)` / `Tests 17 passed (17)`
- pytest 마지막 줄: `357 passed, 3 warnings in 55.63s`
- `pnpm dev`: 사이드카 `ready`를 확인한 뒤 Ctrl+C로 종료했습니다. 종료 명령의 EXIT는 **1**이었고, 해당 사이드카 PID 조회는 `ESRCH`였습니다.