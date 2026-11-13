곡 목록을 Table로 바꾸고, 곡 추가와 만들기 설정을 같은 Modal로 옮겼습니다.

- **목록:** 제목·상태·가사·추가 날짜를 표시합니다. 날짜 최신순이 기본이며 제목과 날짜를 정렬할 수 있습니다. 읽을 수 없는 곡은 행에서 삭제할 수 있습니다.
- **추가:** 파일 선택이나 끌어다 놓기로 모달을 열고 제목, 모델, 추출기, 가사를 설정합니다. 곡 추가 후 가사 저장 → 설정 저장 → 만들기 시작 순서로 처리합니다. 중간 단계가 실패하면 생성된 곡의 상세로 이동해 실패 내용을 표시합니다.
- **상세:** 단계 상태와 진행 표시를 남기고 설정은 모달로 옮겼습니다. 작업 중에는 설정 버튼을 비활성화합니다. 준비 화면을 다녀와도 열어 둔 설정은 유지됩니다.

변경 파일은 다음과 같습니다.

- 화면: [App.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/App.tsx), [SongList.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongList.tsx), [SongDetail.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx), [SongSetupModal.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongSetupModal.tsx)
- 로직과 API: [songListLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songListLogic.ts), [songSetup.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songSetup.ts), [api.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/api.ts)
- 테스트와 문서: [songList.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songList.test.ts), [songSetup.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songSetup.test.ts), [api.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/api.test.ts), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)

Table 정렬은 설치된 UI 패키지의 실제 헤더 동작을 확인한 뒤 별도 정렬 함수와 열 머리글 버튼으로 연결했습니다. 편집 중 가사 저장은 성공하고 설정 저장이 실패한 경우에는 저장된 가사 상태를 유지하고 오류를 표시합니다.

| 게이트 | 결과 |
|---|---:|
| `pnpm typecheck` | EXIT=0 |
| `pnpm lint` | EXIT=0 |
| `pnpm test` | EXIT=0 — 17개 파일, 97개 테스트 |
| `pnpm build` | EXIT=0 |

모의 사이드카로 렌더러의 추가·정렬·설정 저장을 확인했습니다. 패키징 앱은 요청에 따라 실행하지 않았습니다. 이번 라운드에서 Python이나 의존성은 수정하지 않았고 커밋하지 않았습니다.