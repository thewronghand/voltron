r2의 Python 보관함 보완과 앱 화면 개편을 마쳤습니다. 기존 미커밋 변경 위에서 작업했으며 커밋하지 않았습니다.

**변경 파일**

- Python 코어·API: [library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/library.py), [cache.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cache.py), [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py), `jobs.py`, `paths.py`, `pipeline.py`
- 앱 화면: [App.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/App.tsx), `features/prepare/appView.ts`, `features/songs/`의 목록·상세·내보내기·진행 표시와 상태 로직
- 앱 연결: [api.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/api.ts), `jobStream.ts`, `main/dataPaths.ts`, `main/fileOptions.ts`, `main/index.ts`, `preload/index.ts`, `shared/ipc.ts`
- 테스트·문서: [test_song_library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_song_library.py), `tests/conftest.py`, `test_server.py`, `test_sidecar_r3.py`, `test_sidecar_r5.py`, `app/tests/`의 API·경로·IPC·작업·준비·사이드카 통합·곡 테스트, [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)

**화면 구성**

- 곡 목록에서 상태·진행률·가사 유무·추가 날짜를 보여주고, 파일 선택 또는 끌어다 놓기로 곡을 추가합니다. 준비되지 않은 실행 환경은 준비 화면을 먼저 표시합니다.
- 곡 상세에서 제목, 원곡 정보, 분리 모델·가라오케 모드·추출기·가사를 관리하고 만들기 진행과 마지막 오류를 확인합니다. 화면을 떠난 뒤 돌아오면 곡의 작업에 다시 연결합니다.
- 내보내기에서 MP3·MP4, 여러 키와 남녀 전환, 가이드 음량, MR 방식, 보컬 저장과 폴더를 선택합니다. 진행·취소 후 결과 파일과 남은 파일을 표시합니다.
- 삭제는 확인 후 서버의 삭제 보관함으로 옮기고, 곡 id만 받는 IPC로 OS 휴지통에 보냅니다. 휴지통 이동에 실패하면 곡이 목록에서 빠진 상태임을 안내합니다.

**제거 및 판단 사항**

기존 `features/make/` 화면, `makeJob`·`MakeRequest` 클라이언트, `/jobs/make`와 그 전용 테스트를 제거했습니다. CLI `make`와 `pipeline.make`는 유지했습니다.

손상된 스템은 해당 단계만 낡은 결과로 처리합니다. 목록 조회에서는 원곡 전체 해시 대신 크기와 수정 시각을 비교하고, 만들기·내보내기 실행 시 해시를 확인합니다. 이전 곡에 수정 시각이 없으면 만들기에서 원곡을 재검증한 뒤 내용이 같을 때 기존 결과를 재사용합니다. 최근 작업과 오류는 서버 메모리에 보관하므로 서버 재시작이나 작업 기록 정리 후에는 사라집니다.

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

Python 테스트는 344건 실행, 11건 건너뜀, 경고 1건이었고 앱 테스트는 81건 실행됐습니다. uv 캐시는 권한이 허용된 임시 폴더를 사용했습니다.

모의 사이드카를 연결한 브라우저에서 목록·상세·키 추가·폴더 선택을 확인했습니다. 패키징 앱과 배포 명령은 실행하지 않았으며, 실제 음원·반주기 및 Windows 실기 동작은 확인하지 않았습니다.