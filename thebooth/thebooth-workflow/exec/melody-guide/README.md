# melody-guide — Codex executor 기록

| 라운드 | 모델·effort | 소요 | 토큰 | 게이트 | 리뷰 |
|--------|-------------|------|------|--------|------|
| r1 | gpt-6.1-terra max (priority) | 7분 37초 | 175,700 | ruff·format·mypy·pytest(104) EXIT=0, 메인 재실행 동일 | 1차 PASS (MEDIUM 3·LOW 5) → 메인 반영 후 2차 FAIL (HIGH 1·MEDIUM 4) |
| r2 (resume) | gpt-6.1-terra max (priority) | 3분 59초 | 251,407 | pytest(136) EXIT=0, 메인 재실행 동일, 변이 2종 검출 | 3차 PASS (MEDIUM 3·LOW 4) |

- r1 session id: `01a1ced6-49d3-7ae3-9d3d-95852f990174`
- 판단 사항(executor 보고): RMVPE 짧은 입력 반사 패딩 오류 회피용 패딩 후 자르기, 가이드 off 시 CLI 출력 불변, FCPE 로드 로그 stderr.

## 리뷰 1차 반영 (메인 직접 — 4파일·소규모)

- MEDIUM `--guide-level nan` 통과 → `pipeline.make`에서 `not MIN <= x <= MAX`로 검사(NaN 포함), 상수를 CLI와 공유. 변이 확인: `or` 형태로 바꾸면 NaN 테스트 실패.
- MEDIUM FCPE `f0_min`이 버려지는 uv에만 쓰이고 `f0_max`는 자르기만 함(torchfcpe 0.0.4 `models_infer.py:83-90` 실측) → 두 추출기 공통 60~1200Hz 마스킹. 변이 확인.
- MEDIUM 추론 설정이 캐시 키에 없음 → `extractor_key`에 threshold·입력 피크·f0 범위 포함.
- LOW `--guide` 없이 준 `--pitch`·`--guide-level` 경고, librosa `<1.1` 상한, README에 가이드로 인한 MR 레벨 하락 안내.
- 미반영 LOW: synth·to_notes 경계 테스트 추가, 키 변경 시 MR·가이드 시간 정렬 테스트, 가이드 off 바이트 동일 회귀 테스트 — 재리뷰 판단에 따름.

## 2차 리뷰 → r2

- HIGH Windows MAX_PATH: 메인이 1차 반영 때 extractor_key에 sha256 전체를 넣어 음표 캐시 경로가 260자를 넘을 수 있었다(사용자명 8자 기준 260). → 디렉터리는 키 해시 12자, 원문은 JSON 안에서 대조. 최장 189자(20자 사용자명 가정).
- MEDIUM FCPE: 메인이 넘긴 `f0_max`가 1200으로 클램프한 뒤 마스킹 → 클램프 제거. **메인 직접 수정이 새 결함 2건을 만들었다** — 리뷰 지적을 반영할 때도 수정 범위가 크면 executor+재리뷰 경로가 안전하다.

## 3차 리뷰 반영 (메인, 3파일 소규모)

- 분리 모델 참조를 음높이 추출 전에 해제(`del separator, factory`) — GPU 메모리.
- 가이드 음량 기본값 상수화(`GUIDE_LEVEL_DEFAULT_DB`).
- CLI는 `--guide` 여부와 무관하게 옵션 값을 검증(오타 즉시 알림), `--guide`가 없으면 적용되지 않음을 안내 — 정책으로 확정하고 README에 명시.
- Windows 미검증 위험(torchaudio 2.11 ↔ torch 2.15) → README에 `import torchfcpe` 첫 확인 절차.
- 미반영 LOW: librosa 버전을 rmvpe 키에 포함, 분리 모델 purpose 검사 중복 정리, medfilt 경계 처리(청취 튜닝 시).
- 최종 게이트: ruff·format·mypy EXIT=0, pytest 136 passed EXIT=0.
