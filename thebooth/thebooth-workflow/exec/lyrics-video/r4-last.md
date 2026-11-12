요청한 네 항목을 반영했습니다.

### 1. 항목별 변경

1. [lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics.py): 단어 단위 루비를 연속 한자에 나누고, 나머지는 앞쪽 한자부터 배분합니다.
2. [lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics.py), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md): 보조 원문의 기호를 허용하고 짧은 각주 제거를 확장했습니다. 루비 판별의 한계도 함수에 기록했습니다.
3. [lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics.py): 재귀를 명시적 스택으로 바꾸고, 남은 가사·보조 단위의 실제 시작 위치를 오류에 표시합니다.
4. [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py), [align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/align.py): 발음 타이밍에서 문장부호·기호를 제외하고, 모델 로드 오류에 예외 클래스와 재설치 안내를 표시합니다.

[가사](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_lyrics.py), [자막](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_subtitles.py), [정렬](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_align.py) 테스트도 추가했습니다.

### 2. 판단 사항

한자 사이에 공백이나 보조 원문의 부호가 있으면 별도 묶음으로 취급합니다. 반복 탐색은 기존의 짧은 후보 우선 순서를 유지하며, 합성 입력 5,000건으로 결과를 대조했습니다.

### 3. 빈틈/TODO

한자 바로 뒤의 가나는 루비와 누락된 가사를 표기만으로 구분할 수 없습니다. 이번 실행에서는 실제 모델 로드와 ffmpeg 렌더를 검증했으며 실곡은 다시 처리하지 않았습니다.

### 4. 검증

- Ruff 검사: **EXIT=0**
- Ruff 서식 검사: **EXIT=0**
- mypy: **EXIT=0**
- pytest: **EXIT=0**, skip 0
- pytest 마지막 줄: `249 passed, 3 warnings in 48.57s`