# thewrong-ui-0.3 — `@thewrong/ui` 0.2.0 → 0.3.0 적용 기록

| 라운드 | 내용 | 모델·effort | 토큰 | 앱 테스트 | 리뷰 |
|--------|------|-------------|------|-----------|------|
| r1 | 0.3.0 교체(Progress·Input·Textarea·Checkbox·Radio·Button·Badge·Modal 확인 창·Stepper) | gpt-6.1-terra max (priority) | 467,677 | 172 | PASS (MEDIUM 4·LOW 6) — 확인 창 테스트 빈틈으로 보완 |
| r2 (resume) | 확인 창 테스트 보강, 확인 창 위 드롭 차단, 불확정 막대를 Progress 높이·색으로, 체크박스 클래스 공용화 | 〃 | 573,406 | 199 | FAIL (HIGH 2 — 변이 생존 테스트 빈틈) |
| r3 (resume) | 작업 시작·저장 중 경합 테스트, 바뀔 수 없는 effect 의존성 정리, 저장 중 블록 목록 버튼 비활성 | 〃 | 1,385,063 | 213 | FAIL (HIGH 1 — 효과 없는 대입, 일어날 수 없는 곡 ID 테스트) |
| 메인 직접 | 효과 없는 대입·곡 ID 의존성과 테스트 제거, 테스트 이름을 실제 범위로, 저장 중복 테스트 추가, 타이밍 이동 가드에 busy 추가(→ 회귀) | — | — | 213 | FAIL (HIGH 1 — 메인이 넣은 busy 가드가 작업 중 수정 없는 이동까지 막음) |
| r4 (resume) | busy 회귀 되돌림(수정 있을 때만 막음), visible 연결 테스트, 삭제 확인 창의 api 변경 취소, 대상 곡이 읽을 수 있게 되면 취소 | 〃 | 1,551,790 | 219 | PASS (MEDIUM 1·LOW 3) |

- session id: `01a1de3f-bd38-7252-ab38-bd575ac19191`
- 매 라운드 게이트 8종은 메인이 직접 다시 돌려 EXIT=0 확인(pytest 450 통과·11 건너뜀).
- resume은 `writable_roots`를 받지 않아 Codex가 레포 안 임시 uv 캐시를 쓰고 지웠다(r2·r3).

## 사용자 결정 (2026-11-15)
- 분류: 교체 / 라이브러리에 없어 유지 / 판단 필요. 판단 필요는 권장안대로 — `window.confirm` 4곳은 Modal 확인 창, 가사 단계는 Stepper로 교체. 숫자칸(DecimalInput)·밑줄 텍스트 버튼·인라인 안내 상자(Toast)는 유지.
- 라이브러리 요청 6건은 thewrong-ui 이관 세션에 전달하고, 응답을 기다리는 것과 무관한 부분부터 진행.

## 메인이 실측한 것
- 0.3.0 설치 직후(코드 무변경) typecheck EXIT=0 — 앱이 쓰는 Button·Select·Modal·Table·AnimatedHeight API 호환.
- 0.2.0 우회 정리: E2E가 Modal을 버튼 이름으로 찾던 부분 → `getByRole('dialog')`(0.3.0에 role=dialog). Select 숨은 `<label htmlFor>`와 `w-40` 래퍼는 0.3.0에서도 필요(Select가 aria-label을 버리고 컨테이너가 w-full) → 유지, 주석에 0.3.0 기준 명시.
- 0.3.0 Checkbox는 input을 `sr-only`로 숨기고 label이 감싼다 → Playwright `check()`가 시간 초과, `check({ force: true })`는 상태가 안 바뀜. 실제 라벨 클릭은 정상(체크·해제 확인). E2E는 `launch.mjs`의 `setChecked`(라벨 클릭 후 상태 검사)로 교체(song-library·background-box·lyrics-editor·이 폴더). app-electron·app-packaging 스크립트는 이미 옛 화면('가사 영상') 기준이라 손대지 않음.
- 전후 화면 `screens/before`·`screens/after`(`e2e/shots.mjs`, 개발 모드 Electron + 빌드한 렌더러, 임시 HOME, 가사는 임의 문장).
- 곡 보관함 E2E(`song-library/e2e/library.mjs`) r2 빌드로 재통과(내보내기 10초·9초, 번호 붙이기, 남녀 전환 Select). 덮어쓴 기록 스크린샷은 git 기준으로 되돌림.
- 테스트 기준(r3 뒤 메인 결정): 실제 화면에서 React는 최신 렌더 핸들러를 부르므로 오래된 클로저를 일부러 부르는 경우는 범위 밖, 같은 렌더 두 번 누름·API 대기 중 재호출은 범위 안. 마운트된 채로 바뀔 수 없는 의존성(부모가 key로 다시 마운트하는 곡 ID)은 넣지 않는다.
- 최종(r4): 게이트 8종 EXIT=0(pytest 450·11 건너뜀, 앱 219), 5차 리뷰 변이 46개 모두 테스트가 잡음. 최종 빌드로 `screens/after` 재캡처.
- 남은 것: 리뷰 MEDIUM(작업 중 수정한 타이밍 블록에서 이동 클릭이 표시 없이 무시됨 — 사용자 판단), LOW(fieldset disabled일 때 Radio.Item 커서·hover 남음, useConfirm 계약 주석 없음). 오디오 재생·실제 반주기 확인은 이번 변경과 무관해 하지 않음.

