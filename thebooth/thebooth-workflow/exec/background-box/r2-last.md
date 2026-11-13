r2 수정과 지정 게이트 실행을 마쳤습니다. 720p 단색·박스 없음 경로는 합성 입력으로 main의 ASS와 MP4 각각의 SHA-256이 일치했습니다.

박스 폭은 설치된 macOS ffmpeg/libass에서 **같은 글자 6개와 12개를 각각 렌더한 뒤 픽셀 경계의 차이**로 진행폭을 측정했습니다. Hiragino Sans와 Apple SD Gothic Neo에서 전각 한자·가나·한글은 글자 크기의 약 0.720~0.724배여서 박스 전용 계수를 0.725로 정했습니다. 반각은 문자별 값을 사용합니다. 예를 들어 `i`는 약 0.189~0.216배, 숫자 `0`은 0.522~0.538배, `M`은 0.667~0.727배, 공백은 0.219~0.240배였습니다. 스타일 간격·외곽선·그림자와 축소된 `\fs`도 폭에 반영하며, `_fit_font`의 축소 판단은 유지했습니다.

720p 실제 합성 프레임에서 전각, 축소 글자, 반각 혼합의 양쪽 끝 여백은 24~28px이었고 검사한 글자 픽셀은 박스 밖에 없었습니다. 720p·1080p, 위·아래 정렬, 발음·번역 줄을 포함한 렌더 테스트도 추가했습니다. Windows의 Yu Gothic·Malgun Gothic은 실측할 수 없어 같은 값을 사용하고 미검증 상태를 코드에 표시했습니다.

나머지 지적 사항은 다음과 같이 처리했습니다.

- JPEG 입력은 `out_range=tv`로 변환합니다. 실제 ffmpeg 출력에서 기존 `yuvj420p(pc)`가 `yuv420p(tv)`로 바뀐 것을 확인했습니다.
- 이미지 한 프레임을 확대·자른 뒤 반복합니다. 20초 합성 영상, 1600×1200 JPEG → 1080p 조건에서 세 번씩 번갈아 측정한 평균은 **1.036초 → 0.769초**였습니다. 30fps, 시작 시각 0과 오디오 길이에 따른 프레임 수를 검사했습니다.
- 기존 ASS에 `BOX` 스타일이나 이벤트가 있으면 박스 옵션 생략 시 그대로 둡니다. 명시적 불투명도 변경은 스타일과 이벤트 알파 재정의에 적용합니다.
- 불투명도 숫자는 입력 중 문자열로 유지하고 blur 또는 Enter에서 보정합니다. 슬라이더와의 동기화도 테스트했습니다.
- BOX는 이벤트의 Style 필드로 판별하고, 새 스타일은 `[V4+ Styles]`의 마지막 스타일 뒤에 넣습니다. 배경과 출력 경로 충돌 문구, `%d`가 포함된 이미지 파일명, 영상 옵션 무시 경고를 수정했습니다.
- 배경 저장 시 확장자에 맞는 서명을 확인하고 ffmpeg가 있으면 한 프레임을 디코딩합니다. `pipeline.write_subtitles`의 기본 경로 분기도 정리했습니다.

r2에서 추가로 수정한 파일은 [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md), [subtitles.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/subtitles.py), [video.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video.py), [video_options.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/video_options.py), [library.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/library.py), [pipeline.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/pipeline.py), [cli.py](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/src/thebooth/cli.py), [ExportForm.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/ExportForm.tsx), [BoxOpacityInput.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/BoxOpacityInput.tsx), [songLogic.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/songs/songLogic.ts)와 관련 [Python 테스트](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_video_options.py), [곡 보관함 테스트](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_song_library.py), [파이프라인 테스트](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/tests/test_lyrics_pipeline.py), [앱 테스트](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/boxOpacity.test.tsx)입니다.

| 게이트 | EXIT |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |

Python 테스트는 393개 성공, 11개 건너뜀, 기존 PyTorch 경고 1건이었습니다. 앱 테스트는 임시 `uv` 캐시를 지정해 다시 실행했으며 108개 성공했습니다.

남은 한계는 Windows 글꼴의 실제 폭과 Windows 렌더 동작이 미측정이라는 점입니다. 또한 ffmpeg가 없는 환경에서는 파일 서명만 확인하므로 서명은 맞지만 손상된 이미지까지 판별하지는 못합니다. 커밋은 하지 않았습니다.