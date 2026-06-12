# voltron

[@thewronghand](https://github.com/thewronghand)의 **개인 프로젝트 하네스 모노레포**.

개인 사이드프로젝트(thewrong-ui, synapse, escapist, tarot 등)의 Claude Code 작업 규칙·에이전트·훅·실패 기록을 한 곳에서 관리한다. 각 코드 레포는 독립 git을 유지한 채 이 레포 안에 물리적으로 중첩되어, 상위 `CLAUDE.md`가 계층적으로 자동 상속된다.

## 구조

```
voltron/
  CLAUDE.md              # 개인 프로젝트 공통 원칙 (KISS/YAGNI/Rule of Three…)
  bootstrap/             # 하네스 진화 메타원칙 (규칙·훅·에이전트를 언제/어떻게 추가하나)
  .claude/
    agents/reviewer.md   # 공통 리뷰 에이전트 (diff 기반 독립 리뷰)
    commands/ralph.md    # 큰 작업 분해 → 구현 → 리뷰 루프
  <project>-workflow/    # 프로젝트별 하네스 (정본)
    CLAUDE.md            #   프로젝트 정체성·정책
    hooks/               #   편집 시 컨벤션/타입 체크
    lessons/             #   실패 기록 (증상 → 원인 → 교훈)
    sync-claude.sh       #   코드 레포 .claude/ 로 동기화
  <project>/             # 코드 레포 (독립 git, .gitignore로 추적 제외)
```

## 계층 상속

코드 레포에서 작업하면 Claude Code가 상위로 올라가며 `CLAUDE.md`를 모두 로드한다:

```
~/.claude/CLAUDE.md              # 전역 (사용자 정체성·취향)
voltron/CLAUDE.md                # 개인 공통 원칙
voltron/<project>/CLAUDE.md      # 프로젝트 규칙 (sync-claude.sh로 배치)
```

## 작업 흐름

- **`/ralph`** — 큰 작업을 태스크로 분해(사용자 승인) → 메인이 직접 구현 → `reviewer`가 독립 리뷰하는 루프.
- **`reviewer`** — 구현 의도를 모른 채 diff만 보고 리뷰(자가평가 편향 방지). 심각도(CRITICAL/HIGH/MEDIUM/LOW)로 분류.
- **하네스 수정** — `<project>-workflow/`에서 고친 뒤 `sync-claude.sh` 실행으로 코드 레포에 반영.

## 핵심 철학

> **하네스는 실패에서 자란다.** 가상의 미래 요구가 아니라 실제 발생한 실수·혼동·낭비에 대응해서만 규칙·훅·에이전트를 추가한다.

상세는 [`bootstrap/`](bootstrap/) 참조.

## 프로젝트

| workflow | 코드 레포 | 설명 |
|----------|-----------|------|
| `thewrong-ui-workflow/` | [thewrong-ui](https://github.com/thewronghand/thewrong-ui) | 개인 React UI 컴포넌트 라이브러리 (@thewrong/ui) |
