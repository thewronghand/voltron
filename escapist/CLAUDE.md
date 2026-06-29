# Escapist

Claude CLI 세션 기반 면접 준비 앱. 질문 등록 → 답변 평가 → 꼬리질문으로 깊이를 파고드는 학습 도구.

> 이 파일은 `escapist/` 하위(코드 레포 포함)에 공통 적용된다.
> 공통 원칙(`voltron-personal/CLAUDE.md`) + 전역 규칙(`~/.claude/CLAUDE.md`)도 자동 상속됨.
> **코드 세부**(아키텍처·디렉토리·데이터 모델·WS 프로토콜 등)는 `escapist-code/CLAUDE.md` 참조.

---

## Critical Rules (escapist 고유)

> `@/` 강제, `any` 금지, 커밋 제목 한 줄은 상위 CLAUDE.md에서 상속됨.

- **Claude 응답은 반드시 `parseClaudeJson()`으로 파싱** — JSON이 마크다운 코드블록으로 감싸져 올 수 있음
- **서버 데이터는 Turso** — `@libsql/client` 경유 (`packages/server/src/data/store.ts`)
- **Tailwind는 디자인 토큰 사용** — 하드코딩 색상/간격 지양 (`bg-canvas`, `text-ink`, `border-hairline` 등)
- **새 UI 컴포넌트는 `@thewrong/ui` 우선** — 기존 자체 구현은 유지하되 신규는 라이브러리에서
- **WS 이벤트 격리** — 공유 이벤트는 세션 ID prefix로 필터 (`s_`=learn, `sb_`=sandbox, `iv_`=interview, `h_`/`hints_`=hint)
- **tRPC 프로시저 에러는 TRPCError** — `throw new TRPCError({ code: 'NOT_FOUND' })` 등

## 작업 하네스

- **세션 연결**: 작업 내용이 확정되면 `/voltron-bus`로 이 세션을 personal 버스에 연결할지 사용자에게 **제안한다** (연결명 `escapist-작업명`, 티켓 없음). 규칙 상세는 상위 `voltron-personal/CLAUDE.md`.
- **큰 작업**: `/ralph` — 태스크 분해(사용자 승인) → 메인 구현 → `reviewer` 독립 리뷰 루프.
- **구현 후 리뷰**: 탐색·여러 파일 변경은 `reviewer` 에이전트로 diff 기반 리뷰(구현 의도 미전달 — 자가평가 편향 방지). 1~2줄 수정은 생략.
- **훅**: 편집 시 prettier + 컨벤션 체크(any/상대경로) + typecheck 자동 실행 (`escapist-workflow/hooks/`).
- **지식 축적**:
  - 같은 실수 반복 → `escapist-workflow/lessons/`에 "증상 → 원인 → 교훈"
  - 복잡한 아키텍처 결정 → `escapist-workflow/why-tho/`에 상황·판단·근거
  - 반복되는 작업 패턴·체크리스트 → `escapist-workflow/cookbook/`
  - 하네스는 실패에서 자란다. 가상의 미래가 아니라 실제 발생한 것에만 규칙·훅 추가 (메타 원칙: `voltron-personal/bootstrap/`)

## 정체성

- **목적**: 의현 개인 면접/학습 도구
- **배포 URL**: https://escapist.onrender.com
- **git**: 개인 계정 `thewronghand` / `penfreak77@gmail.com`. push 시 `source .envrc && git push`
- **GPG 커밋 서명 필수** — `commit.gpgsign=true` 전역 설정. 키 ID `8D0F8A054C395458` (Ed25519, 만료 2028-06-28). 맥북에어 `update` 명령이 `git verify-commit HEAD`로 검증 → 미서명 커밋은 배포 차단됨. 설계 배경: `escapist-workflow/why-tho/gpg-update-verification.md`
- 기획서: `escapist-code/docs/PLAN.md` · 디자인 명세: `escapist-code/DESIGN.md` · 제품 전략: `escapist-code/PRODUCT.md`

## 기술 스택

| 영역 | 스택 |
|------|------|
| 프론트엔드 | React + Vite + TypeScript + Tailwind CSS v4 + tRPC React Query |
| 라우팅 | TanStack Router (코드 기반, View Transitions) |
| 서버 | Node.js + Fastify v5 + tRPC v11 + WebSocket (@fastify/websocket) |
| AI | Claude CLI (`claude -p`, `--resume`) via cli-worker (WS 연결) |
| DB | Turso (@libsql/client) — 클라우드 SQLite |
| 공유 타입 | @escapist/shared (packages/shared) |
| 차트 | Recharts |
| 다이어그램 | Mermaid.js + React Flow (@xyflow/react) |
| 마크다운 | react-markdown + remark-gfm + react-syntax-highlighter (oneDark) |
| UI 라이브러리 | @thewrong/ui (새 컴포넌트 추가 시 우선 사용) |

## 아키텍처

```
[React :5180] ←WS/tRPC→ [Fastify :8888] ←WS(/worker)→ [cli-worker]
                               ↕                               ↓
                          [Turso DB]                    [Claude CLI]
```

- **프론트 → 서버**: tRPC로 CRUD/통계, WebSocket으로 채팅/힌트/채점
- **서버 → cli-worker**: WebSocket 상시 연결 (`/worker`), requestId 기반 Promise 브릿지
- **cli-worker → Claude CLI**: `child_process.spawn('claude', [...])`
- **세션 이어가기**: `claude --resume $SESSION_ID -p "..."`
- **Vite proxy (개발)**: `/api` → :8888, `/ws` → ws://:8888

## 배포 (Render + PM2)

### Render 서비스

- **서비스 ID**: `srv-d8vu4an7f7vs739j4nq0`
- **URL**: https://escapist.onrender.com
- **CI/CD**: main 브랜치 push 시 자동 배포
- **Build Command**: `npm install --no-save pnpm@10.12.4 && ./node_modules/.bin/pnpm install --frozen-lockfile && ./node_modules/.bin/pnpm build`
- **Start Command**: `npx pnpm@10.12.4 --filter @escapist/server exec tsx src/index.ts`

### Render CLI로 배포 상태 확인

```bash
# 워크스페이스 설정 (최초 1회)
render workspace set tea-d8vtvqe7r5hc73altc20

# 배포 목록 확인
render deploys list srv-d8vu4an7f7vs739j4nq0 --output text

# 실시간 로그
render logs --resources srv-d8vu4an7f7vs739j4nq0 --output text --limit 50

# 수동 배포 트리거
render deploys create srv-d8vu4an7f7vs739j4nq0 --confirm

# 서비스 재시작
render restart srv-d8vu4an7f7vs739j4nq0 --confirm
```

### cli-worker (맥북 PM2)

`packages/cli-worker/SETUP.md` 참조. 연결 상태는 https://escapist.onrender.com 헤더에 표시.

## 주요 디렉토리

```
escapist-code/
  packages/
    shared/src/
      types.ts      공유 타입 (Question, Session, ChatMessage 등)
      constants.ts  카테고리, 에이전트, WS 이벤트 상수
      worker.ts     server↔cli-worker WS 프로토콜 타입
    client/src/
      components/   layout/ ui/ chat/ learn/ interview/ endless/ sandbox/
      hooks/        useChat, useHints, useQuestions, useSandbox, useInterview, useStats, useProfile, useQuestionGenerator, useWorkerStatus
      lib/          ws.ts (WS 클라이언트), api.ts (REST 래퍼), trpc.ts (tRPC 클라이언트), utils.ts
      pages/        Dashboard, Learn, Interview, Endless, Sandbox, Settings
      stores/       chat.ts (jotai atoms)
      types/        index.ts (@escapist/shared re-export)
    server/src/
      auth/         config.ts, middleware.ts (authGuardHook), routes.ts (authPlugin)
      claude/       cli.ts (re-export), worker-bridge.ts (WS 브릿지), prompts.ts
      data/         db.ts (Turso 초기화), store.ts (CRUD, snake↔camel 자동 변환)
      trpc/         context.ts, init.ts, router.ts, routers/{questions,sessions,stats,profile}.ts
      routes/       questions.ts, sessions.ts, stats.ts, profile.ts (Fastify REST, tRPC와 병존)
      ws/           handler.ts (사용자 WS 라우팅)
    cli-worker/src/
      index.ts      WS 클라이언트 (서버 /worker에 연결, 자동 재연결)
      cli.ts        Claude CLI spawn
```

## 검증

```bash
cd escapist-code
pnpm typecheck              # 전체 타입체크
pnpm build                  # server d.ts + client Vite 빌드
pnpm dev                    # 로컬 개발 (client:5180 + server:8888 + cli-worker)
```

**작업 완료 후 반드시 `pnpm typecheck` 통과 확인.**

## Git 전략

`voltron-personal/guides/git-workflow.md` 참조 — `main` + `develop` + `feat/*` 3종. 보호 브랜치(`main`/`develop`) 직접 작업 금지.

## 디자인

- Raycast 기반 다크 테마 (`tokens.css` → Tailwind `@theme`)
- impeccable 스킬 활용 가능 (`/impeccable critique`, `/impeccable polish` 등)
