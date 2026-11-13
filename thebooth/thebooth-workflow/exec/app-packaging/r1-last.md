요청한 패키징 뼈대와 Windows FFmpeg manifest를 구현했습니다. 브랜치 `feat/app-packaging`에서 작업했으며 커밋하지 않았습니다.

산출물은 다음과 같습니다.

- [macOS arm64 DMG](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/dist/thebooth-0.1.0-mac-arm64.dmg): 145,442,008 bytes
- [macOS 앱](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/dist/mac-arm64/thebooth.app): 359,060 KiB
- [Windows x64 NSIS 설치 파일](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/dist/thebooth-0.1.0-win-x64.exe): 138,355,596 bytes
- [Windows 압축 해제 산출물](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/dist/win-unpacked): 466,404 KiB

두 플랫폼 리소스에서 `python/`과 플랫폼별 `uv`를 확인했고, Windows 설치 파일 내부도 7-Zip으로 열어 `thebooth.exe`, Python 소스·잠금 파일과 `uv.exe`를 확인했습니다.

**구현과 관측 사항**

- 화면 출처는 요청대로 `app://thebooth`를 사용하고 ASAR를 유지했습니다. 패키징된 macOS 앱에서 화면 내용과 IPC 상태가 표시됐고, 없는 리소스는 404를 반환했습니다. 720px 뷰포트에서 문서 가로 폭도 720px로 관측됐습니다.
- 패키징된 macOS Chromium이 임시 로컬 HTTP 서버에 보낸 헤더는 **`Origin: app://thebooth`로 실측**했습니다. Python 서버의 자체 CORS 미들웨어는 pytest에서 해당 출처의 preflight, 인증 요청, SSE를 확인했습니다. Windows Chromium의 출처 값은 아직 실측하지 않았으며 macOS와 같을 것으로 추정합니다.
- electron-builder는 pnpm 의존성을 ASAR에 포함했습니다. `@thewrong/ui`, React, React DOM과 렌더러 파일을 확인했으며 별도 pnpm 링크 설정은 추가하지 않았습니다. Wine 없이 사용자 단위 NSIS 설치 파일이 생성됐습니다.
- uv 0.13.7의 두 압축 파일 SHA-256을 확인했습니다. Windows FFmpeg의 크기와 해시는 지시서에서 제공한 값을 manifest에 반영했습니다. Windows FFmpeg 실행은 확인하지 않았습니다.
- 패키징 앱의 Python 환경 구성, 사이드카 실행, 준비 화면과 CUDA 선택은 r2에 남아 있습니다. 현재 앱은 실행 환경 구성 미지원 메시지를 표시합니다.

**게이트**

| 명령 | EXIT |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |
| `pnpm dist:mac` | 0 |
| `pnpm dist:win` | 0 |

Python 테스트는 366개, 경고 3건이었고 앱 테스트는 83개였습니다. macOS DMG의 첫 샌드박스 실행은 `hdiutil` 오류로 `EXIT=1`이었으며, 샌드박스 밖 재실행은 `EXIT=0`이었습니다. 앱 실행 확인도 샌드박스 안에서는 `SIGABRT`로 중단돼 샌드박스 밖에서 수행했습니다.

**변경 파일**

- 공통·Python: [.gitignore](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/.gitignore), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md), [manifest.json](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/manifest.json), [test_server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_server.py), [test_video_models.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_models.py)
- 패키징 설정: [electron-builder.yml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/electron-builder.yml), [fetch-uv.mjs](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/scripts/fetch-uv.mjs), [package.json](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/package.json), [pnpm-lock.yaml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/pnpm-lock.yaml), [electron.vite.config.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/electron.vite.config.ts), [eslint.config.js](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/eslint.config.js)
- Electron main: [index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/index.ts), [sidecar.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/sidecar.ts), [sidecarUtils.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/sidecarUtils.ts), [dataPaths.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/dataPaths.ts), [rendererProtocol.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/rendererProtocol.ts)
- 화면: [index.html](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/index.html), [App.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/App.tsx), [PrepareScreen.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/PrepareScreen.tsx), [modelDisplay.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/modelDisplay.ts)
- 앱 테스트: [prepare.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/prepare.test.ts), [sidecar.integration.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/sidecar.integration.test.ts), [sidecarFailure.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/sidecarFailure.test.ts), [sidecarUtils.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/sidecarUtils.test.ts), [dataPaths.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/dataPaths.test.ts), [rendererProtocol.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/rendererProtocol.test.ts), [fetchUv.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/fetchUv.test.ts)