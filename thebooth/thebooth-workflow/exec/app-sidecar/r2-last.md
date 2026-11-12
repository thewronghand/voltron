요구사항 정정과 종료·취소 관련 변경을 반영했습니다.

### 1. 항목별 변경

- **0 — CORS:** 허용 출처의 preflight에 토큰 없이 204를 반환하고, `null` 출처를 거부합니다. 실제 요청은 인증을 유지합니다. [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py)
- **1 — 부모 종료:** stdin EOF로 작업 취소와 서버 종료를 시작합니다. Windows ffmpeg 실행에 `CREATE_NO_WINDOW`를 적용했습니다. [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py), [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py), [tools.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/tools.py)
- **2 — 취소 가시성:** 취소 요청 메시지와 `cancel_requested`를 추가하고, 진행 이벤트를 1% 단위로 줄였습니다. `BaseException` 이후에도 작업자가 계속 실행되며 종료 중 작업 생성은 503을 반환합니다. [jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/jobs.py)
- **3 — 쓰기 후 취소:** MR·보컬 쓰기를 마친 뒤 취소를 확인하고, 생성된 경로와 ASS 백업을 `partial`에 남깁니다. 분리 캐시는 취소 확인 전에 저장합니다. [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py), [progress.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/progress.py)
- **4 — 검사 단일화:** CLI가 공통 사전 검사를 한 번 실행하고 그 결과를 파이프라인에 전달합니다. [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py), [keys.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/keys.py)
- **5 — CLI 출력:** 콘솔에서는 Demucs tqdm을 다시 표시하고, ffmpeg 오류 상세의 줄바꿈을 복원했습니다. [separate.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/separate.py), [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py)
- **6 — 경로·인증:** 요청 경로를 절대 경로로 제한하고 Bearer 스킴의 대소문자를 구분하지 않습니다. Windows 바인딩에는 `SO_EXCLUSIVEADDRUSE`를 설정합니다. [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py)
- **7 — 테스트:** 실제 자식 프로세스의 종료·강제 종료, stdin EOF와 SIGTERM, SSE 기록 상한 이후 재연결, 부분 결과와 preflight를 검증했습니다. [test_server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_server.py), [test_progress_sidecar.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_progress_sidecar.py), [test_jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_jobs.py)

### 2. 판단 사항

서버는 큐에 넣기 전 모델 설치를 확인하고, 작업 실행 시에도 사전 검사를 수행합니다. CLI는 준비된 검사 결과를 재사용합니다. 합성 입력으로 비교한 MR·보컬 MP3와 자막 MP4의 바이트는 변경 전과 같았습니다.

### 3. 빈틈/TODO

Windows 실기기 검증은 하지 않았습니다. 다음 Electron 작업에서는 Windows에서 사이드카를 강제 종료할 때 ffmpeg를 포함한 프로세스 트리를 정리해야 합니다. 이 계약과 취소 지점이 없는 처리 구간, 5초 종료 대기의 한계는 [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)에 적었습니다.

### 4. 검증

- `ruff check`: `EXIT=0`
- `ruff format --check`: `EXIT=0`
- `mypy`: `EXIT=0`
- `pytest`: `EXIT=0`

pytest 마지막 줄: `302 passed, 3 warnings in 51.69s`

skip 목록: 없음.