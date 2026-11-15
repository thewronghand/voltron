`@thewrong/ui` 0.6.0 적용을 지정된 범위에 반영했습니다. 최종 게이트는 모두 `EXIT=0`입니다. 다만 표시 전용 Stepper의 접근성 이름과 날짜 정렬의 밀리초 이하 정밀도에는 아래에 적은 제약이 있습니다.

### 변경 파일

- 앱 코드: [SongDetail.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx), [SongList.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongList.tsx), [songListLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songListLogic.ts), [BoxOpacityInput.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/BoxOpacityInput.tsx), [ExportForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/ExportForm.tsx), [LyricsEditor.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/LyricsEditor.tsx)
- 테스트: [boxOpacity.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/boxOpacity.test.tsx), [confirmationScreens.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/confirmationScreens.test.tsx), [exportForm.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/exportForm.test.tsx), [hookHarness.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/hookHarness.ts), [songDetailLifecycle.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songDetailLifecycle.test.tsx), [songList.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songList.test.ts), [songListSort.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songListSort.test.tsx), [uiMigration.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/uiMigration.test.tsx), [uiRender.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/uiRender.test.ts), [uiRender.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/fixtures/uiRender.tsx), 신규 [uiLinkProps.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/uiLinkProps.test.tsx)

[package.json](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/package.json)과 [pnpm-lock.yaml](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/pnpm-lock.yaml)의 0.6.0 변경은 호출 세션에서 이미 적용한 상태였습니다.

### 항목별 처리

1. **곡 상세 탭:** `Tabs keepMounted`로 교체했습니다. 가사 편집기는 처음 가사 탭을 선택할 때 생성되고, 이후 숨겨진 패널에 유지됩니다. 화살표 키 선택과 `visible` 전달, 탭 전환 시 확인 창 취소도 검증했습니다.
2. **곡 목록 정렬:** Table의 클라이언트 정렬과 제어 상태를 사용하고 `sortSongs`를 제거했습니다. 한국어 숫자 비교는 소수 자릿수나 시간대가 다른 ISO 문자열을 시간순으로 정렬하지 못하는 사례가 있어 날짜에는 `Date`를 전달했습니다. 헤더 순환·`aria-sort`·행 순서·null의 양방향 마지막 위치·제목 숫자 비교를 실제 렌더에서 확인했습니다.
3. **슬라이더:** 두 곳을 `w-32`로 바꿨습니다. 라이브러리의 `.ui-slider`는 `@layer components`에 있으며, 실제 계산 폭은 두 곳 모두 **128px**이었습니다.
4. **남녀 전환 Select:** `containerProps`에 `w-40`을 전달했습니다. 실제 컨테이너 폭은 **160px**이었습니다.
5. **가사 단계:** 라벨을 ‘루비 확인’으로 고정하고 건너뛰는 경우 `skipped`를 전달했습니다. 예정과 지난 단계의 표시를 확인했습니다.
6. **링크 버튼:** 다섯 곳을 `color="inherit"`로 바꿨습니다. 실제 렌더에서 부모 색을 상속하고 `text-primary-fg`가 없는 것을 확인했습니다.
7. **곡 제목 Input:** 기본 클래스와 병합된 결과는 `w-full min-w-0 flex-1`입니다. 700px·360px 영역에서 입력칸이 남는 폭을 채우고 저장 버튼과 같은 줄에 있었습니다.

사용자 화면에서는 선택된 탭의 색·굵기·간격이 라이브러리 스타일로 바뀌고, 화살표 키로 탭을 선택할 수 있습니다. 루비를 건너뛸 예정이면 기존 ‘루비 확인 (건너뜀)’ 대신 ‘루비 확인’ 아래에 ‘건너뜀 예정’이 표시되며, 지난 단계에서는 ‘건너뜀’이 표시됩니다. 라이브러리의 포커스 링 색 토큰도 바뀝니다. 확인한 슬라이더·Select 폭과 링크 색은 기존 값으로 유지됐습니다.

### 남는 제약과 검증

- **Stepper 접근성 이름:** 0.6.0은 클릭 가능한 단계 버튼에만 `(건너뜀 예정)`과 `(건너뜀)`이 들어간 `aria-label`을 생성합니다. 앱의 표시 전용 Stepper에는 해당 속성이 없어, 요청된 괄호 문자열 검증은 충족되지 않았습니다. 실제 DOM의 상태와 보이는 ‘건너뜀 예정’·‘건너뜀’은 검증했습니다.
- **날짜 정밀도:** `Date`와 Table의 비교는 밀리초까지만 구분합니다. 같은 밀리초 안에서 마이크로초만 다른 곡은 비교상 동순위가 되어 입력 순서가 유지됩니다.
- 기존 설정상 `.tsx` 테스트는 `pnpm typecheck` 범위 밖입니다. 실제 Electron 화면 테스트는 macOS·Windows에서 실행 파일이 있을 때 실행됩니다.

변경별 변이 23종을 적용했을 때 대응 테스트는 각각 `EXIT=1`이었고, 파일 복원 후 변경 관련 테스트는 `EXIT=0`이었습니다. 첫 전체 앱 테스트에서는 테스트 헬퍼의 React 모의 객체 충돌로 `EXIT=1`이 나와 헬퍼를 수정한 뒤 게이트를 처음부터 다시 실행했습니다.

| 최종 게이트 | 결과 |
|---|---:|
| `uv run ruff check .` | EXIT=0 |
| `uv run ruff format --check .` | EXIT=0 |
| `uv run mypy` | EXIT=0 |
| `uv run pytest -q` | EXIT=0 |
| `pnpm typecheck` | EXIT=0 |
| `pnpm lint` | EXIT=0 |
| `pnpm test` | EXIT=0 |
| `pnpm build` | EXIT=0 |

최종 Python 테스트는 450건, 건너뜀 11건, PyTorch 경고 1건이었고, 앱 테스트는 36개 파일·223건이었습니다.