여섯 항목을 반영했고, 지정된 네 검증 명령은 모두 `EXIT=0`으로 끝났습니다. slow 테스트를 포함해 skip은 없었습니다.

### 1. 항목별 변경

1. **캐시 경로** — [cache.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cache.py)에 추출기 키의 12자 해시 디렉터리와 JSON 원문 키 확인을 적용했습니다. 경로 길이와 충돌 방어 테스트를 추가했습니다.
2. **FCPE 음역 처리** — [pitch.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pitch.py)에서 추론기의 `f0_min`·`f0_max` 인자를 제거하고 공통 마스킹을 사용했습니다. 1300·50·440Hz 가짜 출력 테스트를 추가했습니다.
3. **추론 설정 캐시 키** — 샘플레이트, hop, FCPE 디코더와 보간 설정을 키에 포함하고 [테스트](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_pitch.py)를 확장했습니다.
4. **분리 전 준비 확인** — [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py)에서 오디오를 읽기 전에 실제 추출기의 준비 상태를 확인합니다. 가짜 추출기 주입 경로는 확인을 건너뜁니다.
5. **가이드 꺼짐 회귀** — [파이프라인 테스트](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_guide_pipeline.py)에 키 0·2의 배열 비교와 새 프로세스의 지연 import 검사를 추가했습니다.
6. **정리** — [models.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/models.py)로 설치 확인을 옮기고 기존 예외 import를 유지했습니다. 가이드가 꺼지면 음량 검증을 건너뛰며, [melody.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/melody.py)는 짧은 음표를 먼저 버리도록 바꾸고 캐시 버전을 2로 올렸습니다.

### 2. 판단 사항

- FCPE 가중치 해시는 사전 준비 확인 때 검사하고, 캐시 미스로 모델을 로드할 때 다시 검사합니다.
- Windows 캐시 루트와 20자 사용자명을 가정한 최장 조합의 경로는 FCPE·RMVPE 모두 189자였습니다.
- 캐시 경로와 음표 처리 버전이 바뀌므로 이전 음표 캐시는 재사용되지 않습니다.

### 3. 빈틈/TODO

- Windows 경로 길이는 계산으로 검증했으며 실제 Windows 실행은 확인하지 않았습니다.
- pytest 경고 3건은 기존 RoFormer 테스트의 PyTorch 경고입니다.

### 4. 검증

- `uv run ruff check .` — `EXIT=0`
- `uv run ruff format --check .` — `EXIT=0`
- `uv run mypy` — `EXIT=0`
- `uv run pytest -q` — `EXIT=0`

pytest 마지막 줄: `136 passed, 3 warnings in 39.58s`