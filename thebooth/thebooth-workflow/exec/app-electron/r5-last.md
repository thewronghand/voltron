r5 변경을 앱에 반영했습니다. 저장 경로는 직접 고른 전체 경로와 자동으로 이름을 만드는 경로를 구분하며, 스냅샷을 받기 전 엔진이 재시작된 경우에도 진행 상황 상실을 안내합니다.

### 1. 변경 파일

- [makeLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/makeLogic.ts) — 출력 경로 상태, 입력 변경 안내, 엔진 재시작 및 반복 저장 단계 판정을 수정했습니다.
- [SourceAndOutput.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/SourceAndOutput.tsx) — MR 저장 대화상자 선택을 전체 경로 고정 상태로 기록합니다.
- [MakeOptions.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeOptions.tsx) — 영상·보컬 경로와 가사 파일 선택에 새 상태를 연결했습니다.
- [MakeForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeForm.tsx) — 비운 파일의 유무에 따라 입력 변경 안내를 표시합니다.
- [MakeSession.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeSession.tsx) — 작업 실행 시 입력 변경 안내를 끄고 이벤트 종류를 단계 판정에 전달합니다.
- [JobProgress.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/JobProgress.tsx) — 로컬 취소 요청 직후에도 서버 메시지를 숨깁니다.
- [JobResult.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/JobResult.tsx) — 결과 파일별 폴더 열기 버튼에 접근성 이름을 붙였습니다.
- [ModelRow.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/ModelRow.tsx) — 모델별 받기·취소 버튼에 접근성 이름을 붙였습니다.
- [jobEvents.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobEvents.ts) — 적용된 이벤트 종류를 상태에 보관합니다.
- [jobStream.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobStream.ts) — 이벤트 종류를 전달하고 작업 기록 없음 문구에 마침표를 추가했습니다.
- [make.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/make.test.ts) — 경로 정책, 안내, 엔진 재시작과 요청한 단계 조합을 검증합니다.
- [jobEvents.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobEvents.test.ts) — 이벤트 종류가 상태에 반영되는지 검증합니다.
- [jobStream.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobStream.test.ts) — 실제 이벤트 순서에 맞춰 두 저장 단계를 구분하는지 검증합니다.

### 2. 판단 사항

사이드카는 단계 전환 직전에 이전 단계의 진행 이벤트를 한 번 더 보냅니다. 이를 고려해 첫 저장의 마무리 이벤트와 두 번째 저장 진입 이벤트를 구분했습니다.

저장 대화상자를 다시 사용하면 선택한 전체 경로가 고정됩니다. 이후 음원을 바꾸면 폴더와 확장자를 유지하고 앱이 이름을 생성하므로, 키나 남녀 전환을 바꿀 때 MR 접미사도 갱신됩니다.

### 3. 빈틈/TODO

연결이 끊겨 두 번째 저장 진입 이벤트를 놓친 경우, 재연결 스냅샷만으로는 두 저장 중 어느 단계인지 구분할 수 없습니다. 이 경우 영상 렌더 단계가 올 때까지 정렬이 대기로 보일 수 있습니다.

이번 작업에서 Python은 수정하지 않았습니다. 브랜치는 `feat/app-electron`을 유지했으며 커밋하지 않았습니다.

### 4. 검증

- `pnpm typecheck`: **EXIT=0**
- `pnpm lint`: **EXIT=0**
- `pnpm test`: **EXIT=0** — 테스트 9개 파일, 61개. 마지막 결과 줄: `Duration 1.42s (tests 89%, transform 5%, import 5%, worker 1%)`
- `pnpm build`: **EXIT=0**