2b r2 구현을 마쳤습니다. 패키징 앱은 첫 실행 시 사용자 데이터 폴더에 Python 환경을 구성하고, 완료 기록이 현재 리소스와 일치하면 동기화를 건너뛴 뒤 사이드카를 실행합니다. 준비 화면에 진행 단계·경과 시간·로그·취소와 재시도를 연결했습니다.

Windows에서는 `nvidia-smi`의 CUDA 지원 버전이 13.2 이상이면 `cu132`, 그 외에는 `cpu`를 선택하도록 했습니다. 앱이 계산한 LocalAppData 부모를 `WIN_PD_OVERRIDE_LOCAL_APPDATA`로 uv와 사이드카에 전달합니다.

**관측과 판단 사항**

- 프로젝트는 앱 리소스에서 `runtime/project`의 임시 폴더로 복사한 뒤 교체합니다. 설치 성공 후에만 `state.json`을 원자적으로 기록합니다. 소스만 바뀌어도 같은 버전의 로컬 패키지를 다시 설치하도록 `--reinstall-package thebooth`를 추가했습니다.
- 실제 uv 통합 테스트에서 설치, 재사용, 소스 변경 후 재설치, stdin EOF 종료, 설치 중 취소, 잘못된 잠금 파일 실패와 재시도를 확인했습니다. 테스트에는 PATH의 uv 0.9.28과 이미 설치된 Python 3.12를 사용하고, Python 재다운로드를 피하도록 테스트에서만 `--managed-python`을 생략했습니다.
- 최종 macOS 앱을 임시 HOME으로 실행했을 때 Python 환경 구성이 자동 시작됐습니다. 만들기 탭의 준비 안내, 취소, 다시 시작을 확인했고 창을 닫은 뒤 uv 프로세스가 남지 않았습니다.
- 테스트용 Python 프로젝트를 넣은 **앱 사본**에서는 패키징된 Chromium의 모델 목록 요청이 HTTP 200을 반환했고 SSE 이벤트를 받았습니다. 이 macOS 확인에서는 로컬 네트워크 권한 예외가 필요하지 않았습니다. 실제 처리 코어의 전체 환경 구성을 끝까지 기다리지는 않았습니다.
- ASAR는 **68,017,998 → 761,311 bytes**로 줄었고, 목록에는 `out/`과 `package.json`만 있습니다. Windows 실행 파일의 `CompanyName`은 `thewronghand`로 확인했습니다.

**Windows 해석 확인**

동봉 uv 0.13.7로 `UV_NO_CONFIG=1 uv export --frozen --no-dev --extra cpu|cu132`를 실행해, Windows 마커에 각각 `torch==2.15.0+cpu`와 `torch==2.15.0+cu132`가 선택되는 것을 확인했습니다. 잠금 파일의 출처는 각각 PyTorch CPU·cu132 인덱스이고, `torchaudio==2.11.1`은 PyPI 그대로입니다. extra가 없는 Windows 해석은 PyPI `torch==2.15.0`입니다.

macOS arm64의 PyPI torch 2.15.0 wheel 해시는 잠금 전후 동일했고, `uv sync` 전후 개발 패키지 목록에도 차이가 없었습니다. Windows 설치·실행, 실제 NVIDIA 감지와 CUDA·torchaudio 동작, Windows의 로컬 네트워크 권한은 실기 미검증입니다.

**게이트**

| 명령 | EXIT |
|---|---:|
| `uv lock --check` | 0 |
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

Python 테스트는 366개, 경고 3건이었고 앱 테스트는 90개였습니다. `pnpm lint`를 빌드와 동시에 실행한 한 차례에는 Vite 임시 파일이 사라져 `EXIT=2`가 나왔으며, 빌드 종료 후 순차 재실행은 `EXIT=0`이었습니다. macOS DMG 빌드는 앞선 샌드박스의 `hdiutil` 제약 때문에 샌드박스 밖에서 실행했습니다.

최종 산출물은 [macOS arm64 DMG](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/dist/thebooth-0.1.0-mac-arm64.dmg) **135,259,045 bytes**, [macOS 앱](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/dist/mac-arm64/thebooth.app), [Windows x64 NSIS](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/dist/thebooth-0.1.0-win-x64.exe) **132,424,782 bytes**입니다.

**r2에서 변경한 파일**

- 루트: [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md), [pyproject.toml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/pyproject.toml), [uv.lock](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/uv.lock)
- [앱 설정과 스크립트](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app): `package.json`, `pnpm-lock.yaml`, `eslint.config.js`, `scripts/fetch-uv.mjs`
- [Electron main](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main): `index.ts`, `dataPaths.ts`, `sidecar.ts`, `processTree.ts`, `runtime.ts`, `runtimeConfig.ts`
- IPC: [preload/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/preload/index.ts), [shared/ipc.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/shared/ipc.ts)
- [렌더러](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src): `App.tsx`, `main.tsx`, `lib/runtimeContext.tsx`, 준비 화면의 `RuntimePanel.tsx`, `runtimeDisplay.ts`, `PrepareSession.tsx`, `PrepareScreen.tsx`, `ModelRow.tsx`, `modelDisplay.ts`
- [앱 테스트](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests): `dataPaths.test.ts`, `prepare.test.ts`, `runtimeConfig.test.ts`, `runtime.integration.test.ts`, `sidecarFailure.test.ts` 및 `fixtures/runtime_project/`

워킹트리에는 기존 r1 변경도 그대로 남아 있습니다. 커밋하지 않았습니다.