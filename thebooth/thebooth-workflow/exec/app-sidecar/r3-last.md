r3 변경을 반영했고 지정된 검증을 마쳤습니다. `feat/app-sidecar`를 유지했으며 커밋은 만들지 않았습니다.

### 1. 항목별 변경

1. **ffmpeg 격리:** stdin을 `DEVNULL`로 연결하고 렌더에 `-nostdin`을 추가했습니다. 자식 환경에서 토큰을 제외했습니다. [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py), [tools.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/tools.py)
2. **계산 결과 보존:** 음높이와 유효한 정렬 결과를 캐시에 저장한 뒤 취소를 확인합니다. [pitch.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pitch.py), [align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/align.py), [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py)
3. **CLI 출력:** 모델 다운로드 진행을 stdout으로 복원하고, `make` 진행은 stderr로 유지했습니다. [progress.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/progress.py), [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py)
4. **검사 재사용:** 서버가 `PreparedMake`를 작업에 전달하고, 실행 직전에는 필요한 파일의 존재와 크기를 다시 확인합니다. [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py), [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py)
5. **실패 시 부분 결과:** 렌더 실패 이벤트와 스냅샷에도 이미 생성한 파일 및 ASS 백업 경로를 담습니다. [jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/jobs.py), [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py)
6. **견고성·문서:** 부모 감시를 사용할 수 없으면 경고 후 계속 실행합니다. 완료 작업은 종료 순서 기준 최근 100개를 유지하며 앱과의 계약을 문서화했습니다. [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py), [jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/jobs.py), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)

추가 검증은 [test_sidecar_r3.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_sidecar_r3.py)에 담았습니다.

### 2. 판단 사항

`make`의 사전 검사 오류 문구와 종료 코드는 유지했습니다. 큐 대기 후 재확인은 요청대로 파일 존재·크기 수준으로 수행합니다. 합성 자막 MP4는 변경 전과 바이트가 일치했습니다.

### 3. 빈틈/TODO

Windows 실기기 검증은 하지 않았습니다. `CREATE_NO_WINDOW` 전달은 플랫폼 분기 테스트로 확인했습니다.

### 4. 검증

- `ruff check`: `EXIT=0`
- `ruff format --check`: `EXIT=0`
- `mypy`: `EXIT=0`
- `pytest`: `EXIT=0`

pytest 마지막 줄: `328 passed, 3 warnings in 50.90s`

skip 목록: 없음.