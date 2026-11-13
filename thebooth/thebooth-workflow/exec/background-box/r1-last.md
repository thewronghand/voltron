배경 이미지, 자막 박스, 1920×1080 선택을 구현했습니다. 기본 720p 단색 경로는 합성 입력으로 수정 전후 ASS와 MP4의 SHA-256이 각각 같은 것을 확인했습니다. 같은 입력의 곡 내보내기와 `make` 파이프라인 결과도 바이트가 일치했습니다.

- **자막 비례:** 1080p ASS의 `PlayRes`를 1920×1080으로 설정하고, 720p의 글자 크기·위치·간격·외곽선·그림자와 폭 한계 1120을 1.5배로 적용했습니다. 정수 좌표는 0.5에서 올림합니다.
- **박스:** 블록마다 `BOX` 스타일의 별도 ASS 드로잉 이벤트를 만들고 레이어 0에, 텍스트는 레이어 1에 둡니다. 폭은 기존 글자 폭 추정에 외곽선 여유 12px과 좌우 24px을 더하고, 위 18px·아래 22px 여백과 반지름 12px을 720p 기준으로 적용합니다. 실제 줄 위치에 맞춰 높이를 정하고 화면 경계에서 자릅니다. ASS 알파는 `(255 × (100 − 불투명도) + 50) // 100`이며 기본 60%는 `&H66`입니다.
- **배경과 내보내기:** 곡별로 이미지를 복사해 저장하며, `PUT /songs/{id}/background`와 `DELETE /songs/{id}/background`를 추가했습니다. 진행 중 작업이 있으면 409를 반환합니다. `resolution`, `box`, `box_opacity`를 내보내기 기본값에 저장하며, 박스 자동 선택은 `box: null`로 유지해 배경 유무를 따라갑니다.
- **렌더와 CLI:** 이미지에는 비율 유지 확대와 가운데 자르기를 적용하고 밝기 보정은 하지 않습니다. `make`와 `video`에 `--background`, `--box/--no-box`, `--box-opacity`, `--resolution`을 추가했습니다. `video`는 ASS 해상도가 선택한 영상 해상도와 다르면 거부하고, 박스 변경은 임시 ASS 사본에 적용합니다.
- **화면:** “배경”, “단색 배경”, “이미지 선택”, “바꾸기”, “지우기”, “자막 박스”, “불투명도”, “해상도”를 추가했습니다. MP4 미선택 시 영상 설정을 비활성화하고 이유를 표시합니다. 미리보기 IPC는 곡 ID와 허용된 배경 파일명만 사용합니다.

설치된 macOS manifest ffmpeg 9.0.2로 4:3·9:16 이미지와 EXIF Orientation 6 JPEG를 1080p로 렌더했습니다. Orientation 6의 160×90 원본은 90×160으로 자동 회전했고 색 표본 위치도 예상과 일치했습니다. 별도 회전 처리나 의존성은 추가하지 않았습니다. 실제 렌더에서 박스 내부 픽셀의 밝기 변화도 확인했습니다.

변경 파일은 다음과 같습니다.

- 문서: [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)
- Python: [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py), [library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/library.py), [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py), [server.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/server.py), [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py), [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py), [video_options.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video_options.py)
- 앱: [main/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/index.ts), [songBackground.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/songBackground.ts), [preload/index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/preload/index.ts), [ExportForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/ExportForm.tsx), [SongDetail.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/SongDetail.tsx), [songLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songLogic.ts), [api.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/lib/api.ts), [ipc.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/shared/ipc.ts)
- 테스트: [conftest.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/conftest.py), [test_song_library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_song_library.py), [test_video_render.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_render.py), [test_video_options.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_options.py), [api.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/api.test.ts), [songSetup.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songSetup.test.ts), [songs.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songs.test.ts), [exportForm.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/exportForm.test.tsx), [songBackground.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/songBackground.test.ts)

지정 순서로 실행한 게이트 결과입니다.

| 게이트 | 종료 코드 |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |

Python 테스트는 371개 성공, 11개 건너뜀, 기존 PyTorch 경고 1건이었습니다. 새 실제 ffmpeg 렌더 테스트는 실행됐습니다. 앱 테스트는 107개 성공했습니다.

남은 범위는 Windows 실기와 TJ 반주기 재생 확인입니다. 편집한 ASS에 새 박스를 자동 추가할 때는 위치가 지정된 `JP`·`PRON`·`TRANS` 이벤트가 필요하며, 읽을 수 없는 형식은 한국어 오류로 거부합니다. 커밋은 하지 않았습니다.