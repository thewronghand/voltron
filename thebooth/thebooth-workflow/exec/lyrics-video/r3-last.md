요청한 1~5번을 반영했습니다.

### 1. 항목별 변경

1. [lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics.py): 보조 원문의 남는 글자를 검사하고, NFKC 비교와 루비 꼬리 짝짓기를 적용했습니다.
2. [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py), [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py): Whisper 언어 코드·이름을 분리 전에 검증하며, 지원하지 않는 언어는 CLI에서 exit 2로 처리합니다.
3. [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py), [tools.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/tools.py): ffmpeg 출력을 UTF-8로 디코딩하고 잘못된 바이트는 대체합니다.
4. [pyproject.toml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/pyproject.toml), [uv.lock](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/uv.lock), [test_align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_align.py): Whisper 버전을 직접 고정하고 실제 모델의 정렬 헤드를 검증합니다.
5. [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py), [align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/align.py), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md): 괄호를 전각으로 바꾸고, 정렬 캐시 저장 순서·오류 메시지·보조 파일 설명을 수정했습니다.

각 변경에 대한 회귀 테스트를 추가했습니다.

### 2. 판단 사항

루비 꼬리를 다음 가사 줄로 흡수하지 않도록, 나머지 보조 단위까지 짝이 맞는 가장 짧은 연속 행 묶음부터 선택합니다. 한자 뒤의 마지막 루비도 허용합니다.

### 3. 빈틈/TODO

한자에 바로 붙은 가나는 표기만으로 루비와 누락된 실제 가사를 구분할 수 없어, 그 형태의 누락은 탐지하지 못할 수 있습니다. 이번 게이트에서는 실제 모델 로드와 ffmpeg 렌더를 실행했으며, 사용자 소유 곡은 다시 정렬하지 않았습니다.

### 4. 검증

- `uv lock --check`: 종료 코드 0
- Ruff 검사: **EXIT=0**
- Ruff 서식 검사: **EXIT=0**
- mypy: **EXIT=0**
- pytest: **EXIT=0**, skip 0
- pytest 마지막 줄: `235 passed, 3 warnings in 43.59s`