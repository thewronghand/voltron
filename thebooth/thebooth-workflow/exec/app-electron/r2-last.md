T1의 종료·SSE 복구 지적을 반영하고, 준비 탭에 모델 목록과 받기·취소 화면을 구현했습니다.

### 1. 변경 파일

- [sidecar.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/sidecar.ts) — 종료 실패 후 재시작이 가능하도록 정리하고, 재시작 전에 `starting`을 알립니다.
- [sidecarUtils.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/sidecarUtils.ts) — 프로세스 트리 종료의 지원 OS를 명시했습니다.
- [main/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/index.ts), [fileOptions.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/fileOptions.ts) — 권한을 기본 거부하고 파일 대화상자 인자를 검사합니다.
- [jobStream.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobStream.ts) — 복구 스냅샷에 따라 SSE를 재연결하고 리스너 수로 연결을 관리합니다.
- [App.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/App.tsx) — 준비 화면을 연결하고 엔진 변경 시 이전 작업 세션을 교체합니다.
- [PrepareSession.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/PrepareSession.tsx) — 탭 전환 중 작업 ID를 유지합니다.
- [PrepareScreen.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/PrepareScreen.tsx) — 모델 목록 조회와 완료 후 갱신을 담당합니다.
- [ModelRow.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/ModelRow.tsx) — 모델 정보, 진행률, 받기·취소·오류 상태를 표시합니다.
- [modelDisplay.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/modelDisplay.ts) — 크기·용도·표시 상태 계산을 분리했습니다.
- [sidecar.integration.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/sidecar.integration.test.ts), [sidecarFailure.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/sidecarFailure.test.ts) — 실제 프로세스 그룹 종료와 종료 실패 후 재시작을 검증했습니다.
- [jobStream.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobStream.test.ts), [fileOptions.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/fileOptions.test.ts), [prepare.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/prepare.test.ts) — 재연결·IPC 옵션·준비 화면 표시 계산을 검증했습니다.

### 2. 판단 사항

SSE가 닫히면 스냅샷을 확인한 뒤 비종료 작업에 한해 **1초 간격으로 최대 3회** 다시 연결합니다. 탭을 벗어나면 연결을 닫고 작업 ID는 유지하며, 엔진 주소나 토큰이 바뀌면 이전 ID를 버립니다.

### 3. 빈틈/TODO

사이드카는 현재 파일의 진행률을 보내지만 정확한 받은 바이트 수는 노출하지 않습니다. 화면의 받은 양은 안내 메시지에 포함된 반올림 크기를 이용한 **현재 파일 기준 추정치**입니다. 정확한 값을 표시하려면 사이드카 계약에 파일 크기 또는 누적 바이트가 필요합니다.

Windows 실기와 화면의 시각적 확인은 하지 않았습니다.

### 4. 검증 EXIT와 테스트 마지막 줄

- `pnpm typecheck`, `lint`, `test`, `build`: 각각 **EXIT=0**
- `uv run ruff check .`, `ruff format --check .`, `mypy`, `pytest -q`: 각각 **EXIT=0**
- Vitest: `Test Files 8 passed (8)` / `Tests 30 passed (30)`
- pytest 마지막 줄: `357 passed, 3 warnings in 54.03s`

Python 소스와 테스트 파일은 변경하지 않았습니다.