Python 코어 분리, 곡 보관함, 곡 API와 다중 변형 내보내기를 구현했습니다. `app/`과 `pyproject.toml`은 수정하지 않았고 커밋하지 않았습니다.

**변경 파일**

- 코어·저장 경로: [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py), [cache.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cache.py), [paths.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/paths.py)
- 보관함·API·작업 결과: [library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/library.py), [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py), [jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/jobs.py)
- 검증·문서: [test_song_library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_song_library.py), [conftest.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/conftest.py), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)

**단계 경계와 CLI 보존**

분리, 음표 추출, 정렬, MR·가이드 합성, 자막 쓰기, 영상 렌더를 공통 함수로 분리했습니다. CLI `make`는 기존 캐시 조회·저장, 단계 보고, 취소 확인, MP3 저장 후 정렬·영상 렌더 순서를 유지합니다.

합성 입력과 주입 처리기로 기존 코드와 비교했을 때, 캐시 미적중·적중 모두 MR·보컬·ASS·주입 영상의 SHA-256과 진행 이벤트 순서가 같았습니다. 기존 `/jobs/make` 테스트도 수정 없이 실행했습니다.

**곡 API**

| 요청 | 본문·응답 |
|---|---|
| `GET /songs`, `GET /songs/{id}` | 목록 또는 상세. `status`에 단계별 `none\|ready\|stale`, `job`에 대기·실행 중 작업 또는 `null` |
| `POST /songs` | `{"source_path":"절대 경로","title":"선택"}` → 201, 곡 상세 |
| `PATCH /songs/{id}` | `title`, `make_settings`의 `model_id`, `pitch_extractor`, `lyrics_lang` → 곡 상세 |
| `PUT /songs/{id}/lyrics` | `lyrics_path`, 선택 `lyrics_extra_path`, `lyrics_lang` → 곡 상세 |
| `DELETE /songs/{id}/lyrics` | 가사와 정렬 결과 삭제 → 곡 상세 |
| `POST /songs/{id}/make` | 202, `{"job_id":"..."}` |
| `POST /songs/{id}/export` | `formats`, `variants`, `guide`, `guide_level_db`, `mr_method`, `save_vocals`, `output_dir` → 202, `job_id` |
| `DELETE /songs/{id}` | 삭제 보관함으로 이동 → `{"deleted_path":"..."}` |

같은 곡에 대기·실행 중 작업이 있으면 새 작업과 삭제를 409로 거부합니다. 만들기 중 가사 변경도 409로 막아 처리 중인 입력이 바뀌지 않도록 했습니다. 내보내기는 작업 시작 시 파일 묶음의 빈 번호를 고르고, 완료된 파일은 취소·실패 시 `partial`에 남깁니다.

**게이트**

| 명령 | EXIT |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` | 0 |
| `cd app && pnpm test` | 0 |

Python 테스트는 369건 실행, 11건 건너뜀, 경고 1건이었고 앱 테스트는 95건 실행됐습니다. 테스트 데이터 경로는 임시 폴더로 격리했습니다.

실제 폭탄마 음원·실제 모델·반주기에서의 바이트 및 재생 검증은 수행하지 않았습니다. 삭제한 곡은 `.deleted`로 이동하며 OS 휴지통 처리는 다음 라운드 범위로 남아 있습니다.