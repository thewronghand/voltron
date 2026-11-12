r6 변경을 반영했습니다. 정렬 캐시가 적중해도 사이드카가 `align`을 보고하며, 앱은 진행 이벤트 개수 추론을 더 이상 사용하지 않습니다.

### 1. 변경 파일

- [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py) — 정렬 캐시 조회 전에 `align` 단계를 보고합니다.
- [jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/jobs.py) — 단계 이름이 바뀌면 이전 `message`를 비웁니다.
- [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md) — 정렬 캐시와 단계별 메시지 동작을 계약에 추가했습니다.
- [test_jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_jobs.py) — 단계 전환 시 메시지 초기화와 이후 메시지 유지를 검증합니다.
- [test_sidecar_r5.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_sidecar_r5.py) — 정렬 캐시 적중·미적중 시 단계 순서를 검증합니다.
- [makeLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/makeLogic.ts) — 이벤트 개수 세기를 제거하고 연속 입력 변경 시 안내를 유지합니다.
- [MakeSession.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeSession.tsx) — 단계 이력을 스냅샷으로 갱신합니다.
- [SourceAndOutput.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/SourceAndOutput.tsx) — 음원 놓기 안내에 마침표를 추가했습니다.
- [jobEvents.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobEvents.ts) — 개수 추론에 쓰던 이벤트 종류 상태를 제거했습니다.
- [jobStream.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobStream.ts) — 리듀서에 이벤트 종류를 별도로 전달하지 않도록 정리했습니다.
- [make.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/make.test.ts) — 새 단계 순서와 연속 입력 변경 안내를 검증합니다.
- [jobEvents.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobEvents.test.ts) — 단순화된 이벤트 상태에 맞췄습니다.
- [jobStream.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobStream.test.ts) — 정렬 이벤트 이후 두 번째 저장에서 완료 표시가 유지되는지 검증합니다.

### 2. 판단 사항

같은 단계에서 진행률 설정을 다시 보고할 때는 메시지를 유지하고, **서로 다른 단계로 바뀔 때** 비웁니다. 분리·가이드·키·영상 결과물 생성 로직은 변경하지 않았습니다.

### 3. 빈틈/TODO

SSE 연결이 끊긴 동안 `align` 이벤트를 놓치고 두 번째 `write` 스냅샷으로 재접속하면, 현재 스냅샷만으로 어느 저장 단계인지 구분할 수 없어 `render`까지 정렬이 대기로 보일 수 있습니다.

기본 영상 렌더 경로에서는 렌더 안내 메시지가 `render` 단계 진입 직전에 전송되므로, 이번 단계 전환 규칙에 따라 진입 시 비워집니다.

### 4. 검증

앱 게이트는 지정된 순서로 실행했습니다.

- `pnpm typecheck`: **EXIT=0**
- `pnpm lint`: **EXIT=0**
- `pnpm test`: **EXIT=0** — 테스트 9개 파일, 62개. 마지막 결과 줄: `Duration 1.40s (tests 86%, transform 8%, import 5%, worker 1%)`
- `pnpm build`: **EXIT=0**
- `uv run ruff check .`: **EXIT=0**
- `uv run ruff format --check .`: **EXIT=0**
- `uv run mypy`: **EXIT=0**
- `uv run pytest -q`: **EXIT=0** — 마지막 결과: 테스트 360개, 경고 3개, 51.46초.