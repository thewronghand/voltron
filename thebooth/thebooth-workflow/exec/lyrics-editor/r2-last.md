곡 상세가 작업 종료 후 서버 상태를 다시 읽도록 수정했습니다. 코드에서 종료 상태를 놓치거나 오래된 곡 응답이 최신 응답을 덮는 경합을 재현했습니다. 다만 당시 SSE와 응답 순서 로그가 없어, 실측된 34분 대기에서 어느 경합이 발생했는지는 단정할 수 없습니다.

확인한 원인과 수정 내용은 다음과 같습니다.

- 기존 `useJob`은 구독 알림에서만 완료 콜백을 호출했습니다. 이미 종료된 공유 스트림의 스냅샷을 뒤늦게 읽으면 곡 재조회가 빠집니다. 현재는 [useJob](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/hooks/useJob.ts:18)의 상태 변화와 [SongDetail](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx:67)의 종료 스냅샷을 기준으로 작업별 한 번 갱신합니다. 새 SSE 연결의 **첫 종료 스냅샷**은 기존 코드에서도 처리됐습니다.
- 작업 시작 직후 조회와 종료 후 조회가 겹치면, 먼저 시작한 오래된 응답이 나중에 도착해 완료 상태를 덮을 수 있었습니다. [요청 순서 관리](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx:21)로 이를 막았습니다. 서버가 확인한 요청 ID도 해제해 이후 `last_job`을 가리지 않게 했습니다.
- 서버가 `song.job`을 보고하는 동안에는 조회 완료 후 5초 간격으로 다시 읽습니다. 작업 종료나 언마운트 시 중단하며, 숨겨진 상세 화면에서도 동작합니다.
- [가사 편집기](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/LyricsEditor.tsx:36)에서는 이전 복원이 대기 중일 때 새 가사를 저장하고 예전 내용으로 되돌리면 `dirty`가 잘못 해제되는 별도 문제를 고쳤습니다. 일반적인 저장 직후 `dirty` 계산은 수정 전에도 기대대로 동작했습니다.

결정적 회귀 테스트 17개를 추가했습니다. 초기 15개를 수정 전 코드에 적용한 변이 실행에서는 10개가 기대 결과와 달랐고, 정상 저장 직후 비교와 새 연결의 첫 종료 스냅샷을 포함한 5개는 기존에도 기대대로 동작했습니다. 추가한 시작 직후·종료 후 응답 순서 테스트도 수정 전 코드에서 오래된 `stale` 상태가 남는 것을 확인했습니다. 테스트는 React 훅 실행을 모의하고 SSE와 시간을 제어합니다.

| 지정 게이트 | EXIT |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |

pytest는 443개 실행, 11개 건너뜀, PyTorch 경고 1건이었고 앱 테스트는 131개 실행됐습니다. 실제 Electron E2E는 지정 스크립트가 사용자 `Downloads/yt-test`를 읽고 쓰므로 실행하지 않았습니다. 기존 미커밋 변경은 유지했고 커밋하지 않았습니다.