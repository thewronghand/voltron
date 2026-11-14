첫 실행 설치의 정지 감지와 **취소 후 다시 시도** 기능을 구현했습니다. 설치 중 3분간 진행 신호가 없으면 안내를 표시하고, uv 출력이나 파일 활동이 다시 관찰되면 안내를 지웁니다.

진행 신호는 uv 출력 줄과 캐시 임시 폴더·venv의 파일 변화입니다. 임시 로컬 다운로드에서 uv 0.13.7이 캐시 `.tmp` 폴더의 파일을 늘리는 것을 확인했습니다. 전체 캐시를 계산하지 않도록 10초마다 임시 폴더를 최대 512개 항목, 깊이 8까지 살핍니다.

화면에는 “몇 분째 진행 신호가 없습니다. 설치가 멈췄을 수 있습니다. 네트워크 상태를 확인하거나 ‘취소 후 다시 시도’를 눌러 보세요.”와 “받기를 마친 패키지는 캐시에 남아 다시 시도할 때 재사용할 수 있습니다.”를 표시합니다.

uv에는 읽기 제한 **30초**, 연결 제한 **10초**, HTTP 재시도 **3회**를 명시했습니다. 동봉 uv 0.13.7의 기본값과 같으며, 외부 `HTTP_TIMEOUT`도 제거합니다. `uv --help`에는 이 환경변수들이 나오지 않아 [해당 버전의 환경변수 정의](https://raw.githubusercontent.com/astral-sh/uv/0.13.7/crates/uv-static/src/env_vars.rs)로 확인했습니다. 환경변수는 동기화 명령 해시 대상이 아니므로 이 설정 변경만으로 기존 사용자에게 재동기화가 발생하지 않습니다.

변경 파일은 다음과 같습니다.

- 실행 환경·상태: [runtime.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/runtime.ts), [runtimeProgress.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/runtimeProgress.ts), [runtimeConfig.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/runtimeConfig.ts), [ipc.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/shared/ipc.ts)
- 화면: [RuntimePanel.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/RuntimePanel.tsx), [runtimeDisplay.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src/features/prepare/runtimeDisplay.ts)
- 테스트·문서: [runtime.stall.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/runtime.stall.test.ts), [runtimeProgress.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/runtimeProgress.test.ts), [runtimePanel.test.tsx](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/runtimePanel.test.tsx), [runtimeConfig.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/runtimeConfig.test.ts), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)

수정 전에는 3분 경과 후 정지 상태가 없어 테스트가 `EXIT=1`로 실패했습니다. 구현 후 정지 전파, 출력과 파일 진행에 따른 해제, 파일 크기 증가, 취소 완료 대기를 각각 제거하는 다섯 변이는 모두 해당 테스트에서 `EXIT=1`로 검출됐습니다.

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

pytest는 최종 실행에서 450개 성공, 11개 건너뜀이었습니다. 첫 실행은 제가 지정한 시스템 ffmpeg에 libass가 없어 31개가 실패해 `EXIT=1`이었고, 이후 manifest에 고정된 ffmpeg를 임시 폴더에 받아 해시 확인 후 재실행했습니다. 테스트에는 임시 홈과 기존 가상환경을 사용하고 uv 자동 동기화를 껐습니다. 앱 테스트는 148개가 성공했습니다.

파일 관찰 범위 밖의 활동이나 디스크에 기록되기 전의 네트워크 수신은 놓칠 수 있으므로 정지 안내는 추정입니다. 명시한 HTTP 제한 역시 `uv sync` 전체 시간 제한은 아니며, 실측된 15분 정지가 자동으로 해소되는지는 확인되지 않았습니다. 패키징 앱과 Windows 실기는 실행하지 않았고, 커밋하지 않았습니다.