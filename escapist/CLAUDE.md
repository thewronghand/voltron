# Escapist

Claude CLI 세션 기반 면접 준비 앱. 질문 등록 → 답변 평가 → 꼬리질문으로 깊이를 파고드는 학습 도구.

> 이 파일은 `escapist/` 하위(코드 레포 포함)에 공통 적용된다.
> 공통 원칙(`voltron-personal/CLAUDE.md`) + 전역 규칙(`~/.claude/CLAUDE.md`)도 자동 상속됨.
> **코드 세부**(아키텍처·디렉토리·데이터 모델·WS 프로토콜 등)는 `escapist-code/CLAUDE.md` 참조.

---

## Critical Rules (escapist 고유)

> `@/` 강제, `any` 금지, 커밋 제목 한 줄은 상위 CLAUDE.md에서 상속됨.

- **Claude 응답은 반드시 `parseClaudeJson()`으로 파싱** — JSON이 마크다운 코드블록으로 감싸져 올 수 있음
- **서버 데이터는 SQLite** — fs JSON 직접 읽기/쓰기 금지 (`store.ts` 경유)
- **Tailwind는 디자인 토큰 사용** — 하드코딩 색상/간격 지양 (`bg-canvas`, `text-ink`, `border-hairline` 등)
- **새 UI 컴포넌트는 `@thewrong/ui` 우선** — 기존 자체 구현(Button/Modal/Toast 등)은 유지하되 신규는 라이브러리에서
- **WS 이벤트 격리** — 공유 이벤트는 세션 ID prefix로 필터 (`s_`=learn, `sb_`=sandbox, `iv_`=interview, `h_`/`hints_`=hint)

## 작업 하네스

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
- **git**: 개인 계정 `thewronghand` / `penfreak77@gmail.com`. push 시 `source .envrc && git push`
- 기획서: `escapist-code/docs/PLAN.md` · 디자인 명세: `escapist-code/DESIGN.md` · 제품 전략: `escapist-code/PRODUCT.md`

## 기술 스택

| 영역 | 스택 |
|------|------|
| 프론트엔드 | React + Vite + TypeScript + Tailwind CSS v4 |
| 라우팅 | TanStack Router (코드 기반, View Transitions) |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | jotai (atoms) |
| 서버 | Node.js + Express + WebSocket (ws) |
| AI | Claude CLI (`claude -p`, `--resume`) via child_process |
| DB | SQLite (better-sqlite3) — `escapist-code/server/data/escapist.db` |
| 차트 | Recharts |
| 다이어그램 | Mermaid.js + React Flow (@xyflow/react) |
| 마크다운 | react-markdown + remark-gfm + react-syntax-highlighter (oneDark) |
| UI 라이브러리 | @thewrong/ui (새 컴포넌트 추가 시 우선 사용) |

## 아키텍처

```
[React :5180] ←WebSocket→ [Express :8888] ←child_process→ [Claude CLI]
                                ↕
                        [SQLite escapist.db]
```

- **프론트 → 서버**: WebSocket으로 채팅/힌트/샌드박스/채점, REST로 CRUD/통계
- **서버 → Claude CLI**: `claude -p "..." --system-prompt "..." --output-format json`
- **세션 이어가기**: `claude --resume $SESSION_ID -p "..."`
- **REST API**: `/api/questions`, `/api/sessions`, `/api/stats`, `/api/profile`
- **Vite proxy**: `/api` → :8888, `/ws` → ws://:8888

### 레이어 의존 규칙

```
pages → components, hooks, stores
hooks → lib (ws.ts, api.ts, utils.ts)
stores → (jotai atoms, TanStack Query)
components → lib, types
lib → (외부 의존성만)
```

## 주요 디렉토리

```
escapist-code/client/src/
  components/  layout/ ui/ chat/ learn/ interview/ endless/ sandbox/
  hooks/       useChat, useHints, useQuestions, useSandbox, useInterview, useStats, useProfile, useQuestionGenerator
  layouts/     RootLayout (AppShell + Outlet + SandboxOverlay)
  lib/         ws.ts (WebSocket 클라이언트), api.ts (REST 래퍼), utils.ts (parseClaudeJson, scoreColor, gradeFor, cn, timeAgo)
  pages/       Dashboard, Learn, Interview, Endless, Sandbox, Settings
  stores/      chat.ts (jotai atoms), queries.ts (TanStack Query)
  types/index.ts   타입 + 상수 (InterviewType, AGENTS, CATEGORIES, CAT_ACCENT, UserProfile)
  router.tsx   TanStack Router 라우트
  tokens.css   디자인 토큰 + View Transitions 애니메이션

escapist-code/server/src/
  claude/      cli.ts (startSession/resumeSession), prompts.ts (에이전트별 프롬프트 + buildGeneratorPrompt)
  data/        db.ts (SQLite 초기화), store.ts (CRUD, snake↔camel 자동 변환)
  routes/      questions.ts, sessions.ts, stats.ts, profile.ts
  ws/          handler.ts (WS 라우팅)
```

## 라우팅

TanStack Router + View Transitions. `/`(Dashboard) `/learn` `/interview` `/endless` `/sandbox` `/settings`.
데스크톱은 컨텐츠 페이드+슬라이드(헤더/NavRail 고정), 모바일(<640px)은 가로 슬라이드 + BottomNav.

## Claude CLI 연동 주의

- **응답 파싱**: `--output-format json`이어도 `result`에 마크다운 코드블록으로 JSON이 감싸져 올 수 있음 → 항상 `parseClaudeJson()` (코드블록 제거 + JSON 추출 + fallback).
- **세션 ID prefix로 모드 구분**: `s_`(learn) `sb_`(sandbox) `h_`/`hints_`(hint) `iv_`(interview/endless). `session:loaded` 이벤트는 prefix 체크로 격리.
- **특수 메시지 프로토콜**:
  - `__SKIP__` → "모르겠다" (서버에서 explanation 프롬프트로 변환, UI 빨간 skip 버블)
  - `__FOLLOWUP_ANSWER__{질문}__SEP__{답변}` → 꼬리질문 답변
  - `__EXPLAIN__{질문}` → 모범답변 즉시 요청

### WS 메시지 프로토콜

| Client → Server | 용도 |
|----------------|------|
| `chat:send` | 학습 채팅 (세션 없으면 자동 생성, interviewType으로 프롬프트 분기) |
| `session:load` | 세션 + 메시지 이력 로드 |
| `hint:request` / `hint:load` | 힌트 요청/로드 (질문별 5단계) |
| `sandbox:send` | 샌드박스 채팅 (메시지 DB 저장) |
| `interview:eval` / `interview:summary` / `interview:save` | 단건 채점 / 총평 / 기록 저장 |
| `questions:generate` | 질문 자동 생성 (프로필 기반, 중복 방지) |

## 데이터 모델 (SQLite)

- **questions**: `id`(`q_` prefix), `interview_type`(technical/behavioral/opinion), `status`(unlearned/learning/weak/master), `best_score`·`average_score`(채점 시 자동 갱신)
- **sessions**: `id`(prefix로 모드 구분), `mode`(learn/hint/sandbox/interview/endless), `messages`(JSON), `question_text`(세션 제목)
- **user_profile**: `id`(고정 1, 단일 행), `job_role`·`experience_level`, `tech_stack`·`interest_stack`·`ai_tools`(JSON), `memo`

## 배포 계획 (Phase 5)

모노레포 + Fastify + tRPC 전환. 클라우드 API/프론트/DB(Turso) + 맥북 cli-worker → Claude CLI. 맥북 꺼져도 앱 동작(Claude 기능만 오프라인). 상세: `escapist-code/docs/PLAN.md`.

## 검증

```bash
cd escapist-code && npm run dev          # client(:5180) + server(:8888)
cd escapist-code/client && npx tsc --noEmit
cd escapist-code/server && npx tsc --noEmit
```
**작업 완료 후 반드시 클라이언트 빌드 확인.**

## Git 전략

`voltron-personal/guides/git-workflow.md` 참조 — `main` + `develop` + `feat/*` 3종. 보호 브랜치(`main`/`develop`) 직접 작업 금지.

## 디자인

- Raycast 기반 다크 테마 (`tokens.css` → Tailwind `@theme`)
- impeccable 스킬 활용 가능 (`/impeccable critique`, `/impeccable polish` 등)
