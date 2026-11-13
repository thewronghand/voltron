리뷰 지적 4건을 반영했습니다. 기존 미커밋 변경은 유지했고 커밋하지 않았습니다.

1. [곡 상세](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx:67)는 같은 작업 ID의 서버 종료 스냅샷을 멈춘 SSE 상태보다 우선합니다. 서버가 작업 종료를 보고하면 화면의 **“만들기 진행 중”**은 **“만들기 완료·실패·취소됨”**에 해당하는 상태로 바뀌고, `song.job`이 없으면 오래된 SSE 상태만으로 입력을 막지 않습니다.
2. [가사 편집기](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/LyricsEditor.tsx:102)에 일본어 **가사 형식** 선택을 추가했습니다. **자동 판별 / 원문·발음·번역 세 줄 / 한 줄이 한 블록** 중 선택할 수 있습니다. 자동 판별 미리보기는 기존 `N블록 · 원문·발음·번역 세 줄 형식`에서 `N블록 · 자동: 원문·발음·번역 세 줄 형식`으로 바뀝니다. 선택값은 파싱 요청과 `editor.json`에 저장·복원합니다.
3. [기존 편집 상태 복원](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/library.py:619)에서 저장된 결정 수와 현재 파싱 블록 수가 다르면 결정을 복원하지 않고 수정된 상태로 둡니다. 따라서 타이밍 이동은 다시 저장하기 전까지 열리지 않습니다.
4. 형식이 한 줄이 되거나 언어가 바뀌면 루비 선택을 끕니다. 보조 파일 복원 시 루비 비교도 블록 수가 같을 때만 수행합니다.

형식값이 없는 기존 `editor.json`은 `auto`로 복원합니다. 에디터 파일 없이 가사 파일만 있는 경우에는 보관된 파일 구조에 따라 한 줄 또는 일본어 세 줄 형식을 선택했습니다. 일본어 외 언어는 요청 형식과 관계없이 한 줄이 한 블록입니다.

변경 파일은 위 화면·복원 파일과 [가사 파서](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics_editor.py:107), [서버](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py:106), [앱 API](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/api.ts:58), [편집 로직](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/lyricsEditorLogic.ts:35), [README](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md:300)입니다. 관련 Python·앱 테스트도 추가했습니다.

| 게이트 | EXIT |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` 재실행 | 0 |
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` 재실행 | 0 |
| `pnpm build` | 0 |

pytest는 최종 실행에서 450개 실행, 11개 건너뜀, PyTorch 경고 1건이었습니다. 첫 전체 실행은 기존 사이드카 테스트의 API 응답 10초 시간 초과로 `EXIT=1`이었고, 해당 테스트 단독 실행과 전체 재실행은 각각 `EXIT=0`이었습니다. 앱 테스트는 임시 uv 캐시를 지정해 141개를 실행했습니다.

실제 Electron E2E는 이번 변경 후 실행하지 않았습니다. 범위 밖인 기존 [lyrics.mjs](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-workflow/exec/lyrics-editor/e2e/lyrics.mjs:55)의 고정 정규식은 새 `자동:` 문구를 허용하도록 조정이 필요합니다.