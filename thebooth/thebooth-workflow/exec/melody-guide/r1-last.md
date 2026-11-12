멜로디 가이드를 구현했고, 지정된 네 검증 명령은 모두 `EXIT=0`으로 끝났습니다. 실제 모델을 사용하는 slow 테스트도 실행됐으며 skip은 없었습니다.

### 1. 변경 파일

- [pitch.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pitch.py) — FCPE·RMVPE 음높이 추출과 FCPE 동봉 가중치 해시 검사를 추가했습니다.
- [rmvpe_model.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/rmvpe_model.py) — RMVPE 추론 코드와 가중치 strict 로드를 추가했습니다.
- [melody.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/melody.py) — f0 음표화, 키 변경 합성, 보컬 대비 가이드 음량 조절을 추가했습니다.
- [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py) — 가이드 생성·믹스와 추출기 주입을 연결했습니다.
- [cache.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cache.py) — 음표 JSON 캐시의 원자적 저장과 손상 캐시 처리를 추가했습니다.
- [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py) — 가이드 옵션, 입력 검증과 완료 메시지를 추가했습니다.
- [manifest.json](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/manifest.json) — 고정 리비전의 RMVPE 모델을 추가했습니다.
- [models.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/models.py) — 모델 구조 설명에 RMVPE를 반영했습니다.
- [pyproject.toml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/pyproject.toml) — 의존성과 mypy override를 추가했습니다.
- [uv.lock](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/uv.lock) — 의존성 잠금 정보를 갱신했습니다.
- [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md) — 사용 예시, 옵션, 모델 용도와 FCPE 가중치 방식을 설명했습니다.
- [test_melody.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_melody.py) — 음표화·합성·가이드 음량 테스트를 추가했습니다.
- [test_pitch.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_pitch.py) — 해시 검증과 실제 추출기 테스트를 추가했습니다.
- [test_guide_pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_guide_pipeline.py) — 파이프라인·캐시·CLI 테스트를 추가했습니다.
- [test_models.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_models.py) — RMVPE manifest 고정값 테스트를 추가했습니다.

### 2. 판단 사항

- 10ms 입력에서 RMVPE의 STFT 반사 패딩 오류가 재현돼, 짧은 입력을 패딩한 뒤 원래 프레임 수로 잘랐습니다.
- 가이드가 꺼진 경우 기존 CLI 출력을 유지하기 위해 가이드 완료 줄은 켜진 경우에만 표시했습니다.
- FCPE 패키지의 로드 정보는 진행 표시와 함께 stderr로 보냈습니다.

### 3. 빈틈/TODO

- 실제 반주기 USB 재생과 실곡 청취는 수행하지 않았습니다. 호출 세션에서 확인해야 합니다.
- pytest 경고 3건은 기존 RoFormer 테스트에서 나온 PyTorch STFT 경고와 deprecated API 경고입니다.

### 4. 검증

- `uv run ruff check .` — `EXIT=0`
- `uv run ruff format --check .` — `EXIT=0`
- `uv run mypy` — `EXIT=0`
- `uv run pytest -q` — `EXIT=0`

pytest 마지막 줄: `104 passed, 3 warnings in 34.06s`