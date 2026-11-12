1. **항목별 변경**
   - 외부 MP3: 길이가 추정값이면 청크 단위로 끝까지 읽어 실제 프레임 수를 세고, 읽는 중 취소도 확인합니다. 헤더 없는 합성 MP3로 추정치와 실제 길이가 다른 경우를 검증했습니다. [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py), [test_sidecar_r5.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_sidecar_r5.py), [test_video_render.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_render.py)
   - 공용 문구: 가사 누락과 보컬 경로 충돌 메시지에서 옵션 이름을 제거했습니다. CLI와 서버 응답을 함께 검사했습니다. [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py), [test_lyrics_pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_lyrics_pipeline.py)
   - 입력값 제한: 지원하지 않는 언어와 모델 ID도 오류 문구에서 40자로 제한합니다. [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py), [models.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/models.py)
   - 정리: 다운로드 단위 표시를 복원하고, 필터 확인에 `-nostdin`을 추가했으며, 렌더 단계 중복 시작을 제거했습니다. 없는 작업의 이벤트 조회는 빈 목록을 반환하고, stdin과 SSE 계약을 문서화했습니다. [progress.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/progress.py), [tools.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/tools.py), [jobs.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/jobs.py), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)

2. **판단 사항**  
   정확한 길이가 알려진 합성 WAV·MP3는 이전 길이 계산으로 만든 MP4와 바이트가 같았습니다. 길이 추정이 틀린 외부 MP3는 요청한 길이 수정에 따라 영상 길이와 바이트가 달라집니다. 모델 미설치 시 종료 코드 1과 `실패:`도 유지했습니다.

3. **빈틈/TODO**  
   r5 변경 후 실곡과 반주기 재생은 이 실행에서 확인하지 않았습니다.

4. **검증**
   - `ruff check`: EXIT=0
   - `ruff format --check`: EXIT=0
   - `mypy`: EXIT=0
   - `pytest -q -rs`: EXIT=0, skip 없음

   pytest 마지막 줄: `357 passed, 3 warnings in 51.81s`