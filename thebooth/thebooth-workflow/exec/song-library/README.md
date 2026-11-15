# song-library — Codex executor 기록 (앱 UX 개편 1단계: 곡 보관함 + 목록·추가·내보내기)

| 라운드 | 내용 | 모델·effort | 소요 | 토큰 | 테스트 | 리뷰 |
|--------|------|-------------|------|------|--------|------|
| r1 | Python 코어 단계 함수 분리, 곡 보관함(`library.py`), 사이드카 곡 API(목록·추가·상세·수정·가사·만들기·내보내기·삭제) | gpt-6.1-terra max (priority) | — | 440,343 | pytest 369 | FAIL (HIGH 1·MEDIUM 5·LOW 7) |
| r2 (resume) | r1 리뷰 반영 + 앱 화면 개편 — "Selected model is at capacity"로 중간 중단 | 〃 | — | 952,359 | — | — |
| r3 (resume) | r2 이어서 마무리 | 〃 | — | 1,510,470 | pytest 344, 앱 81 | (r4와 묶어 리뷰) |
| r4 (resume) | 사용자 요청: 곡 목록 Table, 곡 추가·만들기 설정 Modal | 〃 | — | 1,672,726 | 앱 97 | r2~r4 묶음 PASS (MEDIUM 4·LOW 8) |
| 메인 직접 | 사용자 요청: 네이티브 select 3곳 → `@thewrong/ui` Select, id·라벨 연결, 남녀 전환 폭 고정 | — | — | — | 앱 게이트 EXIT=0 | — |
| r5 (resume) | r2~r4 리뷰 MEDIUM·LOW 일부 + 실제 앱 화면 지적(완료 뒤 진행 안내 잔존, 결과 목록, 제목 열 잘림, Modal 가사 문구, 헤더 추가 버튼) | 〃 | — | 1,807,734 | pytest 357, 앱 103 | PASS (MEDIUM 1·LOW 4) |
| 메인 직접 | r5 리뷰 MEDIUM(Windows: 목록이 스템을 mmap한 채 겹친 만들기의 `os.replace` 실패) → 목록은 헤더만 읽고 바로 닫음(`cache.stem_headers`, 데이터 잘림은 크기로 검사) + 회귀 테스트(크기 검사 제거 변이에서 실패 확인). LOW: 취소 안내는 내보내기에만, 상세에서도 끌어다 놓기로 추가, 테스트 제목 정정 | — | — | — | pytest 358, 앱 103 | — |

- session id: `01a1d25c-de5c-7ec1-a8c7-72518cf9e881`
- 매 라운드 게이트는 메인이 직접 다시 돌려 EXIT=0 확인.

## 사용자 결정 (2026-11-13, 착수 전)
- 분리 결과는 곡 폴더에 둔다(곡당 약 170MB, 캐시를 지워도 곡이 깨지지 않음). 캐시는 CLI용으로 남기고 곡 만들기는 캐시를 먼저 찾아 복사.
- 'MR 방식(원곡에서 보컬 빼기)'·'분리한 보컬도 저장'은 내보내기 화면 '고급'에 남긴다.
- 같은 이름 파일이 있으면 덮어쓰지 않고 번호를 붙인다.
- 곡 삭제는 OS 휴지통으로. MP3·MP4는 둘 다 고를 수 있다.
- (r3 뒤) 곡 목록은 `@thewrong/ui` Table로, 곡 추가와 만들기 설정은 Modal로(사용자 요청). 상세의 만들기 설정도 같은 Modal(메인 해석, 사용자에게 알림).

## 메인이 실측한 것
- CLI `make` 출력 바이트 기준(`baseline.sh`, 폭탄마 캐시 적중 세 조합: 기본 / 키 −2·subtract·보컬 / 가라오케·가이드·여→남 +1·가사 영상): r1 후 MR·보컬·MP4·ASS sha256 전부 동일.
- r1 리뷰 HIGH(빈 `.npy`가 `EOFError`라 목록 전체 500)는 메인이 numpy로 예외 종류 재현 확인. OSError 응답이 errno 숫자(`args[0]`)로 나가는 것도 코드로 확인.
- r3 후 게이트 8종 EXIT=0, CLI 바이트 동일(메인 재실행). `/jobs/make` 제거로 pytest 수가 369→344.
- 실제 앱(Playwright `_electron`, 개발 모드 Electron + 빌드한 렌더러를 로컬 정적 서버로, 임시 HOME에 모델·캐시만 링크): 빈 목록 → 추가 Modal(폭탄마, 가라오케, 가사·보조) → 만들기(캐시 적중 3~4초) → MP3+MP4 × 3키(원키, 키 -2, 여→남 -5 키 +1) + 가이드 내보내기 26초 → 같은 설정 재내보내기 28초에 `(2)` 번호 → 목록 Table. 스크립트 `e2e/`, 스크린샷 `screens/`.
- 앱 내보내기 "여→남 -5 키 +1"의 MP3·ASS·MP4가 같은 설정 CLI `make`(가라오케·가이드 -6·f2m·k1·가사 영상) 결과와 sha256 동일. 번호 붙은 두 번째 결과도 동일.
- `@thewrong/ui` Modal에 `role="dialog"`가 없고, Select는 `aria-label`을 트리거에 넘기지 않으며 트리거 역할이 combobox다(라이브러리 쪽 접근성 빈틈 — thewrong-ui 후속 후보).
- r5 후: 게이트 8종 EXIT=0, CLI 바이트 동일, 실제 앱 E2E 재통과(내보내기 30초×2), 앱 내보내기 = CLI 바이트 동일. 화면 지적 6~10 스크린샷으로 해소 확인(완료 뒤 진행 안내 없음, 결과는 변형별 묶음, 제목 열 넓힘, "추가할 가사" 문구, 상세에서도 '추가' 활성).
- 최종: 게이트 8종 EXIT=0, CLI 바이트 동일, 실제 앱 E2E 재통과.
- 남은 것: Windows 실기 미검증(목록 조회 중 가사 파일을 잠깐 여는 동안 가사 교체·곡 삭제가 겹치면 실패할 수 있음 — 재시도로 풀림), LOW-1(앱은 `THEBOOTH_FFMPEG` 환경변수를 모르고 manifest ffmpeg 설치만 봄 — 개발 환경 한정).
- E2E 출력은 `~/Downloads/yt-test/thebooth-out/library-e2e-*`(레포 밖), 임시 HOME은 시스템 임시 폴더.
- **thewrong-ui 후속(사용자 결정 2026-11-13)**: avocado/ui 기반 thewrong-ui 개선 작업이 따로 진행 중이라, 끝나면 `@thewrong/ui`를 올리고 thebooth에 적용한다. 그때 걷어낼 우회: 남녀 전환 Select의 숨은 `<label htmlFor>`(Select가 `aria-label`을 버림), E2E가 Modal을 `role=dialog` 대신 버튼 이름으로 찾는 부분, Select 폭 고정 래퍼(`w-40`). → 2026-11-15 0.3.0 적용(`exec/thewrong-ui-0.3/`): E2E Modal 찾기는 `role=dialog`로 정리, 숨은 label과 `w-40`은 0.3.0에서도 필요해 유지.
- **패키징 앱 확인(2026-11-15)**: `e2e/launch.mjs`에 `BOOTH_PACKAGED=1` 모드(빌드한 `.app`, 임시 HOME, 모델·분리/음표/정렬 캐시만 링크 — uv 캐시는 임시 HOME 안). 1·2단계 스크립트는 3단계에서 가사 입력이 가사 탭으로 옮겨진 것에 맞춰 고침(1단계는 MP3만, 2단계는 가사 탭에서 붙여넣기·정렬 후 MP4). `main` `95c6ab8` 빌드로 1·2·3단계 E2E 모두 통과(곡 보관함 표시 6~7초, 2단계 결과 1920×1080 `yuv420p(tv)`, 3단계 ASS 2줄만 변경, 파형이 `app://`에서 로드). 첫 실행 구성은 uv 다운로드가 약 15분 정지한 뒤 끝나 1058초(첫 시도는 10분 넘게 정지해 중단) → `exec/first-run-stall/`. 재생 버튼(오디오)은 E2E가 누르지 않아 미확인.
