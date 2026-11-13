r3 변경을 반영했습니다. 편집한 ASS에서 자동 박스를 만들 수 없는 묶음은 경고 후 건너뛰고, `--box`를 명시한 경우에는 오류로 처리합니다.

- **묶음 규칙:** JP 줄을 기준으로 같은 앵커이고 표시 시간이 겹치는 PRON·TRANS 줄을 찾습니다. 세로 위치가 720p 기준 JP보다 위 20px부터 아래 180px 이내인 줄 중 예상 위치에 가장 가까운 줄을 선택하고, 가로 위치와 시작 시간으로 우선순위를 정합니다. 박스는 묶인 줄의 전체 표시 시간과 위치를 포함하며, 시간과 영역이 겹치는 박스는 합칩니다. 따라서 편집한 시간이 몇 cs, 가로 위치가 몇 px 달라도 박스가 중첩되지 않습니다.
- **위치 오류:** 부호와 소수점이 있는 좌표를 읽으며, 음수 좌표·위치 누락·지원하지 않는 앵커는 자동 박스에서 해당 묶음을 생략하고 줄 수를 한국어로 경고합니다. 양수 소수 좌표는 박스 계산에 반영합니다.
- **PlayRes:** 설치된 macOS FFmpeg의 libass는 두 필드가 없을 때 **384×288**로 해석했습니다. 기존 동작과의 호환을 위해 이 ASS의 720p 렌더는 허용하고 1080p는 거부합니다. 해상도 정보가 없는 ASS에 새 박스를 자동으로 추가할 때는 경고 후 생략하며, `--box`를 명시하면 오류를 냅니다. 기존 BOX 편집 내용은 옵션을 생략하면 보존합니다.
- **박스 폭:** libass 렌더에서 단일 글자와 반복 문자열의 픽셀 경계 차이를 재어 진행폭을 측정했습니다. 글자 크기 대비 한자·가나 **0.723**, 한글 **0.722**, 반각 가나 **0.360**, JP의 A **0.601**, i **0.211**, `!` **0.258**, 공백 **0.238**이었습니다. 코드에는 전각 0.725, 반각 가나 0.37과 글자별 반각 계수를 적용하고 Spacing·외곽선·축소 글자 크기를 반영했습니다. Windows 글꼴은 같은 계수를 사용하며 실측 전입니다.
- **배경과 앱:** `make`는 분리·정렬 전에 이미지 내용을 검사합니다. 배경 PUT은 임시 사본의 디코딩을 락 밖에서 수행하고, 락을 다시 잡은 뒤 진행 중 작업을 재확인합니다. 앱은 불투명도 입력을 문자열로 유지하다 blur에서 보정하며, 입력값이 실제 내보내기 요청 본문에 전달되는 테스트를 추가했습니다. 미리보기는 배경 파일명과 원래 이름이 같으면 다시 읽지 않고, 같은 이름의 교체는 갱신합니다.
- **실제 렌더:** PNG 배경의 흑·백 영역 휘도가 각각 16·235의 ±3 범위임을 확인했습니다. 합성 JPEG의 EXIF Orientation 6도 회전된 결과를 확인했습니다. 1080p·30fps·10초 합성 영상에서 반복 디코딩 방식은 평균 **2.03초**, 단일 프레임 반복은 **1.75초**였습니다. 두 번씩 측정한 짧은 무음·무자막 작업입니다.
- **기본 경로:** 합성 입력으로 main과 비교한 720p·단색·박스 없음 ASS와 MP4의 SHA-256이 각각 일치했습니다. 전체 실제 곡 비교는 이 측정에 포함되지 않습니다.

변경 파일은 다음과 같습니다.

- Python: [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py), [library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/library.py), [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py), [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py), [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py), [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py), [video_options.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video_options.py).
- Python 테스트: [conftest.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/conftest.py), [test_lyrics_pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_lyrics_pipeline.py), [test_song_library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_song_library.py), [test_video_render.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_render.py), [test_video_options.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_options.py).
- 앱: [main/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/index.ts), [songBackground.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/songBackground.ts), [preload/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/preload/index.ts), [ipc.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/shared/ipc.ts), [ExportForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/ExportForm.tsx), [BoxOpacityInput.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/BoxOpacityInput.tsx), [SongDetail.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx), [songLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songLogic.ts), [api.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/api.ts).
- 앱 테스트와 문서: [api.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/api.test.ts), [songSetup.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songSetup.test.ts), [songs.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songs.test.ts), [boxOpacity.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/boxOpacity.test.tsx), [exportForm.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/exportForm.test.tsx), [songBackground.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songBackground.test.ts), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md).

순차 실행한 게이트 결과입니다.

- `uv run ruff check .`: **EXIT=0**
- `uv run ruff format --check .`: **EXIT=0**
- `uv run mypy`: **EXIT=0**
- `uv run pytest -q`: **EXIT=0** — 412건, 건너뜀 11건, 경고 1건
- `pnpm typecheck`: **EXIT=0**
- `pnpm lint`: **EXIT=0**
- `pnpm test`: **EXIT=0** — 109건
- `pnpm build`: **EXIT=0**

Windows 글꼴의 박스 폭과 Windows 실기 동작은 확인하지 않았습니다. 커밋은 만들지 않았습니다.