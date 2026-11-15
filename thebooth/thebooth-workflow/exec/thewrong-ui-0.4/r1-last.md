지정된 UI를 `@thewrong/ui` 0.4.0 컴포넌트로 교체했습니다. 최종 상태에서 요청한 8개 게이트는 모두 `EXIT=0`이었고, 변경별 변이 26개는 각각 테스트 실패로 확인했습니다.

**변경 파일**

- 앱: [ProgressBar.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/components/ProgressBar.tsx), [BoxOpacityInput.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/BoxOpacityInput.tsx), [ExportForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/ExportForm.tsx), [RubyPreview.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/RubyPreview.tsx), [SongDetail.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx), [SongList.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongList.tsx), [songListLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songListLogic.ts), [styles.css](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/styles.css)
- 테스트: [boxOpacity.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/boxOpacity.test.tsx), [exportForm.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/exportForm.test.tsx), [songList.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songList.test.ts), [uiMigration.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/uiMigration.test.tsx), [songListSort.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songListSort.test.tsx), [uiRender.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/uiRender.test.ts)
- 화면 테스트 픽스처: [uiRender.html](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/fixtures/uiRender.html), [uiRender.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/fixtures/uiRender.tsx), [uiRender.mjs](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/fixtures/uiRender.mjs)

`app/package.json`과 `app/pnpm-lock.yaml`은 작업 시작 전 호출 세션이 수정한 상태를 유지했습니다.

**항목별 결과**

1. 남녀 전환 Select의 숨은 라벨을 제거하고 트리거에 접근성 이름을 부여했습니다. `w-40` 래퍼와 해상도의 보이는 라벨은 유지했습니다.
2. 두 range를 Slider로 교체해 ID·라벨·비활성 상태와 `%`/`dB` 값 텍스트를 확인했습니다. 실제 입력 후 숫자칸과 내보내기 값이 갱신되는 테스트도 추가했습니다.
3. 불확정 진행률도 Progress로 렌더링하고 앱의 중복 CSS를 제거했습니다. 이름은 유지되고 `aria-valuenow`는 생략됩니다.
4. Table 내장 정렬 헤더를 사용하면서 실제 데이터는 `sortSongs`로 정렬합니다. toggle 순환이 기존 함수와 같아 `nextSongSort`를 제거했습니다. 실제 화면에서 클릭별 순서와 활성 열의 `aria-sort`를 확인했습니다.
5. 지정된 여섯 버튼을 link Button으로 교체했습니다. 렌더된 클래스와 계산된 색으로 주변 색 상속 및 루비의 `text-amber-800` 유지, 클릭 동작을 확인했습니다.

사용자에게 보이는 변화로, 슬라이더는 라이브러리의 트랙·손잡이 모양을 사용합니다. 정렬 화살표는 라이브러리 아이콘으로 바뀌고, 링크 버튼에는 라이브러리의 hover·포커스 표시가 적용됩니다. 불확정 막대는 채움 폭이 35%에서 40%, 애니메이션 주기가 1.2초에서 1.4초로 바뀌며, 움직임 감소 설정에서는 이전의 느린 이동 대신 정지한 줄무늬로 표시됩니다.

라이브러리의 Select 컨테이너와 Slider는 기본 폭이 100%여서 각각 기존 래퍼와 8rem 폭 지정을 유지했습니다. Table의 클라이언트 정렬은 날짜 표시 문자열 기준이므로 같은 날의 시간 순서를 보존하기 위해 앱 정렬을 사용했습니다. link Button의 기본 보라색은 `className`으로 덮었으며, `cn`이 tailwind-merge를 사용하는 것도 확인했습니다.

**빈틈·실행 조건:** 화면 테스트는 설치된 Electron을 사용하므로 실행 가능한 그래픽 환경이 필요합니다. 이 환경에서는 `pnpm test`를 권한 확장 상태로 실행했습니다. Python 테스트에는 기존 PyTorch 경고 1건과 건너뜀 11건이 있었습니다.

| 게이트 | 최종 EXIT |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |

Python 테스트는 450개, 앱 테스트는 223개가 실행됐습니다. 중간 타입 검사에서 테스트용 Vite 설정 오류가 발견돼 수정한 뒤 전체 게이트를 다시 순서대로 실행했습니다. 커밋은 하지 않았습니다.