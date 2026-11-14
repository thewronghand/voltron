r2 지적을 반영했습니다. 파일 순회를 없애고 볼륨 여유 공간 감소를 진행 신호로 사용하며, 종료 중 재시도가 새 실행 환경을 시작하지 않도록 막았습니다.

진행 신호는 기존 uv 출력 줄과 10초마다 측정한 여유 공간입니다. **1MiB 이상의 감소를 누적해 감지**하며, 3분간 신호가 없으면 정지 가능성을 표시합니다. 캐시·venv·관리 Python 경로의 장치 번호를 확인해 같은 볼륨은 한 번만 `statfs`로 측정합니다. 아직 없는 venv와 Python 경로는 runtime 부모의 볼륨을 사용하고, 장치 번호가 0이면 경로별로 측정합니다. 여유 공간은 `bsize × bavail`로 계산합니다. [Node.js 파일시스템 문서](https://nodejs.org/api/fs.html#class-fsstatfs)

한 볼륨의 측정 오류는 다른 볼륨의 결과를 버리지 않습니다. 측정이 세 차례 연속 실패하면 진행 로그에 남기되, 그 로그 자체는 진행 신호로 취급하지 않습니다. 파일 순회와 그 안의 `python3.12` 경로 하드코딩도 제거했습니다.

uv 설정의 **읽기 30초·연결 10초·재시도 3회**는 0.13.7의 기본값 고정임을 주석과 README에 명시했습니다. 외부 `HTTP_TIMEOUT` 차단이 사이드카 Python에도 적용된다는 점과, 이 설정이 기존 정지의 재발을 막는다는 근거는 없다는 점도 적었습니다. 동기화 인자는 바뀌지 않았습니다.

수정 전에는 순회 예산 밖의 큰 파일만 커지는 테스트가 3분 뒤 정지로 표시돼 `EXIT=1`이었습니다. 종료 전 시작과 대기 중 재시도 경합 테스트도 각각 실패했습니다. 이후 볼륨 감소, 소량 감소 누적, 부분 오류 처리, 반복 오류 로그, 종료 방어, 장치 번호 0 처리에 관한 **7개 변이**는 각각 관련 테스트에서 `EXIT=1`로 검출됐습니다.

이번 회차 변경 파일:

- [runtimeProgress.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/runtimeProgress.ts), [runtime.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/runtime.ts), [index.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/index.ts), [runtimeConfig.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main/runtimeConfig.ts)
- [runtimeProgress.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/runtimeProgress.test.ts), [runtime.stall.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/runtime.stall.test.ts), [mainLifecycle.test.ts](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests/mainLifecycle.test.ts), [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md)

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

pytest는 450개 성공·11개 건너뜀이었고 앱 테스트는 156개가 성공했습니다. 게이트에는 임시 홈, 기존 가상환경, 해시를 확인한 임시 ffmpeg를 사용했습니다.

다른 프로세스가 같은 볼륨에 쓰면 정지를 놓칠 수 있고, 3분 동안 1MiB 미만으로 기록되는 느린 진행이나 디스크에 아직 기록되지 않은 수신은 정지로 보일 수 있습니다. Windows 실기와 패키징 앱은 실행하지 않았고, 커밋하지 않았습니다.