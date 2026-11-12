요청한 사이드카를 구현하고 지정된 검증을 마쳤습니다. 현재 `feat/app-sidecar` 브랜치를 유지했으며 커밋은 만들지 않았습니다.

### 1. 변경 파일

- [progress.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/progress.py) — 진행 보고와 취소 인터페이스, 콘솔·무출력 구현.
- [jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/jobs.py) — 단일 작업자 FIFO, 취소, 제한된 이벤트 기록.
- [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py) — 인증된 로컬 HTTP API, SSE, CORS와 서버 종료.
- [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py) — 공통 사전 검사와 처리 단계별 진행·취소 연결.
- [separate.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/separate.py) — Demucs 실행 전후 취소 확인.
- [roformer.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/roformer.py) — 구간별 진행 및 취소 확인.
- [pitch.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pitch.py) — 음높이 추출 전후 취소 확인.
- [align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/align.py) — 정렬 전후 취소 및 경고 보고.
- [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py) — ffmpeg 진행률 파싱과 취소 시 프로세스·임시 파일 정리.
- [models.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/models.py) — 바이트 진행, 다운로드 취소·이어받기, 검증 중 취소.
- [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py) — `serve` 명령과 콘솔 진행 보고 연결.
- [pyproject.toml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/pyproject.toml), [uv.lock](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/uv.lock) — 서버·테스트 의존성 추가 및 잠금.
- [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md) — 사이드카 실행, API, 인증과 SSE 설명.
- [fake_ffmpeg.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/fake_ffmpeg.py) — 렌더 테스트용 가짜 프로세스.
- [test_jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_jobs.py) — 대기열, 취소, 오류, 이벤트 및 종료 검증.
- [test_progress_sidecar.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_progress_sidecar.py) — 분리·다운로드·렌더 진행과 취소 검증.
- [test_server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_server.py) — API, SSE, 인증, 사전 검사 및 실제 서버 기동·종료 검증.
- [test_guide_pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_guide_pipeline.py), [test_output_modes.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_output_modes.py), [test_video_render.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_render.py) — 변경된 진행 인자와 ffmpeg 프로세스 방식에 맞게 가짜 객체 조정.

### 2. 판단 사항

모든 요청에 토큰을 요구하는 조건에 맞춰 `OPTIONS` 요청도 인증합니다. ffmpeg 오류 상세는 자막 내용을 포함할 가능성이 있어 작업 이벤트에는 종료 코드만 담았습니다.

합성 입력으로 이전 구현과 비교했을 때 MR·보컬 MP3와 자막 포함 MP4의 바이트가 일치했습니다. 이는 해당 합성 입력에 대한 확인입니다.

### 3. 빈틈/TODO

브라우저의 자동 CORS 사전 요청은 인증 헤더를 붙이지 않으므로, 현재 인증 정책에서는 렌더러가 직접 API를 호출할 수 없습니다. Electron 작업에서 main 프로세스를 통한 HTTP·IPC 연결이 필요합니다. Windows에서는 이번 검증을 실행하지 않았습니다.

### 4. 검증

- `ruff check`: `EXIT=0`
- `ruff format --check`: `EXIT=0`
- `mypy`: `EXIT=0`
- `pytest`: `EXIT=0`, skip 0

pytest 마지막 줄: `281 passed, 3 warnings in 47.42s`