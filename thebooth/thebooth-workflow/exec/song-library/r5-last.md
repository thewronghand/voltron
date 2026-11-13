r5 수정과 지정된 게이트 실행을 마쳤습니다. 메인이 적용한 `Select`와 라벨 연결은 유지했습니다.

1. **곡 추가 실패 처리:** 가사 저장에 실패해도 만들기 설정 저장을 시도합니다. 가사만 실패했는지, 설정도 실패했는지 구분해 표시합니다. 둘 중 하나라도 실패하면 만들기는 시작하지 않고 곡 상세로 이동합니다.
2. **내보내기 조건:** 분리가 완료되면 MP3를 선택할 수 있고, 음표는 가이드를 켰을 때만 요구합니다. 가사 정렬이 낡으면 MP4만 비활성화하고 이유를 표시합니다.
3. **실패 partial:** 두 번째 변형의 가짜 ffmpeg 렌더 실패 시 작업이 `failed`가 되고, 첫 변형의 완성 파일과 두 번째 변형에서 이미 완성된 파일이 `partial`에 남는 테스트를 추가했습니다.
4. **목록 락:** 곡별 메타데이터 읽기만 락 안에서 수행하고 상태 계산은 락 밖으로 옮겼습니다. 계산 중 같은 곡이 바뀌면 한 조회에서 이전 상태가 보일 수 있으며, 다음 조회에서 다시 계산합니다. 다른 곡의 저장이 막히지 않는 테스트를 추가했습니다.
5. **기타 검증:** 내보내기 중 같은 이름이 생기면 한국어 오류를 표시하고 기존 파일을 보존합니다. 원곡 확장자는 지정된 일곱 종류만 대소문자 구분 없이 받습니다. 마이너스 표기를 `-`로 통일하고 키 단계에 접근성 이름을 붙였으며, 추가 실패 안내는 상세를 떠날 때 지웁니다.
6. **진행 안내:** 완료·실패·취소 후 남아 있던 “MP4 렌더 중” 같은 메시지를 숨깁니다. 만들기에도 같은 규칙을 적용했습니다.
7. **결과 목록:** 파일마다 전체 경로와 버튼을 보이던 것을 저장 폴더 한 번, 변형별 파일명과 보기 버튼 하나로 바꿨습니다. 버튼 문구는 플랫폼에 따라 Finder 또는 탐색기로 표시합니다.
8. **목록 제목:** 제목 열을 넓히고 긴 제목은 말줄임 처리하며 전체 제목을 `title`에 넣었습니다.
9. **가사 선택 문구:** 파일 선택 후 “가사가 없습니다” 대신 “추가할 가사”와 선택한 파일명을 표시합니다.
10. **상세 헤더:** 상세에서도 **추가** 모달을 열 수 있게 했습니다. 다른 곡의 상세를 보고 있어도 새 곡을 추가할 수 있도록 선택했습니다.

이번 라운드의 변경 파일은 다음과 같습니다.

- 서버·테스트: [library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/library.py), [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py), [test_song_library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_song_library.py)
- 화면: [App.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/App.tsx), [ExportForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/ExportForm.tsx), [SongDetail.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx), [SongJobProgress.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongJobProgress.tsx), [SongList.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongList.tsx), [SongSetupModal.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongSetupModal.tsx)
- 로직·플랫폼: [songLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songLogic.ts), [songOutput.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songOutput.ts), [songSetup.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songSetup.ts), [ipc.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/shared/ipc.ts), [preload/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/preload/index.ts)
- 앱 테스트·문서: [songSetup.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songSetup.test.ts), [songs.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songs.test.ts), [songOutput.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songOutput.test.ts), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)

| 게이트 | 결과 |
|---|---:|
| `uv run ruff check .` | EXIT=0 |
| `uv run ruff format --check .` | EXIT=0 |
| `uv run mypy` | EXIT=0 |
| `uv run pytest -q` | EXIT=0 — 357개 실행, 11개 건너뜀, 경고 1개 |
| `pnpm typecheck` | EXIT=0 |
| `pnpm lint` | EXIT=0 |
| `pnpm test` | EXIT=0 — 103개 테스트 |
| `pnpm build` | EXIT=0 |

모의 사이드카를 연결한 렌더러에서 주요 화면 변경을 확인했습니다. 패키징 앱은 지시에 따라 실행하지 않았고, 커밋하지 않았습니다.