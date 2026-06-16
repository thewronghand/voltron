# Synapse

마크다운 기반 PKM(Personal Knowledge Management) **데스크탑 앱**. 위키링크로 노트를 잇고, D3 그래프로 시각화하며, Mastra 기반 AI 챗봇(Neuro)·음성메모 STT·RAG를 얹는다.

> 이 파일은 `synapse/` 하위(코드 레포 포함)에 공통 적용된다.
> 공통 원칙(`voltron-personal/CLAUDE.md`) + 전역 규칙(`~/.claude/CLAUDE.md`)도 자동 상속됨.
> 코드 레포는 한 단계 더 중첩됨: `synapse/synapse-code/synapse/` (앱 본체), 옆에 `oauth-proxy/`·`docs/`.

---

## Critical Rules (synapse 고유)

> `@/` 강제, `any` 금지, 커밋 제목 한 줄은 상위 CLAUDE.md에서 상속됨.

- **"dev에서 됐다"는 검증이 아니다** — Electron 앱은 `app.isPackaged`로 동작이 갈린다. `npm run dev`(Next 개발서버)에서 멀쩡해도 DMG 빌드(`electron:build`)에서 깨지는 버그가 반복됐다(폰트 404, standalone 경로, asset 누락 등). 빌드 관련 변경은 **반드시 패키징 빌드로 검증**.
- **경로는 환경 분기 함수로만** — 노트/데이터 경로를 하드코딩 금지. packaged는 `USER_DATA_DIR`·`~/Documents/Synapse/notes`, dev는 `process.cwd()`·`NOTES_DIR`로 갈린다. `lib/data-path.ts`(`getUserDataDir`/`getDataFilePath`/`getExportDataDir`)·`lib/notes-path.ts` 경유.
- **YAML frontmatter 함정** — `title`이 숫자로 파싱될 수 있어 `String()` 변환 필요. `title`에 콜론(`:`) 포함 시 따옴표로 감싸야 파싱 오류 안 남.
- **AI 도구는 Mastra Tools 경유** — 문서 CRUD를 챗봇이 수행할 땐 `lib/mastra/tools/`의 등록된 Tool로. fs 직접 조작 금지.
- **퍼블리시 모드 스텁** — `build:publish`는 Electron 전용 모듈을 스텁으로 교체해 Vercel 빌드를 만든다. Electron API(`electron`, `child_process` 등)를 쓰는 코드는 퍼블리시 빌드에서 깨질 수 있으니 import 위치 주의.

## 작업 하네스

- **세션 연결**: 작업 내용이 확정되면 `/voltron-bus`로 이 세션을 personal 버스에 연결할지 사용자에게 **제안한다** (연결명 `synapse-작업명`, 티켓 없음). 규칙 상세는 상위 `voltron-personal/CLAUDE.md`.
- **큰 작업**: `/ralph` — 태스크 분해(사용자 승인) → 메인 구현 → `reviewer` 독립 리뷰 루프.
- **구현 후 리뷰**: 탐색·여러 파일 변경은 `reviewer` 에이전트로 diff 기반 리뷰(구현 의도 미전달 — 자가평가 편향 방지). 1~2줄 수정은 생략.
- **훅**: 편집 시 컨벤션 체크(any/상대경로) 자동 실행, `main`/`dev` 직접 편집 차단 (`synapse-workflow/hooks/`).
- **지식 축적**:
  - 같은 실수 반복 → `synapse-workflow/lessons/`에 "증상 → 원인 → 교훈"
  - 복잡한 아키텍처 결정 → `synapse-workflow/why-tho/`에 상황·판단·근거
  - 반복되는 작업 패턴·체크리스트 → `synapse-workflow/cookbook/`
  - 하네스는 실패에서 자란다. 가상의 미래가 아니라 실제 발생한 것에만 규칙·훅 추가 (메타 원칙: `voltron-personal/bootstrap/`)

## 정체성

- **목적**: 의현 개인 PKM 데스크탑 앱 + Vercel 읽기전용 퍼블리시
- **git**: 개인 계정 `thewronghand`. remote는 SSH alias(`git@github-personal:...`). push는 SSH라 토큰 불필요. `gh` CLI 쓸 땐 `source .envrc && gh ...`.
- 기존 설계 자산: `synapse-code/synapse/.claude/mastra-docs/`(Mastra 레퍼런스), `ai-integration-plan.md`, `ISSUES.md`.

## 기술 스택

| 영역 | 스택 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) + React 19 + TypeScript |
| 데스크탑 | Electron 39 (+ electron-builder, standalone fork) |
| 에디터 | CodeMirror 6 (`@uiw/react-codemirror`, lang-markdown) |
| 그래프 | D3.js 7 + force-graph |
| 스타일 | Tailwind CSS 4 + Radix UI + shadcn(components.json) |
| AI 프레임워크 | Mastra (`@mastra/core`·`memory`·`rag`·`libsql`) |
| AI 모델 | Google Vertex AI / Gemini (`@ai-sdk/google-vertex`) |
| 채팅 스트리밍 | Vercel AI SDK (`ai`, `@ai-sdk/react`) |
| 벡터/메모리 | LibSQL (채팅 히스토리·워킹 메모리·벡터스토어) |
| 마크다운 | react-markdown + remark/rehype (gfm, wiki-link, math, katex) |
| 퍼블리시 | Vercel (읽기전용 사이트, GCS 데이터 export) |

## 아키텍처

```
[Electron main.js] ──fork──> [Next.js standalone server.js]
       │                              │
   BrowserWindow                  App Router (api/, page)
       │                              │
   userData / Documents/Synapse/notes ←─ 노트 파일시스템
                                      │
                          [Mastra Neuro Agent] ──> Vertex AI
                                      │
                          [LibSQL] 채팅·메모리·벡터
```

- **packaged**: `electron/main.js`가 `.next/standalone` 안의 `server.js`를 `fork`로 띄우고 `NOTES_DIR`/`USER_DATA_DIR` 주입. `copy-assets.js`가 standalone에 static/notes 복사.
- **dev**: `electron:dev`가 `next dev` + `wait-on` + electron 동시 실행.
- **publish**: `build:publish`가 Electron 의존 스텁 교체 후 Next 빌드 → Vercel 배포.

## 주요 디렉토리

```
synapse-code/synapse/
  app/              # Next.js App Router
    api/            #   API 라우트 (ai, voice-memos, settings, oauth …)
    documents/ editor/ note/ settings/ chat/ meeting/ voice-memos/ tags/
    layout.tsx page.tsx globals.css
  components/        # ui/ editor/ graph/ chat/ voice-memo/ settings/
  lib/              # 유틸 (아래 핵심 파일 참조)
    data-path.ts    #   ★ packaged vs dev 경로 분기 (하드코딩 금지)
    notes-path.ts   #   노트 경로 처리
    document-parser.ts  # 마크다운/frontmatter 파싱
    mastra/         #   AI Agent — agents/neuro-agent.ts, tools/(문서 CRUD), memory.ts, vector-store.ts, embedding.ts
    github-*.ts vercel-*.ts gcp-*.ts  # 퍼블리시·OAuth 클라이언트
  electron/         # main.js (BrowserWindow + standalone fork), preload.js
  mastra/           # mastra index + meeting-summary agent
  scripts/          # build-publish.js, copy-assets.js, set/restore-version.js
  oauth-proxy/      # (옆 디렉토리) OAuth 프록시 — tsconfig exclude 대상
```

## 데스크탑 앱 검증

```bash
cd synapse-code/synapse
npx tsc --noEmit         # 빠른 타입 체크
npm run build            # Next.js 빌드
npm run build:publish    # 퍼블리시 모드 (스텁 교체 + CI=1)
npm run electron:build   # DMG 빌드 — 빌드/경로/asset 관련 변경 시 필수
```

**빌드·경로·Electron 관련 변경은 dev 통과만으로 끝내지 말 것.** 릴리즈 전 위 3종 모두 통과 확인. 상세 체크리스트: `synapse-workflow/cookbook/desktop-build-checklist.md`.

## Git 전략

synapse는 **`dev`** 를 통합 브랜치로 쓴다(공통 가이드의 `develop` 대신 — 기존 브랜치 80여 개가 이 흐름). 흐름:

```
main (릴리즈) ──(분기)──> feat|fix|refactor|perf/{설명} ──(머지)──> dev ──(3종 빌드 검증 후)──> main
```

- 보호 브랜치(`main`/`dev`) 직접 편집은 가드 훅이 차단. 메타 파일(`.md`/`.claude`)은 허용. 우회: `ALLOW_DIRECT_PROTECTED=1`.
- **수정 중에는 버전을 올리지 않는다.** dev에서 충분히 검증 후 한 번만 릴리즈(태그 푸시 → GitHub Actions 빌드).
- 커밋 메시지는 제목만. Claude/Anthropic·Co-Authored-By 문구 금지.
- 공통 원칙: `voltron-personal/guides/git-workflow.md`.
