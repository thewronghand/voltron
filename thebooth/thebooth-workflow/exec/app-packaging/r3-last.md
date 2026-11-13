r3 변경을 적용했습니다. 패키징 앱에서 처리 엔진이 실패하거나 예기치 않게 종료되면 기존 **“다시 시작”**과 별도로 **“실행 환경 다시 구성”**을 선택할 수 있습니다. 개발 모드에는 재구성 버튼을 표시하지 않습니다.

화면에서는 실행 환경이 준비된 뒤 엔진 상태를 준비·만들기 두 탭 모두에 표시합니다. 큰 다운로드 안내는 확인 중에는 보이지 않고 실제 동기화 중에만 표시하며, 실패 시에는 설치 도구·파일 준비·패키지 설치·기록 저장 단계에 맞는 안내를 보여줍니다.

- 강제 재구성은 상태 기록을 무효화하고 다시 동기화한 뒤 사이드카를 시작합니다. 중단되거나 실패한 재구성은 별도 표식으로 남겨 재시도 때 업데이트 안내와 재구성 의도를 유지합니다.
- Windows에서 `nvidia-smi`가 없으면 CPU를, 정상 출력의 CUDA 버전이 13.2 이상이면 CUDA를 선택합니다. 실행 실패·시간 초과·판독 실패 시에는 기록된 변형을 유지하고, 기록이 없으면 CPU를 선택합니다.
- 동기화 명령의 해시를 상태 지문에 추가했습니다. 기록 형식이 2로 바뀌므로 기존 형식의 기록은 한 번 다시 동기화됩니다. 남은 `.project-*` 폴더는 동기화 시작 시 정리합니다.
- 실제 uv 통합 테스트에서 강제 재구성, 확인 단계 실패 후 재시도, 취소 후 업데이트 안내 유지와 `UV_OFFLINE` 제거를 확인했습니다.

취소 테스트의 변이 실험도 실행했습니다. `detached: false` 변이는 10초 취소 제한에 걸려 `EXIT=1`, 자식 프로세스만 종료하는 변이는 빌드 백엔드 PID가 남아 `EXIT=1`이었습니다. 두 변이는 원본으로 복구했습니다.

변경 파일은 다음과 같습니다.

- [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)
- [app/src/main](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main): `index.ts`, `runtime.ts`, `runtimeConfig.ts`
- [app/src/preload/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/preload/index.ts), [app/src/shared/ipc.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/shared/ipc.ts)
- [app/src/renderer/src](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src): `App.tsx`, `features/prepare/RuntimePanel.tsx`, `appView.ts`, `runtimeDisplay.ts`
- [app/tests](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests): `prepare.test.ts`, `runtimeConfig.test.ts`, `runtime.integration.test.ts`, `fixtures/runtime_project/backend.py`

| 게이트 | EXIT |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |

Python 테스트는 366개, 앱 테스트는 93개가 완료됐습니다. Python 테스트에서는 경고 3개가 나왔습니다. 요청대로 `app/dist/`를 건드리거나 패키징 앱을 실행하지 않았고, Windows 실기 동작은 확인하지 않았습니다. 커밋도 하지 않았습니다.