r2 지적을 반영하고 만들기 화면을 구현했습니다. 지정한 앱과 Python 게이트는 모두 `EXIT=0`입니다.

### 1. 변경 파일

- [jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/jobs.py), [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py) — SSE 스냅샷과 순번을 원자적으로 얻고 이후 이벤트만 보냅니다.
- [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md), [test_server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_server.py) — 새 SSE 계약과 재생 방지 테스트를 반영했습니다.
- [main/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/index.ts), [sidecar.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/sidecar.ts) — 시작 오류 처리와 종료 실패 시 EOF 동작 설명을 추가했습니다.
- [jobEvents.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobEvents.ts), [jobStream.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobStream.ts) — 스냅샷 순번, 이벤트 형식 검사와 연속 재연결 횟수를 처리합니다.
- [api.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/api.ts), [useJob.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/hooks/useJob.ts) — 공통 오류 문구와 작업 상태 관찰을 연결했습니다.
- [modelsContext.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/modelsContext.tsx), [main.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/main.tsx) — 두 화면이 모델 목록을 공유하도록 구성했습니다.
- [App.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/App.tsx) — 만들기 화면과 창 전체의 파일 놓기 방지를 연결했습니다.
- [ProgressBar.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/components/ProgressBar.tsx), [styles.css](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/styles.css) — 대비가 있는 공통 진행 막대와 미정 진행률 애니메이션을 추가했습니다.
- [PrepareScreen.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/PrepareScreen.tsx), [ModelRow.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/ModelRow.tsx), [modelDisplay.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/modelDisplay.ts) — 받은 양 문구 파싱을 제거하고 확인·재시도 상태를 추가했습니다.
- [makeLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/makeLogic.ts) — 요청 본문, 기본 경로, 키 합산, 단계와 화면 상태를 계산합니다.
- [MakeSession.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeSession.tsx) — 폼과 작업 상태를 탭 간 유지하고 엔진 변경을 처리합니다.
- [MakeForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeForm.tsx), [MakeOptions.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeOptions.tsx) — 만들기 옵션과 실행 검사를 구현했습니다.
- [SourceAndOutput.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/SourceAndOutput.tsx), [PathField.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/PathField.tsx) — 파일 놓기·선택과 저장 위치 선택을 구현했습니다.
- [JobProgress.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/JobProgress.tsx), [JobResult.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/JobResult.tsx) — 단계·취소·경과 시간과 결과·부분 파일을 표시합니다.
- [jobEvents.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobEvents.test.ts), [jobStream.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobStream.test.ts) — 순번과 재연결 동작을 검증했습니다.
- [prepare.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/prepare.test.ts), [make.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/make.test.ts) — 재시도 조건과 만들기 요청·경로·단계를 검증했습니다.

### 2. 판단 사항

SSE 재연결은 새 스냅샷 순번부터 이어지며, 연결 성공 또는 정상 이벤트 수신 시 연속 실패 횟수를 초기화합니다. 다운로드 받은 양은 추정하지 않고 퍼센트만 표시합니다.

실제 Python 처리에서는 저장 단계가 영상 단계 전에도 나타날 수 있어, 만들기 화면은 관측한 단계 이력을 사용해 완료 상태를 표시합니다.

### 3. 빈틈/TODO

호출 세션에서 요청한 화면의 시각적 확인과 Windows 실기 확인은 남아 있습니다. 패키징과 첫 실행 환경 구성은 이번 범위 밖입니다.

### 4. 검증 EXIT와 테스트 마지막 줄

- `pnpm typecheck`, `lint`, `test`, `build`: 각각 **EXIT=0**
- `uv run ruff check .`, `ruff format --check .`, `mypy`, `pytest -q`: 각각 **EXIT=0**
- Vitest: `Test Files 9 passed (9)` / `Tests 42 passed (42)`
- pytest 마지막 줄: `358 passed, 3 warnings in 52.70s`