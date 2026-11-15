# thewrong-ui-0.4 — `@thewrong/ui` 0.3.0 → 0.4.0 적용 기록

| 라운드 | 내용 | 모델·effort | 토큰 | 앱 테스트 | 리뷰 |
|--------|------|-------------|------|-----------|------|
| r1 | Select aria-label, Slider 2곳, 불확정 Progress, Table 정렬 헤더, 링크 버튼 6곳 | gpt-6.1-terra max (priority) | 250,382 | 223 | PASS (MEDIUM 1·LOW 5) |
| 메인 직접 | 리뷰 MEDIUM: Electron 화면 테스트에 `skipIf`(macOS·Windows + Electron 실행 파일 있을 때만), LOW: 정렬 상태 이중 보관 주석 | — | — | 223 | — |

- session id: `01a1df23-45db-7f63-aaee-058d37e6af31`
- 게이트 8종은 메인이 직접 다시 돌려 EXIT=0(pytest 450 통과·11 건너뜀, 앱 vitest 35파일 223). 메인 수정 뒤 앱 게이트 4종 재실행 EXIT=0(Python 변경 없음).

## 사용자 결정 (2026-11-15)
- 분류 권장안대로: 탭은 유지(0.4.0 Tabs가 선택 패널만 마운트 → 탭을 오가면 편집 상태가 사라짐), 링크 버튼 색은 주변 글자색 유지.

## 메인이 실측한 것
- 0.4.0 Tabs: 비선택 패널은 `hidden` + `content` 대신 `null` 렌더링(`Tabs.esm.js`). 지금 탭은 만들기 패널 상시 마운트, 가사 패널은 처음 열 때 마운트 후 `hidden`, `visible && tab === 'lyrics'`가 가사·타이밍 확인 창 취소 effect로 들어간다.
- Table 클라이언트 정렬은 accessor가 문자열·숫자를 주면 그 값으로 비교 → 날짜 열은 `toLocaleDateString` 문자열이라 같은 날 곡 순서를 잃는다. `nextSort`의 `toggle`은 `nextSongSort`와 같다.
- Select 최상위 컨테이너는 외부 className을 받지 않고 w-full → `w-40` 래퍼 유지.
- Progress 불확정 애니메이션은 라이브러리 `ui.css`가 같은 클래스 이름(`progress-indeterminate`)으로 제공 → 앱 CSS 삭제. `.dark` 조상이 없어 이 앱의 색은 그대로(primary-fg = primary = violet-600, 라이트).
- 링크 버튼: 라이브러리 `cn`이 tailwind-merge라 `text-inherit`/`text-amber-800`이 `text-primary-fg`를 덮는다(Codex 화면 테스트에서 계산된 색 = 부모 색 확인).
- 실제 앱(`e2e/shots.mjs`, 개발 모드 Electron + 빌드한 렌더러, 임시 HOME, 곡 제목은 임의 문구, 가사는 임의 문장) EXIT=0:
  - 만들기 직후 진행 막대 `aria-valuenow` 없음(불확정 Progress) — `screens/1-making-progress.png`
  - 남녀 전환 combobox 이름 "남녀 전환"으로 선택, 가이드 음량 슬라이더 ←←: `aria-valuetext` "-7 dB" = 숫자칸 -7 — `screens/3-export-controls.png`
  - 가사 입력 → 만들기 탭 → 가사 탭: 입력과 내보내기 남녀 전환 선택 유지 — `screens/4-lyrics-kept.png`
  - 목록 정렬: 기본 추가한 날짜 descending(나중 곡 먼저) → 제목 ascending → descending → 추가한 날짜 ascending, 정렬된 열에만 aria-sort — `screens/5-list-default.png`, `screens/6-list-title-desc.png`
  - 불투명도 슬라이더는 이 곡이 MP4 조건(가사 필요)을 못 채워 실제 앱에선 못 움직임 → 단위·Electron 화면 테스트(`tests/uiRender.test.ts`)로 확인. 링크 버튼 6곳도 조건(모델 없음·오류) 재현이 어려워 같은 화면 테스트로 확인.
  - 첫 실행은 파일 선택 뒤 제목칸이 늦게 채워져 두 번째 곡 제목이 덮이지 않아 실패 → 채워질 때까지 기다리도록 스크립트 수정 후 통과.

## 사용자에게 보이는 변화
- 슬라이더 2곳: 브라우저 기본 range → 라이브러리 트랙·손잡이(폭 8rem). 스크린리더가 값에 단위(%·dB)를 붙여 읽는다.
- 불확정 막대: 폭 35%→40%, 한 바퀴 1.2초→1.4초. 모션 줄이기 설정에서는 3초로 천천히 움직이던 막대 → 멈춘 100% 줄무늬.
- 정렬 헤더: ↑↓↕ 문자 → 라이브러리 아이콘. 버튼 이름 "제목 정렬 (오름차순)" → "제목", 상태는 정렬된 열의 aria-sort. 정렬 결과·순환은 그대로.
- 링크 버튼 6곳: 색·크기·굵기·동작 그대로, 마우스를 올리거나 누르면 밑줄이 굵어지고 포커스 링이 primary 색.

## 남은 것
- LOW(리뷰): 새 `.tsx` 테스트·fixture가 typecheck 범위 밖(기존 `.tsx` 테스트와 같은 상태), 도달하지 않는 `onSortChange` 방어 분기와 그 테스트.
- thewrong-ui 요청 거리: Tabs에 숨긴 패널을 마운트한 채 두는 옵션, Table controlled sort.
