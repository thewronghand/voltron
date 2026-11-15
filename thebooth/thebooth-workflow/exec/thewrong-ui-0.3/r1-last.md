`@thewrong/ui` 0.3.0 컴포넌트 교체를 반영했고, 최종 게이트 8개는 모두 `EXIT=0`입니다. 커밋은 하지 않았습니다.

### 변경 파일

구현:

- [ProgressBar.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/components/ProgressBar.tsx), [useConfirm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/components/useConfirm.tsx), [ModelRow.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/ModelRow.tsx)
- [ExportForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/ExportForm.tsx), [LyricsEditor.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/LyricsEditor.tsx), [SongDetail.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx), [SongList.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongList.tsx), [SongSetupModal.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongSetupModal.tsx), [TimingEditor.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/TimingEditor.tsx)

테스트:

- [exportForm.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/exportForm.test.tsx), [iconAction.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/iconAction.test.tsx), [lyricsEditorLifecycle.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/lyricsEditorLifecycle.test.tsx)
- [confirmation.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/confirmation.test.tsx), [confirmationModal.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/confirmationModal.test.tsx), [timingConfirmation.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/timingConfirmation.test.tsx), [uiMigration.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/uiMigration.test.tsx)

`app/package.json`과 `app/pnpm-lock.yaml`의 0.3.0 변경은 작업 시작 전에 존재했습니다.

### 항목별 처리

1. **진행 막대:** 숫자는 0~1 값을 0~100으로 변환해 `Progress`에 전달합니다. `null`은 기존 불확정 마크업과 애니메이션을 유지합니다.
2. **제목 입력:** 두 곳을 `Input variant="box"`로 교체하고 라벨 연결, 값과 저장 동작을 유지했습니다.
3. **가사 입력:** `Textarea`로 교체하고 라벨·최대 길이·안내 문구·최소 높이와 세로 크기 조절을 유지했습니다.
4. **체크박스:** renderer의 대상 체크박스를 `Checkbox.Line`으로 교체했습니다. 기존 라벨과 동작을 유지하고 포커스 및 비활성 표시를 보완했습니다.
5. **라디오:** 두 묶음을 `fieldset`·`legend` 안의 `Radio.Group`과 `Radio.Item`으로 교체했습니다.
6. **키 조절:** −/+를 `secondary`, `outlined`, `small` 버튼으로 교체하고 접근성 이름을 유지했습니다.
7. **배지:** 모델 용도와 키 변형 모두 기존 계열에 맞춰 `primary`·`weak`를 선택했습니다. 키 변형의 제거 버튼과 이름은 유지했습니다.
8. **확인 창:** 네 곳에 공용 `Modal` 확인 창을 연결했습니다. 기존 본문을 유지하고 확인 문구는 각각 **삭제**, **지우기**, **버리고 이동**으로 지정했습니다. 취소·닫기·ESC·바깥 클릭은 취소로 처리합니다. 중복 요청, 언마운트 및 확인 중 관련 상태 변경도 처리했습니다.
9. **가사 단계:** 표시 전용 `Stepper`로 교체했습니다. 현재 단계의 `li`에 라이브러리가 `aria-current="step"`을 부여하며, 건너뛴 루비 단계는 이름에 “(건너뜀)”을 표시합니다.

### 사용자에게 보이는 변화와 우회

숫자 진행률은 라이브러리 색상과 폭 전환 효과를 사용합니다. 제목·가사 입력, 체크박스, 라디오, 키 버튼과 배지는 라이브러리 모양으로 바뀝니다. 확인이 필요한 동작에서는 운영체제 기본 확인 창 대신 제목과 취소·위험 동작 버튼이 있는 앱 모달이 열립니다. 타이밍 저장을 기다리는 동안에는 블록 이동이 막힙니다. 가사 단계는 한 줄 숫자 목록에서 단계별 표시로 바뀝니다.

0.3.0 `Progress`에는 불확정 상태가 없어 기존 표시를 남겼습니다. `Stepper`는 목록 이름을 “진행 단계”로 고정하므로 바깥 그룹에 기존 “가사 편집 단계” 이름을 보존했습니다. `Select`의 숨은 라벨과 폭 래퍼도 유지하고 주석에 0.3.0 기준을 명시했습니다.

### 검증과 남은 확인

확인·취소 및 곡 목록 삭제 흐름, 실제 라이브러리 `Modal`의 ESC·바깥 클릭 핸들러, 타이밍 경합을 테스트했습니다. 확인 버튼, 취소 처리, 진행률 변환, 현재 단계, 저장 중 이동 제한, MP4 비활성화를 각각 되돌리는 변이에서는 해당 테스트가 모두 `EXIT=1`로 실패했으며 이후 구현을 복원했습니다.

**실제 브라우저 화면 검증은 남아 있습니다.** Chrome이 시작 직후 종료되고 브라우저 제어 호스트에도 연결할 수 없었습니다. ESC·바깥 클릭 테스트는 실제 `Modal` 구현을 모의 DOM과 훅 하네스에서 실행한 것으로, 실제 화면의 배치·포커스·역할별 선택자까지 검증한 것은 아닙니다.

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

Python 테스트는 450개 실행, 11개 건너뜀, PyTorch 경고 1건이었습니다. 앱 테스트는 172개 실행됐습니다. 처음 앱 전체 테스트에서 0.3.0 버튼 토큰 변경으로 실패한 기존 테스트는 검증 의도를 유지해 수정한 뒤 재실행했습니다.