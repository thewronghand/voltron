# app-packaging — Codex executor 기록 (2b 패키징·첫 실행 환경 구성)

| 라운드 | 내용 | 모델·effort | 소요 | 토큰 | 앱 테스트 | 리뷰 |
|--------|------|-------------|------|------|-----------|------|
| r1 | 패키징 뼈대(electron-builder, uv 0.13.7 동봉), `app://thebooth` 화면 출처·CSP, 이름(`thebooth`·부제), userData 통일, 사이드카 실행 명령 주입, Windows ffmpeg manifest | gpt-6.1-terra max (priority) | 8분 25초 | 188,333 | 83 passed, pytest 366 | PASS (MEDIUM 5·LOW 6) |
| r2 (resume) | 첫 실행 환경 구성(`runtime/` 복사·`uv sync --frozen`·상태 기록·자동 시작·취소·재시도), 준비 화면 "실행 환경", Windows CUDA extras(cpu/cu132)·nvidia-smi 판단, r1 리뷰 반영(Windows 경로 override, asar 68MB→0.76MB, README) | 〃 | 10분 59초 | 391,455 | 90 passed | PASS (MEDIUM 6·LOW 8) |
| r3 (resume) | r2 리뷰 반영(실행 환경 다시 구성, 단계별 실패 문구, 두 탭 엔진 상태 복원, 취소 테스트 손자 프로세스, nvidia-smi 세 갈래, 명령 해시, 잔여 폴더 정리) | 〃 | 7분 2초 | 624,202 | 93 passed | PASS (MEDIUM 2·LOW 5) |
| r4 (resume) | r3 리뷰 반영(재구성 시 venv·python 삭제, 재구성 원인 update/rebuild 구분, 종료 시 이전 사이드카 대기, 늦은 상태 무시, 버튼 중복 방지) | 〃 | 7분 15초 | 729,923 | 95 passed | PASS (MEDIUM 2·LOW 2) |
| 메인 직접 | 오류 상자의 "다시 시작"·"실행 환경 다시 구성" 버튼이 붙어 보임 → 간격 / r4 리뷰 MEDIUM: 종료 대기 테스트가 마이크로태스크 한 틱만 기다려 회귀를 못 잡음 → 실제 시간 20ms(대기 제거 변이에서 실패 확인), Windows 일시 잠금 대비 venv·python 삭제 재시도(`maxRetries` 5) | — | — | — | 95 passed | — |

- session id: `01a1d0a8-f424-7f72-8d20-95dbd00a258d`
- Codex 샌드박스 쓰기 경로: 2a 목록 + `~/Library/Caches/electron-builder`. `pnpm dist:mac`의 `hdiutil`(dmg)과 패키징 앱 실행은 샌드박스 안에서 실패해 Codex가 샌드박스 밖(승인)으로 재실행했다.
- 매 라운드 게이트는 메인이 직접 다시 돌려 EXIT=0 확인(`uv lock --check`·ruff·format·mypy·pytest·typecheck·lint·test·build, r2부터 dist:mac·dist:win 포함).

## 메인이 고정·실측한 값
- uv 0.13.7 릴리스 자산 sha256(GitHub API digest): macOS arm64 tar.gz `81b811b5…`, Windows x64 zip `0cdc5b38…`.
- Windows ffmpeg: gyan.dev 9.0.2 essentials zip을 맥에서 받아 sha256·`ffmpeg.exe` sha256과 빌드 설정(`--enable-gpl --enable-version3 --enable-static --enable-libass --enable-libx264`) 확인.
- PyTorch 인덱스(cp312 win_amd64): torch 2.15.0은 `cu132`·`cpu`에만 있고 cu128·cu130은 2.14까지. torchaudio는 CUDA 인덱스에 2.11.0까지라 PyPI 2.11.1 유지.

## 실제 앱 확인 (Playwright `_electron`, 패키징 `.app`, 임시 HOME)
스크립트 `e2e/`(playwright-core는 스크래치 설치, `PW_CORE`로 지정), 스크린샷 `screens/`. 실제 사용자 데이터(`~/Library/Application Support/thebooth`, `~/Library/Caches/thebooth`)는 건드리지 않았다(실행 전후 확인).
- r1 빌드: `app://thebooth/index.html`, 창 제목·`app.getName()` `thebooth`, 헤더 부제, Electron 데이터 `<HOME>/Library/Application Support/thebooth/electron`, 720px에서 가로 넘침 없음.
- r2 빌드, 빈 HOME(`full.mjs`) — **완료 기준**:
  - 실행 환경 자동 구성 60초(Python 66MB + venv 994MB, uv 캐시 1.0GB 모두 임시 HOME 안) → 처리 엔진 준비 → 모델 목록 표시. `app://` → `http://127.0.0.1` fetch·SSE가 로컬 네트워크 권한에 막히지 않음(macOS).
  - 준비 화면에서 `melband-roformer-karaoke`·`whisper-large-v3`·`ffmpeg-macos-arm64` 받기 7분 20초.
  - 폭탄마 가라오케 MR + 멜로디 가이드 + 가사 영상(가사·보조 파일): 캐시 없이 17분 35초, "만들기 완료". MR·ASS·MP4가 2a 개발 앱 결과와 **바이트 동일**.
- r4 빌드, 같은 HOME(`update.mjs`):
  - 상태 기록 형식 1→2를 앱 업데이트로 인식 → "앱이 바뀌어…" 안내와 재동기화(캐시로 약 2초) → 준비.
  - 만들기 탭에도 엔진 상태 표시. 캐시 적중 만들기 8초, 결과 바이트 동일.
  - 사이드카 SIGKILL → "처리 엔진이 예기치 않게 종료되었습니다" + "다시 시작"·"실행 환경 다시 구성" → 재구성(venv·python 새로 생성 확인, uv 캐시로 약 4초) → 준비. 너무 빨라 "다시 구성하고 있습니다" 문구는 캡처되지 않았다(문구는 단위·통합 테스트로 확인).
  - 앱 종료 후 해당 HOME의 프로세스 잔존 없음.
- 최종 빌드(메인 직접 수정 포함)로 같은 확인을 한 번 더: 만들기 완료(캐시 적중), 사이드카 종료 → 재구성 → 준비, 버튼 간격 확인(`screens/final-3-sidecar-killed.png`).

## 미검증 (Windows)
- `thebooth-0.1.0-win-x64.exe`(NSIS, 사용자 단위 설치)는 맥에서 wine 없이 크로스 빌드되고 내부에 `uv.exe`·`python/`이 들어간 것까지만 확인. 설치·실행 전부 미검증.
- nvidia-smi 판단·cu132 torch 설치·CUDA 동작, torchaudio 2.11.1 PyPI 휠과 torch 2.15 조합, Windows ffmpeg 실행, `app://` 출처의 로컬 네트워크 권한, `taskkill /T /F` 트리 종료, 백신 잠금 시 재구성 실패 처리.

## 후속
- Windows 데스크탑 실기 확인(위 목록).
- 서명·공증 없음: 다른 맥으로 옮기면 quarantine으로 막힐 수 있다(README에 `xattr -cr` 안내).
- Electron fuses(RunAsNode 등) 미설정 — 본인 사용이라 보류.
