r4 변경을 적용했습니다. **실행 환경 다시 구성**은 이제 기존 `runtime/venv`와 `runtime/python`을 삭제한 뒤 다시 설치하며, uv 캐시는 유지합니다. 삭제에 실패하면 원인을 안내하고 재시도할 수 있습니다.

항목별 처리 내용은 다음과 같습니다.

1. 실제 uv를 사용하는 임시 프로젝트 테스트에서 가상환경 재생성, Python 폴더의 표식 삭제와 캐시 유지를 확인했습니다.
2. 재구성 표식에 `update` 또는 `rebuild`를 기록합니다. 취소·실패 후 재시도와 새 매니저 생성 시에도 원인이 유지되는 것을 테스트했습니다. 원인이 없는 이전 형식의 표식은 `update`로 읽습니다.
3. 재구성 중 앱을 종료하면 이전 사이드카의 종료 약속을 기다립니다.
4. 현재 매니저가 아닌 사이드카의 늦은 상태 알림을 무시합니다.
5. 도달하지 않는 설치 단계의 `missingUv` 분기와 해당 테스트를 제거했습니다.
6. 재구성 요청 중 버튼을 비활성화하고 중복 요청을 막았습니다.
7. README에 삭제 대상, 유지되는 uv 캐시와 재구성 표식을 추가했습니다.

화면 문구는 이전에는 두 재구성 모두 “앱이 바뀌어 실행 환경을 다시 맞추고 있습니다.”였고, 이제 앱 업데이트에는 이 문구를 유지하며 사용자가 요청한 복구에는 “실행 환경을 다시 구성하고 있습니다.”를 표시합니다.

이번 변경 파일은 [README.md](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/README.md), [main 코드](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/main)의 `index.ts`, `runtime.ts`, `runtimeConfig.ts`, [공유 IPC](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/shared/ipc.ts), [화면 코드](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/src/renderer/src)의 `App.tsx`, `features/prepare/runtimeDisplay.ts`, [테스트](/Users/euihyeon/dev/voltron-personal/thebooth/thebooth-code/app/tests)의 `mainLifecycle.test.ts`, `prepare.test.ts`, `runtimeConfig.test.ts`, `runtime.integration.test.ts`입니다.

| 최종 게이트 | EXIT |
|---|---:|
| `uv run ruff check .` | 0 |
| `uv run ruff format --check .` | 0 |
| `uv run mypy` | 0 |
| `uv run pytest -q` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |

Python 테스트 366개가 완료됐고 경고 3개가 나왔습니다. 앱 테스트는 95개가 완료됐습니다. 최초 앱 lint는 새 테스트 코드의 지적 3건으로 `EXIT=1`이었고, 수정 후 순차 재실행에서 `EXIT=0`이었습니다.

요청대로 `app/dist/`를 건드리거나 패키징 앱을 실행하지 않았습니다. Windows 실기 동작은 확인하지 않았으며, 커밋하지 않았습니다.