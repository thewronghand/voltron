1. **항목별 변경 요약**
   - 사전 검사: MR 방식, 음높이 추출기, 남/여 전환 오류에 입력값을 최대 40자까지 표시합니다. CLI와 서버가 같은 문구를 쓰고, CLI의 `보컬 분리 중...` 안내도 유지했습니다. [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py), [keys.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/keys.py), [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py), [validation.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/validation.py)
   - 렌더: 오디오 파일에서 읽은 길이를 배경과 진행률에 사용하고 `-shortest`를 제거했습니다. 실제 ffmpeg로 반복 렌더의 바이트와 프레임 수를 검사했습니다. [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py), [test_video_render.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_render.py)

2. **판단 사항**  
   오디오 길이를 읽을 수 없으면 렌더를 시작하기 전에 오류로 처리합니다. MR·ASS 생성과 쓰기 로직은 변경하지 않았습니다.

3. **빈틈/TODO**  
   이번 렌더 검증은 합성 음원으로 수행했습니다. 실곡 반복 렌더와 반주기 재생은 확인하지 않았습니다.

4. **검증**
   - `ruff check`: EXIT=0
   - `ruff format --check`: EXIT=0
   - `mypy`: EXIT=0
   - `pytest -q -rs`: EXIT=0, skip 없음

   pytest 마지막 줄: `343 passed, 3 warnings in 52.84s`