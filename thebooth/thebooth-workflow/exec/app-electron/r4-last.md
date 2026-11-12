r4 변경을 `app/`에 반영했습니다. Python 파일은 이번 작업에서 수정하지 않았습니다.

### 1. 변경 파일

- [makeLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/makeLogic.ts) — 단계 완료 판정, 캐시 문구, 입력 변경 시 경로 처리, 엔진 재시작 시 결과 보존을 순수 함수로 구현했습니다.
- [MakeSession.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeSession.tsx) — 탭을 바꾼 동안에도 작업을 구독하고 종료 결과를 보관합니다.
- [JobProgress.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/JobProgress.tsx) — 단계 표시와 경과 시간 문구를 고치고 취소 메시지 중복을 없앴습니다.
- [JobResult.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/JobResult.tsx) — 캐시 표시를 수정하고 “폴더에서 보기”를 사용합니다.
- [SourceAndOutput.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/SourceAndOutput.tsx) — 파일 선택과 끌어놓기에 입력 변경 처리를 연결했습니다.
- [MakeForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeForm.tsx) — 입력 변경 안내를 추가했습니다.
- [PathField.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/PathField.tsx) — 파일 선택 버튼에 항목별 접근성 이름을 붙였습니다.
- [MakeOptions.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/make/MakeOptions.tsx) — MR 방식 문구를 고쳤습니다.
- [ModelRow.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/ModelRow.tsx) — 취소 버튼을 위험 동작 테두리 스타일로 바꿨습니다.
- [PrepareScreen.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/PrepareScreen.tsx) — 다시 불러오기 버튼에 테두리 스타일을 적용했습니다.
- [App.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/App.tsx) — 탭과 엔진 재시작의 보조 버튼에 테두리 스타일을 적용했습니다.
- [jobStream.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/jobStream.ts) — 종료 상태 스냅샷을 받으면 연결을 닫습니다.
- [make.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/make.test.ts) — 단계, 캐시, 경로·가사 선택, 결과 보존을 검증합니다.
- [jobStream.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/jobStream.test.ts) — 종료 상태인 첫 스냅샷에서 연결이 닫히는지 검증합니다.

### 2. 판단 사항

반복되는 저장 단계 사이에 정렬이 대기로 돌아가지 않도록, 현재 단계와 관측한 가장 먼 단계 위치를 함께 사용했습니다. 탭이 비활성화된 동안에도 만들기 작업 구독을 유지해 그 위치와 종료 결과를 놓치지 않도록 했습니다.

입력 변경 시 사용자가 선택한 출력 폴더와 확장자는 유지하고 파일명만 새 입력 기준으로 바꿉니다. 이전 입력이 없거나 같은 파일을 다시 선택한 경우에는 기존 선택을 유지합니다.

### 3. 빈틈/TODO

GUI 확인은 호출 세션에서 수행합니다. Python 게이트는 이번 작업에서 Python을 수정하지 않아 생략했습니다. 작업 시작 전부터 존재하던 README와 Python 변경은 그대로 두었습니다.

### 4. 검증

- `pnpm typecheck`: **EXIT=0**
- `pnpm lint`: **EXIT=0**
- `pnpm test`: **EXIT=0** — 테스트 9개 파일, 53개. 마지막 결과 줄: `Duration 1.42s (tests 87%, transform 7%, import 5%, worker 1%)`
- `pnpm build`: **EXIT=0**

린트의 첫 병렬 실행은 빌드의 임시 설정 파일과 경합해 `EXIT=2`였으며, 이후 단독 실행에서 `EXIT=0`이었습니다.