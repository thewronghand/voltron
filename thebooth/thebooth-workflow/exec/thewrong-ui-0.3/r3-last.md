r3 요청을 반영했고, 최종 게이트 8개는 모두 `EXIT=0`입니다. 커밋하지 않았습니다.

### 변경 파일

- [LyricsEditor.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/LyricsEditor.tsx)
- [TimingEditor.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/TimingEditor.tsx)
- [lyricsEditorLifecycle.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/lyricsEditorLifecycle.test.tsx)
- [confirmationScreens.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/confirmationScreens.test.tsx)
- [timingConfirmation.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/timingConfirmation.test.tsx)

### 항목별 처리와 판단

1. 타이밍 확인 중 `busy=true`로 바뀌면 창이 닫히고 현재 블록이 유지되는 테스트를 추가했습니다.
2. 이전 렌더의 지우기 콜백은 이전 `pending` 값을 보므로, 진행 중 요청을 ref로 확인하도록 보완했습니다. 지우기 확인 중 이전 저장 콜백도 실행되지 않게 했습니다.
3. 가사 확인 취소 의존성에서 `pending`, `step`을 제거했습니다. 저장과 확인이 서로 배타적이고, 지우기 확인은 0단계에서만 열리기 때문입니다. `text`는 늦게 끝나는 파일 읽기, `language`·`format`은 먼저 시작한 서버 재조회로 바뀔 수 있어 유지했습니다. `api`, 곡 ID·가사 유무, `busy`, `visible`도 유지하거나 추가했습니다.

   타이밍에서는 확인 중 다른 선택이 막히는 `index`를 제거했습니다. 늦은 서버 응답의 `rows`, 포인터 캡처 이동의 `chars`, 이전 저장 콜백의 `pending`은 실제 경합을 재현해 유지했습니다. `api`, `songId`, `busy`, `visible`도 유지하거나 추가했습니다.
4. 타이밍 저장 중 블록 목록 버튼에 `disabled`와 비활성 표시를 적용했습니다.

### 변이 결과

각 변이 테스트는 `EXIT=1`로 실패했고 구현을 복원했습니다.

- 가사 저장 중 가드를 제거하거나 이전 렌더의 `pending` 검사로 되돌리면 이전 지우기 콜백 테스트가 실패했습니다. 확인 중 이전 저장 콜백을 막는 가드를 제거해도 해당 테스트가 실패했습니다.
- 양쪽 확인 취소 effect에 남긴 상태·prop 의존성을 각각 제거하면 대응하는 연결 변경, 곡 변경, 서버 응답, 파일 읽기, 포인터 이동, 저장·작업·숨김 테스트가 실패했습니다.
- 타이밍 목록의 `disabled={pending}`을 제거하면 저장 중 블록 이동 테스트가 실패했습니다.

### 사용자에게 보이는 변화

타이밍 저장 중 이전에는 블록 목록 버튼이 활성처럼 보였지만 클릭을 무시했습니다. 이제 버튼이 흐려지고 비활성화됩니다. 저장과 가사 지우기 확인이 겹치는 이전 콜백 경합도 차단됩니다.

### 게이트

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

레포 내부 임시 uv 캐시를 사용하고 종료 후 삭제했습니다. Python 테스트는 450개 실행·11개 건너뜀·경고 1건, 앱 테스트는 213개 실행됐습니다.