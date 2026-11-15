# thewrong-ui-0.5 — `@thewrong/ui` 0.4.0 → 0.5.0 적용 기록

소스 3파일이라 Codex 없이 메인이 직접 구현했다(정본 `guides/codex-executor.md`의 1~4파일 기준).

| 라운드 | 내용 | 앱 테스트 | 리뷰 |
|--------|------|-----------|------|
| 메인 직접 | Stepper `aria-label`, 확인 창 `initialFocus`(취소)·`describedBy`, 체크박스 공용 클래스 정리, 테스트 하네스 `useId` | 224 | PASS (MEDIUM 1·LOW 2) |

- 게이트 8종 EXIT=0(pytest 450 통과·11 건너뜀, 앱 vitest 35파일 224).
- 변이: `initialFocus`·`describedBy`·본문 id·취소 버튼 ref·Stepper `aria-label` 각각 되돌리면 테스트 실패(EXIT=1).

## 0.5.0에서 바뀐 것 (0.4.0 dist와 대조)
- Modal `initialFocus`·`describedBy`, Checkbox input이 박스 위에 겹침(Playwright `check()` 가능, 포커스 링·비활성 커서 내장, 비활성 모양은 없음), Stepper `aria-label`·지난 단계 `skipped`, Radio.Item이 fieldset disabled를 모양에 반영.
- Tabs·Select·Table·Slider는 그대로 — 0.4.0 요청 거리는 하나도 들어가지 않음.

## 사용자 결정 (2026-11-15)
- 권장안대로: 확인 창 첫 포커스는 '취소', 루비 건너뜀은 라벨 유지.
- 리뷰 MEDIUM(체크박스 포커스 링 대비 7.9:1 → 2.6:1)은 라이브러리 링을 받아들이고 토큰 대비 수정을 thewrong-ui에 요청.
- thewrong-ui 요청 8건은 이관 세션에 직접 메시지로 전달.

## 실제 앱 확인 (`e2e/shots.mjs`, 개발 모드 Electron + 빌드한 렌더러, 임시 HOME, 곡 제목 임의 문구) EXIT=0
- 체크박스 '멜로디 가이드': 라벨 글자 클릭·박스 클릭·Playwright `check()`·스페이스 모두 한 번씩만 토글 — `screens/1-checkbox-focus.png`
- 곡 삭제 확인 창: 열자마자 활성 요소 '취소', `aria-describedby` → 본문 문장, Enter = 취소(곡 유지) — `screens/2-delete-confirm.png`
- 가사 탭: `list` 이름 "가사 편집 단계", 현재 단계 붙여넣기, 루비 단계 "루비 확인 (건너뜀)" — `screens/3-lyrics-stepper.png`
- 종료 때 콘솔에 `ERR_CONNECTION_REFUSED` 1건(앱을 닫으며 사이드카가 먼저 내려간 것으로 보임, 확인 단계와 무관).

## 사용자에게 보이는 변화
- 확인 창 4곳(곡 삭제 2곳·가사 지우기·타이밍 버리고 이동): 열 때 포커스가 닫기(X) → '취소'. 스크린리더가 본문을 함께 읽는다.
- 체크박스 전부(곡 추가 설정·내보내기·가사 화면): 키보드 포커스 표시가 indigo-700 테두리 → 라이브러리 violet-400 링(대비 낮아짐, 토큰 수정 요청).
- MR 방식 라디오: 작업 중(fieldset disabled)일 때 비활성 모양으로 보인다(이전엔 모양 그대로).

## 남은 것
- LOW(리뷰): 확인 창 테스트는 연결만 보고 실제 포커스 이동은 실제 앱 확인으로 대신. 루비 체크박스 `mt-1`이 박스 span에 붙어 투명 input이 위로 4px 넓다(기능 문제 없음).
