r4에서 요청한 타이밍 이동과 확인 창 취소 조건을 수정했고, 지정된 게이트 8개는 모두 `EXIT=0`입니다. 커밋은 하지 않았습니다.

**이번 회차 변경 파일**

- [TimingEditor.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/TimingEditor.tsx:55)
- [SongDetail.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx:99)
- [SongList.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongList.tsx:48)
- 테스트: [timingConfirmation.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/timingConfirmation.test.tsx:88), [confirmationScreens.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/confirmationScreens.test.tsx:103), [confirmation.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/confirmation.test.tsx:240)

**항목별 처리와 사용자에게 보이는 변화**

1. 작업 중 **수정 없는 타이밍 블록**은 이전·다음 버튼과 목록으로 이동할 수 있게 복원했습니다. 수정이 있으면 작업이 끝날 때까지 확인 창을 열지 않고 이동도 하지 않습니다. 작업 중 확인 창을 유지하며 수정본을 버리는 경합을 피하기 위한 선택입니다.
2. 곡 상세 화면을 숨기거나 가사 탭에서 전환할 때, 가사 편집기를 거쳐 타이밍 편집기까지 `visible=false`가 전달되는 테스트를 추가했습니다.
3. 곡 상세와 목록에서 삭제 확인 창이 열린 동안 처리 엔진 연결이 바뀌면 창을 닫고 삭제 요청을 취소합니다. 이전에는 창이 남아 이전 연결로 요청할 수 있었습니다.
4. 이전 렌더의 콜백을 호출하던 테스트를 같은 렌더에서 저장 시작과 이동 시도를 연달아 실행하는 테스트로 바꿨습니다. 이때 저장 상태가 반영되면 열린 확인 창을 취소해야 하므로 `pending` 의존성을 유지했습니다.
5. 목록 갱신으로 삭제 대상이 읽을 수 있게 되면 삭제 버튼이 사라지는 기존 조건에 맞춰 확인 창도 닫습니다.

**변이 검증**

변이는 각각 복원했습니다.

- 작업 중 이동을 무조건 막도록 바꾸면 수정 없는 이동 테스트가, 수정된 블록의 작업 중 가드를 지우면 확인 창을 열지 않는 테스트가 실패했습니다.
- 타이밍 편집기에 `visible=true`를 넘기면 숨김·탭 전환 테스트가 모두 실패했습니다. 가사 편집기 전달값에서 탭 조건을 제거하면 탭 전환 테스트가, 상위 `visible` 조건을 제거하면 숨김 테스트가 실패했습니다.
- 곡 상세와 목록의 API 변경 취소 effect를 각각 제거하면 해당 화면의 연결 변경 테스트가 실패했습니다.
- 목록의 `unreadable` 조건을 제거하면 읽을 수 있게 된 대상의 취소 테스트가 실패했습니다.
- 타이밍 취소 effect에서 `pending`을 제거하면 같은 렌더의 저장 시작·이동 시도 테스트가 실패했습니다.

지시대로 Stepper 건너뜀 표시와 확인 창의 첫 포커스·Enter 동작은 변경하지 않았습니다.

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

Python 테스트는 450건 실행, 11건 건너뜀, PyTorch 경고 1건이 있었습니다. 앱 테스트는 219건 실행됐습니다. 사용한 임시 `uv` 캐시는 제거했습니다.