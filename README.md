# voltron-personal

[@thewronghand](https://github.com/thewronghand)의 **개인 프로젝트 하네스 모노레포**.

개인 사이드프로젝트(thewrong-ui, synapse, escapist, tarot 등)의 Claude Code 작업 규칙·에이전트·훅·실패 기록을 한 곳에서 관리한다. 각 코드 레포는 독립 git을 유지한 채 이 레포 안에 물리적으로 중첩되어, 상위 `CLAUDE.md`가 계층적으로 자동 상속된다.

## 구조

각 프로젝트는 **컨테이너 폴더** 안에 정본 `CLAUDE.md` + 워크플로 + 코드 레포를 묶는다.

```
voltron-personal/
  CLAUDE.md              # 개인 프로젝트 공통 원칙 (KISS/YAGNI/Rule of Three…)
  bootstrap/             # 하네스 진화 메타원칙 (규칙·훅·에이전트를 언제/어떻게 추가하나)
  guides/
    git-workflow.md      # 공통 git 전략 (main/develop/feat)
  .claude/
    agents/reviewer.md   # 공통 리뷰 에이전트 (diff 기반 독립 리뷰)
    commands/ralph.md    # 큰 작업 분해 → 구현 → 리뷰 루프
  <project>/             # 컨테이너 (thewrong-ui/, escapist/)
    CLAUDE.md            #   정본 — 프로젝트 정체성·정책 (상위 자동 상속)
    <project>-workflow/  #   하네스 (이 레포가 추적)
      hooks/             #     브랜치 가드 + 편집 시 컨벤션/타입 체크
      lessons/           #     실패 기록 (증상 → 원인 → 교훈)
      why-tho/           #     설계 결정 이유
      cookbook/          #     재사용 패턴·체크리스트
      sync-claude.sh     #     코드 레포 .claude/ 로 동기화 (편집 시 자동 실행)
    <project>-code/      #   코드 레포 (독립 git, .gitignore로 추적 제외)
```

## 계층 상속

코드 레포가 컨테이너 안에 물리적으로 중첩되어, 작업하면 Claude Code가 상위로 올라가며 `CLAUDE.md`를 모두 로드한다:

```
~/.claude/CLAUDE.md                    # 전역 (사용자 정체성·취향)
voltron-personal/CLAUDE.md             # 개인 공통 원칙
voltron-personal/<project>/CLAUDE.md   # 프로젝트 정본 (자동 상속 — 복사 불필요)
```

> `CLAUDE.md`는 디렉토리 중첩으로 자동 상속되지만 `.claude/`(agents·commands·hooks·settings)는 상속되지 않는다. 그래서 `.claude/`만 코드 레포에 복사한다. 복사는 정본 자산을 편집할 때 **자동으로** 일어난다(`.claude/hooks/auto-sync-claude.sh`). 정본은 비공개 레포(voltron-personal)가 추적하고, 코드 레포의 `CLAUDE.md`·`.claude/`는 `.gitignore`로 빠져 **공개되지 않는다**.

## Git 전략

`main` + `develop` + `feat/*` 3종. 피처는 `develop`에서 통합 검증을 거쳐 `main`으로 올라간다. 상세: [`guides/git-workflow.md`](guides/git-workflow.md).

## 작업 흐름

- **`/ralph`** — 큰 작업을 태스크로 분해(사용자 승인) → 메인이 직접 구현 → `reviewer`가 독립 리뷰하는 루프.
- **`reviewer`** — 구현 의도를 모른 채 diff만 보고 리뷰(자가평가 편향 방지). 심각도(CRITICAL/HIGH/MEDIUM/LOW)로 분류.
- **하네스 수정** — `<project>/<project>-workflow/`(또는 공통 `.claude/`)에서 고치면 자동으로 코드 레포에 sync된다.

## 핵심 철학

> **하네스는 실패에서 자란다.** 가상의 미래 요구가 아니라 실제 발생한 실수·혼동·낭비에 대응해서만 규칙·훅·에이전트를 추가한다.

상세는 [`bootstrap/`](bootstrap/) 참조.

## 프로젝트

| 컨테이너 | 코드 레포 | 설명 |
|----------|-----------|------|
| `thewrong-ui/` | [thewrong-ui](https://github.com/thewronghand/thewrong-ui) | 개인 React UI 컴포넌트 라이브러리 (@thewrong/ui) |
| `escapist/` | [escapist](https://github.com/thewronghand/escapist) | Claude CLI 기반 면접 준비 앱 |
