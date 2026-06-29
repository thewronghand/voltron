# CLI Worker 원격 관리 시스템

## Status: In Progress

## 배경 (왜 필요한가)

escapist는 현재 배포 완료 상태로 실사용 중이다. 아키텍처:

```
[React :5180] ←WS/tRPC→ [Fastify on Render] ←WS(/worker)→ [cli-worker on 맥북에어]
                                ↕                                    ↓
                           [Turso DB]                         [Claude CLI]
```

cli-worker는 의현님의 **개인 맥북에어**에서 PM2로 돌아가고 있다. 문제는 의현님이 **회사(BIX Payments)**에서 일할 때 맥북에어에 물리적으로 접근할 수 없다는 것.

### 실제 발생한 문제

- cli-worker가 알 수 없는 이유로 죽음 → 회사에서 원인 파악 불가, 재시작 불가
- cli-worker 코드를 업데이트했을 때 → 맥북에어에서 git pull + pm2 restart를 쳐야 하는데 접근 불가
- escapist 세션에서 웹서치 등 도구 사용 시 → `claude -p`는 non-interactive라 동적 권한 요청 불가, spawn 전에 `--allowedTools` 플래그로 사전 설정 필요

### 핵심 니즈

1. **cli-worker 상태 모니터링**: PM2 로그를 회사에서도 볼 수 있어야 한다
2. **원격 명령 실행**: git pull, pm2 restart 등을 원격으로 트리거할 수 있어야 한다
3. **판단이 필요한 원격 관리**: 단순 명령 실행을 넘어 "로그 보고 원인 분석해서 고쳐봐" 같은 작업도 가능해야 한다
4. **세션 설정 UI**: Claude CLI 세션 생성 시 allowedTools, model, effort를 사전 설정할 수 있는 UI

## 설계

### 1. 맥북에어 관리 세션 (핵심)

맥북에어에 **Claude CLI 관리 세션**을 PM2로 상시 띄운다 (YOLO 모드).

```bash
claude --dangerously-skip-permissions \
  -p "escapist 관리 세션. Monitor로 서버 SSE를 감시하고, 명령이 오면 실행해." \
  --allowedTools "Bash,Read,Monitor"
```

- **Monitor 도구**로 escapist 서버의 SSE 엔드포인트를 감시
- 평소에는 토큰 소모 0 (Monitor가 stdout 대기 중)
- 서버에서 명령이 push되면 Monitor가 감지 → 세션 깨어남 → 실행 → 결과 보고

### 2. escapist 서버: 관리 메시지 채널

escapist 서버가 **중계점** 역할. 명령 발신자는 두 가지:

```
[escapist UI (브라우저)] ──┐
                           ├─ (tRPC / API) → [escapist 서버 on Render] — 관리 명령 큐 + SSE 스트림
[Claude Code 세션 (현재 맥북)] ──┘                  ↓ (SSE push)
                                         [맥북에어: 관리 세션 (Monitor로 대기)]
                                                   ↓ (명령 실행)
                                                   ↑ (결과 보고 → 서버 API)
                                         [두 발신자 모두에서 결과 확인 가능]
```

- **escapist UI**: 버튼 클릭으로 restart/update 등 정형화된 명령
- **Claude Code 세션**: tRPC 직접 호출로 "로그 보고 원인 분석해봐" 같은 판단 필요한 자유형 명령

구성요소:
- **SSE 엔드포인트** (`/api/admin/commands/stream`): 관리 세션이 연결해서 명령을 기다림
- **tRPC 프로시저**: 명령 전송 (`admin.sendCommand`), 결과 조회 (`admin.getResult`), 로그 조회 (`admin.getLogs`)
- **인증**: 기존 JWT auth + 관리자 전용 체크 (ALLOWED_EMAIL 기반)

### 3. cli-worker: PM2 로그 전송

cli-worker가 서버에 WS 연결할 때:
- 최근 PM2 로그 N줄 전송
- 크래시 후 재시작 시 이전 에러 로그 전송
- 서버가 DB나 메모리에 보관 → UI에서 조회 가능

### 4. escapist UI: 관리자 페이지

- cli-worker 연결 상태 (이미 헤더에 표시 중)
- PM2 로그 뷰어
- 원격 명령 버튼: restart, update (git pull + restart), 커스텀 명령
- 명령 실행 결과 표시

### 5. 세션 설정 패널

Claude CLI 세션 생성 전 설정:
- **allowedTools**: WebSearch, WebFetch 등 체크리스트
- **model**: 모델 선택 (claude-sonnet-4-6, claude-opus-4-6 등)
- **effort**: max-turns, output length 등
- 진행 중인 세션에서도 현재 설정 확인 가능

### 보안 고려사항

- 관리 세션이 YOLO 모드이므로 **서버 측에서 명령 검증 필수**
- 관리 API에 JWT 인증 + 관리자 체크
- 명령 실행 범위를 escapist 프로젝트 디렉토리로 제한하거나, 최소한 위험 명령 필터링

## 관련 파일

- `packages/server/src/index.ts` — Fastify 서버 진입점
- `packages/cli-worker/src/index.ts` — cli-worker WS 클라이언트
- `packages/shared/src/worker.ts` — server↔cli-worker WS 프로토콜 타입
- `packages/client/src/` — 프론트엔드

## 구현 방향

1. 서버에 관리 메시지 채널 (SSE + tRPC) 추가
2. cli-worker에 PM2 로그 전송 기능 추가
3. 관리 세션 스크립트 작성 + PM2 설정
4. 프론트엔드 관리자 페이지
5. 세션 설정 패널 (allowedTools, model, effort)

## Branch

- feat/cli-worker-remote-management

## 진행 기록

- 2026-06-29 작업 시작

## 변경 파일

### shared
- `packages/shared/src/worker.ts` — AdminEvent, AdminCommandRequest/Result, WorkerLogReport 타입 추가

### server
- `packages/server/src/admin/store.ts` (신규) — 인메모리 명령 큐, 로그 버퍼, SSE pushFn 관리
- `packages/server/src/trpc/routers/admin.ts` (신규) — adminRouter (status, sendCommand, getCommandResult, getRecentCommands, getLogs)
- `packages/server/src/trpc/router.ts` — admin 라우터 등록
- `packages/server/src/claude/worker-bridge.ts` — PM2 로그 수신(WorkerLogReport) 처리 추가
- `packages/server/src/index.ts` — GET /api/admin/commands/stream (SSE), POST /api/admin/commands/result 추가

### cli-worker
- `packages/cli-worker/src/index.ts` — WS 연결 시 pm2 로그 100줄 전송
- `packages/cli-worker/src/admin-session.ts` (신규) — SSE 감시 → 화이트리스트 execFile 실행 → 결과 보고
- `packages/cli-worker/ecosystem.config.cjs` — escapist-admin PM2 앱 추가
- `packages/cli-worker/SETUP.md` — admin-session 설정 가이드 추가

### client
- `packages/client/src/hooks/useAdmin.ts` (신규) — tRPC admin.* 래핑 훅
- `packages/client/src/pages/AdminPage.tsx` (신규) — 관리자 페이지 (연결 상태, 명령 버튼, 결과, 로그)
- `packages/client/src/components/ui/SessionConfigPanel.tsx` (신규) — allowedTools/model 설정 패널 (localStorage 저장, 미연결 — 향후 CLI 연동 별도 작업)
- `packages/client/src/pages/SettingsPage.tsx` — 관리자 페이지 진입 버튼 추가
- `packages/client/src/pages/SettingsPageWrapper.tsx` — onAdmin → /admin 라우팅
- `packages/client/src/router.tsx` — /admin 라우트 추가

## Notes

- inter-session(voltron-bus)은 같은 머신 내 통신이라 크로스 네트워크에는 부적합 → escapist 서버를 중계점으로 활용
- Gmail 폴링 방식은 토큰 낭비 → Monitor + SSE 조합으로 토큰 소모 최소화
- Claude CLI `--resume`으로 세션은 cli-worker 재시작에도 유지됨 (Claude 서버 측 저장)
- 진행 중 요청은 cli-worker 사망 시 유실 → 프론트에서 타임아웃 + 재시도 UX로 커버
