r2 지적 사항을 반영했습니다. 최종 게이트는 모두 `EXIT=0`이며, 커밋하지 않았습니다.

### r2 변경 파일

- 구현: [ProgressBar.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/components/ProgressBar.tsx), [useConfirm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/components/useConfirm.tsx), [checkboxStyles.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/components/checkboxStyles.ts), [ExportForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/ExportForm.tsx), [LyricsEditor.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/LyricsEditor.tsx), [SongSetupModal.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongSetupModal.tsx)
- 테스트: [confirmation.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/confirmation.test.tsx), [confirmationModal.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/confirmationModal.test.tsx), [confirmationScreens.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/confirmationScreens.test.tsx), [timingConfirmation.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/timingConfirmation.test.tsx), [uiMigration.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/uiMigration.test.tsx)

### 항목별 처리

1. 곡 상세 삭제와 저장된 가사 지우기의 취소·ESC·확인, 상태 변경 중 취소, 이전 콜백과 중복 요청을 화면 컴포넌트 수준에서 테스트했습니다. 타이밍 편집기의 숨김·중복 선택 가드도 테스트했습니다.
2. 두 번째 `confirm()`은 즉시 `false`로 끝나고 첫 요청은 취소 또는 확인으로 완료되는지 검증했습니다. 곡 목록의 `removeTarget`은 삭제 API 처리 중 중복 방지와 대상 소실 감지에도 필요해 유지했습니다.
3. 공용 확인 창의 React 트리에서 `dragover`와 `drop`의 기본 동작과 전파를 막았습니다.
4. 불확정 진행 막대를 라이브러리 `Progress`의 기본 `h-2.5`, `bg-bg-subtle`, `bg-primary`에 맞췄습니다.
5. 반복되던 체크박스 포커스·비활성 클래스는 공용 상수로 모았습니다.
6. 좁은 화면에서 “(건너뜀)”이 잘리지 않도록 Stepper 오버라이드를 유지하고 이유를 주석에 적었습니다. 테스트에서는 라이브러리 내부 목록 이름에 대한 검증을 제거했습니다.

### 변이 결과

각 변이를 적용한 테스트 실행은 예상대로 `EXIT=1`이었고, 이후 원래 코드를 복원했습니다.

- `waiting`, 곡 상세의 `removeRequest`·`active`·`!visible`, 가사의 `clearRequest`·`busy`·`!visible`, 타이밍의 `choosing`·`!visible`을 각각 제거하면 대응 중복·이전 콜백 테스트가 실패했습니다.
- 곡 상세의 숨김·작업·탭 취소 조건과 가사의 숨김·작업·본문 변경 취소 의존성을 각각 제거하면 해당 상태 변경 테스트가 실패했습니다. 타이밍의 숨김 취소도 확인했습니다.
- 곡 목록의 `removeTarget` 가드를 제거하면 삭제 API 대기 중 재요청 테스트가 실패했습니다.
- 모달의 ESC 연결이나 `dragover`·`drop` 전파 차단을 제거하면 해당 테스트가 실패했습니다. 불확정 막대의 높이·트랙 색·채움 색을 각각 되돌리면 일치 테스트가 실패했습니다.

### 사용자에게 보이는 변화와 빈틈

확인 창 위에 파일을 끌어다 놓아도 곡 추가 창이 겹쳐 열리지 않도록 했습니다. 진행률이 숫자와 불확정 상태 사이에서 바뀔 때 막대의 높이와 색은 같게 유지됩니다.

지정대로 모달의 첫 포커스는 헤더 닫기 버튼이고 본문은 `aria-describedby`에 연결하지 않았습니다. 체크박스의 label 내부 div와 라디오 카드 모양도 그대로입니다. ESC와 드롭 테스트는 모의 DOM·훅 하네스에서 실행했습니다. r1에서 보고한 실제 브라우저 화면 검증 제한은 그대로 남아 있습니다.

### 게이트

| 명령 | 최종 EXIT |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |

기본 uv 캐시는 이번 세션의 쓰기 허용 경로 밖이라 첫 실행은 `EXIT=2`였습니다. 레포 내부 임시 캐시를 지정해 다시 실행했고 사용 후 정리했습니다. 앱 테스트에도 같은 캐시를 전달해 처음 건너뛰었던 uv 통합 테스트를 포함해 **199개 실행**했습니다. Python 테스트는 450개 실행, 11개 건너뜀, PyTorch 경고 1건이었습니다.