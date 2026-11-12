요청한 1~8번을 반영했습니다.

### 1. 항목별 변경

1. [lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics.py): 루비 가중치를 오른쪽부터 매칭하고 `・`를 가중치에서 제외했습니다.
2. [lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics.py): 두 파일의 UTF-8 BOM을 제거하고, 인코딩 오류에 파일 역할과 경로를 표시합니다.
3. [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py): 정렬 텍스트를 가사와 줄별로 대조하고 불일치 시 위치만 표시합니다.
4. [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py): 같은 위치의 블록이 겹치지 않도록 표시·퇴장 시각을 조정합니다.
5. [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py), [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py): 줄별 글꼴 크기를 조정하고 최소 크기에서도 넘치는 줄 수를 결과에 담습니다.
6. [align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/align.py), [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py): 경고 종류·개수와 짧은 단어 비율로 실패를 감지하고 실패 결과를 캐시하지 않습니다.
7. [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py), [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md): 변경된 기존 ASS를 백업하고 경로를 알립니다.
8. [output.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/output.py), [tools.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/tools.py), [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py): 출력 권한에 umask를 적용하고 환경변수 정리와 subprocess 제한 시간을 추가했습니다.

각 항목의 회귀 테스트도 추가했습니다.

### 2. 판단 사항

이전 정렬 캐시에는 실패 경고 기록이 없어 새 기준을 확인할 수 있으므로 캐시 버전을 올렸습니다. 같은 초에 백업 이름이 충돌하면 기존 백업을 보존하도록 다음 초의 빈 이름을 사용합니다.

같은 위치의 뒤 블록이 앞 블록의 마지막 글자보다 먼저 끝나 두 블록을 모두 끝까지 표시할 수 없는 경우에는 위치 오류를 냅니다.

### 3. 빈틈/TODO

이번 게이트에서 실제 Whisper 모델 로드와 ffmpeg 렌더를 실행했습니다. 실제 곡의 재정렬과 반주기 MP4 재생은 이번 실행에서 확인하지 않았습니다.

### 4. 검증

- Ruff 검사: **EXIT=0**
- Ruff 서식 검사: **EXIT=0**
- mypy: **EXIT=0**
- pytest: **EXIT=0**, skip 0
- pytest 마지막 줄: `219 passed, 3 warnings in 46.35s`