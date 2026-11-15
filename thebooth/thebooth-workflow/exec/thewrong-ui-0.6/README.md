# thewrong-ui-0.6 — `@thewrong/ui` 0.5.0 → 0.6.0 적용 기록

0.5.0 때 thewrong-ui에 보낸 요청 8건이 0.6.0에 모두 들어와(Tabs `keepMounted`, Table `sortValue`·controlled `sort`, Slider·Progress CSS `@layer components`, Input·Select `containerProps` 병합, Stepper 미래 단계 `skipped`, Button link `color="inherit"`, 포커스 링 토큰 violet-800) 앱의 우회를 걷었다.

| 라운드 | 내용 | 모델·effort | 토큰 | 앱 테스트 | 리뷰 |
|--------|------|-------------|------|-----------|------|
| r1 | 탭 → Tabs keepMounted, 목록 정렬 → sortValue+제어 sort, 슬라이더·Select 폭, Stepper skipped, 링크 color | gpt-6.1-terra max (priority) | 229,661 | 223 | PASS (LOW 3) |
| 메인 직접 | 리뷰 LOW: 테스트 헬퍼 `findElement`가 '곡 상세' 이름에 묶인 것을 `items[].content` 일반 탐색으로 | — | — | 223 | — |

- session id: `01a1e021-bc17-76e2-9d36-4fe125893ebe`
- 게이트 8종은 메인이 다시 돌려 EXIT=0(pytest 450 통과·11 건너뜀, 앱 vitest 36파일 223). 메인 수정 뒤 앱 typecheck·lint·test EXIT=0.
- 변이(메인 확인): `keepMounted` 제거·날짜 `sortValue` 제거·`skipped` 제거 각각 vitest EXIT=1. Codex 보고 변이 23종도 각각 EXIT=1.
- 앱 테스트가 224 → 223인 것은 `sortSongs` 단위 테스트를 SongList 렌더 정렬 테스트로 합친 결과.

## 사용자 결정 (2026-11-16)
- 분류 권장안대로: 탭 교체 포함 전부 적용.

## 실제 앱 확인 (`e2e/shots.mjs`, 개발 모드 Electron + 빌드한 렌더러, 임시 HOME, 곡 제목 임의 문구, 가사 임의 문장) EXIT=0
- 곡 제목칸은 `containerProps` 병합(`w-full min-w-0 flex-1`) 뒤에도 남는 폭을 채우고 '제목 저장'과 같은 줄. 남녀 전환 컨테이너 160px, 가이드 음량 슬라이더 128px — `screens/1-detail-controls.png`
- 가사 탭을 고르기 전엔 가사 편집기 없음 → 만들기 탭에서 → 키로 가사 탭 선택·마운트. 루비 단계 "루비 확인 / 건너뜀 예정"(점선 마커) — `screens/2-lyrics-skipped-pending.png`
- 가사 입력 → ← 키로 만들기 탭 → 남녀 전환 선택 유지, 가사 편집기는 숨긴 채 남음 → 가사 탭: 입력 유지 — `screens/3-tabs-focus.png`
- 목록: 기본 추가한 날짜 descending → 제목 asc → desc → 날짜 asc → desc, 정렬된 열에만 aria-sort — `screens/4-list-default.png`
- 스크린샷의 "원곡:" 줄에는 원본 파일 이름이 보인다(이전 버전 기록과 같음).

## 사용자에게 보이는 변화
- 곡 상세 탭: 남색(indigo-700) 굵은 글씨 + 밑줄 → 라이브러리 보라 밑줄·글자. 화살표·Home·End 키로 탭 이동, 패널 위 여백(pt-4), 패널에 Tab 포커스가 가면 링.
- 가사 단계: 루비를 건너뛸 때 "루비 확인 (건너뜀)" 한 줄(지나면 완료 모양) → "루비 확인" + 아래 "건너뜀 예정"(점선 마커), 지난 뒤엔 취소선 + "건너뜀".
- 포커스 링: violet-400 → violet-800(흰 배경 8.79:1). 보라 채움 컴포넌트는 표면색 띠 + 바깥 링.
- 목록 정렬 결과·슬라이더·Select 폭·링크 색은 그대로. 같은 날 추가한 곡은 시각 순서가 정확해짐(Date 비교).

## 남은 것
- LOW(리뷰): 탭을 고르는 단위 테스트는 `onValueChange`를 직접 부른다. 실제 클릭·키 → 마운트는 Electron 화면 테스트(`uiRender.test.ts`, macOS·Windows에서만)와 실제 앱 확인으로 대신.
- LOW(리뷰): Stepper 라벨이 다시 생략 처리(`truncate`)를 받는다. 지금 라벨은 짧아 문제없음.
- Stepper 단계 `aria-label`의 "(건너뜀 예정)"은 클릭 가능한 단계 버튼에만 붙는다(표시 전용 Stepper엔 보이는 글자만).
