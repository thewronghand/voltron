**1. 항목별 변경**

- **루비 없는 한자:** 보조 파일이 있으면 루비 묶음에 속하지 않는 한자에 가중치 1을 부여했습니다. 기존 묶음 분배 규칙은 유지하고, 발음 채움까지 테스트했습니다. [lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics.py:108), [test_lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_lyrics.py:203), [test_subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_subtitles.py:49)
- **오수용 한계:** 한자 뒤에 빠진 가나를 루비로 오인할 수 있는 이유와 확인 방법을 지어낸 예시와 함께 문서화했습니다. [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md:93)
- **기타:** 남는 장음 기호의 허용 범위를 제한하고 `ヶ`·`゠` 판정과 줄 연결 정규화를 수정했습니다. 모델 정렬 헤드 복원과 장치 이동 오류도 기존 모델 로드 오류로 감싸고, 일본어 주석을 한국어로 바꿨습니다. [lyrics.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/lyrics.py:75), [align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/align.py:57), [test_align.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_align.py:245)

**2. 판단 사항**

정규화로 여러 한자가 된 글자가 원문의 한 표시 글자에 대응할 때, 같은 루비 없는 묶음에서는 기본 가중치를 한 번만 부여했습니다. 루비 묶음에서 분배 결과가 0인 한자는 기본 가중치로 덮어쓰지 않습니다.

**3. 빈틈/TODO**

한자 바로 뒤의 누락된 가나와 루비는 표기만으로 구분할 수 없습니다. 이 한계는 README에 명시했습니다. 그 외 지시 범위에서 남은 TODO는 없습니다.

**4. 검증**

- `ruff check`: **EXIT=0**
- `ruff format --check`: **EXIT=0**
- `mypy`: **EXIT=0**
- `pytest -q -rs`: **EXIT=0**, skip 0
- pytest 마지막 줄: `265 passed, 3 warnings in 44.85s`