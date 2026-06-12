# voltron-personal — 개인 프로젝트 공통 하네스

> 이 레포는 [@thewronghand](https://github.com/thewronghand)의 **개인 프로젝트 하네스 모노레포**다.
> 각 개인 프로젝트(thewrong-ui, synapse, escapist, tarot 등)의 작업 규칙·에이전트·훅·실패기록을 한 곳에서 관리한다.
> 전역 규칙(`~/.claude/CLAUDE.md`)도 그대로 적용됨.

---

## Critical Rules

- **import 절대경로 `@/` 강제** — 폴더 밖 참조 한정. 같은 폴더 형제(`./types`)는 허용.
- **`any` 타입 금지** — `unknown` 또는 구체 타입.
- **보호 브랜치 직접 작업 주의** — 프로젝트별 보호 브랜치는 각 `*-workflow/CLAUDE.md` 참조.

## 코딩 원칙 (디폴트 잣대, 위쪽이 우선)

- **KISS** — 가장 단순한 방법으로. 영리한 코드보다 명료한 코드.
- **YAGNI** — 지금 필요 없는 추상화·옵션을 미리 만들지 않는다.
- **Rule of Three** — 같은 패턴이 세 번 등장할 때 추상화. 두 번까진 중복이 낫다.
- **DRY** — Rule of Three 충족 후 적용.
- **Boy Scout Rule** — 만진 코드만 살짝 깨끗하게. 안 만진 코드는 손대지 않는다(스코프 폭주 방지).

## 커밋

- **제목 한 줄만** — body, Co-Authored-By 트레일러 금지.
- 포맷·브랜치 전략은 프로젝트별 `*-workflow/CLAUDE.md` 참조.

## 오케스트레이션

복잡한 작업은 전문 에이전트에 위임. 메인 컨텍스트를 깨끗하게 유지.

- **`/ralph`** — 큰 작업 태스크 분해(사용자 승인) → 메인 구현 → `reviewer` 독립 리뷰 루프. (개인 프로젝트는 executor 없음 — 메인이 직접 구현)
- **`reviewer`** — 구현 후 diff 기반 독립 리뷰. 구현 의도 미전달(자가평가 편향 방지).

## 하네스 진화

하네스(CLAUDE.md, 훅, 에이전트, 가이드)를 손볼 때는 [`bootstrap/`](bootstrap/)을 먼저 본다.

> **하네스는 실패에서 자란다.** 가상의 미래 요구가 아니라 실제 발생한 실수·혼동·낭비에 대응해서만 규칙·훅·에이전트를 추가한다.

## 구조

```
voltron-personal/
  CLAUDE.md              ← 이 파일 (개인 공통 원칙)
  bootstrap/             ← 하네스 진화 메타원칙
  .claude/
    agents/reviewer.md   ← 공통 에이전트
    commands/ralph.md    ← 공통 커맨드
  <project>-workflow/    ← 프로젝트 전용
    CLAUDE.md            ← 프로젝트 정체성·정책 (정본)
    hooks/               ← 프로젝트 전용 훅
    lessons/             ← 실패 기록
    sync-claude.sh       ← 코드 레포 .claude/로 동기화
```

## 하위 프로젝트

| 프로젝트 | 설명 | 코드 레포 |
|----------|------|-----------|
| `thewrong-ui-workflow/` | 개인용 React UI 컴포넌트 라이브러리 (@thewrong/ui) | thewronghand/thewrong-ui |
