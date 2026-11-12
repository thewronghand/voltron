가사 강제 정렬부터 ASS 자막 생성, MP4 렌더 및 ASS 재렌더 CLI까지 구현했습니다.

### 1. 변경 파일

- [pyproject.toml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/pyproject.toml): stable-ts 고정 의존성과 mypy 예외를 추가했습니다.
- [uv.lock](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/uv.lock): stable-ts와 Whisper 의존성을 고정했습니다.
- [manifest.json](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/manifest.json): Whisper와 macOS arm64 ffmpeg 명세를 추가했습니다.
- [models.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/models.py): 플랫폼 검사와 검증된 zip의 원자적 압축 해제를 추가했습니다.
- [tools.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/tools.py): ffmpeg 경로 선택과 libass 필터 확인을 추가했습니다.
- [lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics.py): 가사·보조 파일 파싱, 짝짓기와 루비 가중치를 구현했습니다.
- [align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/align.py): 명시적 모델 경로를 사용하는 강제 정렬을 구현했습니다.
- [cache.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cache.py): 짧은 해시 경로와 원문 키 대조를 사용하는 정렬 캐시를 추가했습니다.
- [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py): 글자별 채움과 발음·번역 줄을 포함한 ASS를 생성합니다.
- [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py): 안전한 ASS 파일명으로 ffmpeg를 실행하고 MP4를 원자적으로 저장합니다.
- [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py): 사전 검증, 정렬 캐시, ASS 및 영상 렌더를 연결했습니다.
- [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py): 가사 영상 옵션과 `video` 재렌더 명령을 추가했습니다.
- [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md): 사용법, 보조 파일 규칙, 설치 및 라이선스를 설명했습니다.
- [test_lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_lyrics.py): 가사 짝짓기와 오류 위치를 검증합니다.
- [test_align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_align.py): 모델 경로, 정렬 설정과 slow 로드 테스트를 추가했습니다.
- [test_subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_subtitles.py): 자막 타이밍, 발음 가중치, 이스케이프와 글꼴을 검증합니다.
- [test_video_models.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_models.py): 압축 해제, 플랫폼과 ffmpeg 선택을 검증합니다.
- [test_video_render.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_render.py): 렌더 명령과 CLI, slow ffmpeg 테스트를 추가했습니다.
- [test_lyrics_pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_lyrics_pipeline.py): 사전 실패, 주입 경로와 캐시 재사용을 검증합니다.

### 2. 판단 사항

Whisper는 모델을 **파일 경로**로 로드하면 모델별 정렬 헤드를 자동 적용하지 않습니다. 스파이크와 같은 large-v3 정렬 설정을 유지하도록 해당 헤드를 명시적으로 복원했습니다.

가사 줄 번호는 빈 줄을 제외한 순번이 아니라 **원본 파일의 실제 줄 번호**로 보고합니다. 영상 출력이 가사 입력 파일을 덮어쓰는 경로도 거부합니다.

### 3. 빈틈/TODO

Whisper large-v3와 ffmpeg가 미설치라 실제 모델 로드 및 실제 MP4 렌더는 이번 실행에서 확인하지 못했습니다. Windows 실행과 반주기의 MP4 재생도 확인이 필요합니다.

### 4. 검증

- `uv lock --check`: 종료 코드 0
- `uv run ruff check .`: **EXIT=0**
- `uv run ruff format --check .`: **EXIT=0**
- `uv run mypy`: **EXIT=0**
- `uv run pytest -q > /tmp/booth-pytest.log 2>&1`: **EXIT=0**
- pytest 마지막 줄: `189 passed, 2 skipped, 3 warnings in 42.81s`

건너뛴 테스트는 각각 Whisper large-v3 미설치와 ffmpeg 미설치에 따른 slow 테스트입니다.