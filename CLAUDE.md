# voltron-personal — 개인 프로젝트 공통 하네스

> 이 레포는 [@thewronghand](https://github.com/thewronghand)의 **개인 프로젝트 하네스 모노레포**다.
> 각 개인 프로젝트(thewrong-ui, synapse, escapist, tarot 등)의 작업 규칙·에이전트·훅·실패기록을 한 곳에서 관리한다.
> 전역 규칙(`~/.claude/CLAUDE.md`)도 그대로 적용됨.

---

## Critical Rules

- **import 절대경로 `@/` 강제** — 폴더 밖 참조 한정. 같은 폴더 형제(`./types`)는 허용.
- **`any` 타입 금지** — `unknown` 또는 구체 타입.
- **보호 브랜치(`main`/`develop`) 직접 작업 금지** — git 전략은 [`guides/git-workflow.md`](guides/git-workflow.md).

## 코딩 원칙 (디폴트 잣대, 위쪽이 우선)

- **KISS** — 가장 단순한 방법으로. 영리한 코드보다 명료한 코드.
- **YAGNI** — 지금 필요 없는 추상화·옵션을 미리 만들지 않는다.
- **Rule of Three** — 같은 패턴이 세 번 등장할 때 추상화. 두 번까진 중복이 낫다.
- **DRY** — Rule of Three 충족 후 적용.
- **Boy Scout Rule** — 만진 코드만 살짝 깨끗하게. 안 만진 코드는 손대지 않는다(스코프 폭주 방지).

## 커밋

- **제목 한 줄만** — body, Co-Authored-By 트레일러 금지.
- 브랜치 전략: [`guides/git-workflow.md`](guides/git-workflow.md) (`main` + `develop` + `feat/*` 3종, 공통).

## 오케스트레이션

복잡한 작업은 전문 에이전트에 위임. 메인 컨텍스트를 깨끗하게 유지.

- **`/ralph`** — 큰 작업 태스크 분해(사용자 승인) → 메인 구현 → `reviewer` 독립 리뷰 루프. (개인 프로젝트는 executor 없음 — 메인이 직접 구현)
- **`reviewer`** — 구현 후 diff 기반 독립 리뷰. 구현 의도 미전달(자가평가 편향 방지).

## inter-session — 세션 간 작업 관리 (`/voltron-bus`)

개인 프로젝트 세션들을 한 곳에서 총괄하기 위해 inter-session 버스를 쓰되, **직접 쓰지 않고 `/voltron-bus` 와치 레이어를 경유한다** (회사판 voltron-bus의 정제 사본. inter-session 플러그인은 무수정). 스크립트: [`scripts/voltron-bus.py`](scripts/voltron-bus.py).

**채널 격리** — 개인 작업은 **personal 채널(port 9474)** 단일 버스를 쓴다. 회사 작업(voltron 채널 9473)과 물리적으로 분리돼 broadcast가 넘나들지 않는다. 회사판과 로직은 동일하고 상단 설정(채널·sessions 경로·registry)만 personal로 교체돼 있다.

**허브-스포크** — 개인 허브 세션 하나가 관제하고, 각 작업 세션이 personal 버스에 붙는다. 허브에서 list/send로 상태를 묻는다.

- **auto-start off** — 관리 대상 세션만 버스에 남긴다.
- **작업 세션 연결 규칙**: 작업 내용이 확정되면 사용자에게 "이 세션을 연결할까요?"라고 **명시적으로 묻는다**. 임의 연결 금지.
- **연결 이름 = `프로젝트-작업명`** (소문자/하이픈, 40자 이내). **개인 프로젝트는 redmine 티켓이 없으므로 티켓 번호를 넣지 않는다** (회사판과의 핵심 차이). 접두사: `ui`(thewrong-ui)/`escapist`/`synapse`/`tarot`. chore는 `프로젝트-chore-작업명`. 예: `synapse-rag-pipeline`, `ui-chore-deps-bump`.
- **연결은 `voltron-bus connect <연결명>` 경유** — registry-personal.json에 연결명↔cmux세션을 기록해야 `revive`/`reconnect`로 자동 복구된다. 출력된 모니터 커맨드를 Monitor로 띄운다.
- **새 개인 프로젝트를 들일 때** — voltron-bus 설정 불필요(personal 채널 단일, cwd가 `~/dev/voltron-personal/` 하위면 자동). 접두사만 위 목록에 추가.
- **워크트리를 늘릴 때** — 설정 불필요. 연결명에 워크트리 번호를 넣지 않는다(점유 워크트리는 cwd에서 `wt2`로 자동 표시). 전제: 워크트리 디렉토리는 `<코드디렉토리>-N` 패턴.
- **재부팅 후 복구**: cmux `restore-session` → 허브에서 `voltron-bus revive-ongoing`. ongoing만 `claude --resume`으로 부활, completed는 제외돼 RAM을 아낀다. cmux 세션을 여는 것 자체는 수동이며, wrapper가 없애는 건 "연결명·채널을 다시 치는" 수고다.

### 세션 총괄 일지 (`sessions/`)

허브가 [`sessions/`](sessions/)로 작업 이력을 총괄한다. `ongoing/`(진행중)·`completed/`(마무리)가 곧 **voltron-bus의 status 단일 진실 소스**이고, ongoing↔completed 위치가 재부팅 후 자동부활 정책을 결정한다. 운영 방식은 [`sessions/README.md`](sessions/README.md) 참조.

## 하네스 진화

하네스(CLAUDE.md, 훅, 에이전트, 가이드)를 손볼 때는 [`bootstrap/`](bootstrap/)을 먼저 본다.

> **하네스는 실패에서 자란다.** 가상의 미래 요구가 아니라 실제 발생한 실수·혼동·낭비에 대응해서만 규칙·훅·에이전트를 추가한다.

## 구조

각 프로젝트는 **컨테이너 폴더** 안에 정본 `CLAUDE.md` + 워크플로 + 코드 레포를 묶는다.
컨테이너에 물리적으로 중첩되므로 상위 `CLAUDE.md`가 **자동 상속**된다 (코드 레포에 별도 복사 불필요).

```
voltron-personal/
  CLAUDE.md              ← 이 파일 (개인 공통 원칙)
  bootstrap/             ← 하네스 진화 메타원칙
  guides/
    git-workflow.md      ← 공통 git 전략 (main/develop/feat)
  .claude/
    agents/reviewer.md   ← 공통 에이전트
    commands/ralph.md    ← 공통 커맨드
  <project>/             ← 컨테이너 (예: thewrong-ui/, escapist/, synapse/)
    CLAUDE.md            ← 정본 (프로젝트 정체성·정책) ★상위 자동 상속
    <project>-workflow/  ← 하네스 (voltron-personal git이 추적)
      hooks/             ← 프로젝트 전용 훅
      lessons/           ← 실패 기록 (증상→원인→교훈)
      why-tho/           ← 설계 결정 이유
      cookbook/          ← 재사용 패턴·체크리스트
      settings.json      ← 훅 등록 (코드 레포로 sync)
      sync-claude.sh     ← .claude/ 만 코드 레포로 동기화 (자동 실행 — 아래 참조)
    <project>-code/      ← 코드 레포 (.gitignore — 각자 독립 git)
```

> **CLAUDE.md vs .claude/**: 상위 `CLAUDE.md`는 디렉토리 중첩으로 자동 상속되지만, `.claude/`(agents·commands·hooks·settings)는 git 레포 루트 것만 적용돼 상속 안 됨. 그래서 `.claude/`만 코드 레포에 복사한다.
>
> **정본·공개·자동 sync**:
> - 정본은 voltron-personal(비공개 하네스 레포)이 추적한다. 코드 레포의 `CLAUDE.md`·`.claude/`는 코드 레포 `.gitignore`로 빠져 **공개되지 않는다**.
> - `CLAUDE.md`는 자동 상속이라 코드 레포에 사본조차 두지 않는다 (복사 안 함).
> - `.claude/`는 voltron-personal의 정본 자산(`.claude/agents·commands`, `<project>-workflow/{hooks,settings.json}`)을 **편집하면 자동으로** 코드 레포에 sync된다 (`.claude/hooks/auto-sync-claude.sh`). 수동 실행도 가능: `bash <project>/<project>-workflow/sync-claude.sh`.

## 하위 프로젝트

| 컨테이너 | 설명 | 코드 레포 |
|----------|------|-----------|
| `thewrong-ui/` | 개인용 React UI 컴포넌트 라이브러리 (@thewrong/ui) | thewronghand/thewrong-ui |
| `escapist/` | Claude CLI 기반 면접 준비 앱 | thewronghand/escapist |
| `synapse/` | 마크다운 PKM 데스크탑 앱 (Electron+Next, AI 챗봇/RAG) | thewronghand/synapse |
