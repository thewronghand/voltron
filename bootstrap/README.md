# bootstrap — 하네스를 발전시키기 위한 하네스

이 폴더는 **프로젝트 작업용 가이드가 아니다**. 프로젝트별 작업 규칙은 각 프로젝트의 `*-workflow/guides/`에 있다. `bootstrap/`은 한 단계 위 — **하네스 자체를 어떻게 발전시킬지**에 대한 규칙·원칙·관찰을 모은다.

## 왜 voltron에 두나

하네스 진화 원칙은 프로젝트 무관하다. 어느 프로젝트든 규칙·훅·에이전트를 추가할 때 따라야 할 메타 원칙은 같다. 각 프로젝트 workflow에 bootstrap을 복제하는 대신, voltron에 하나만 두고 모든 프로젝트에서 참조한다.

## 들어있는 것

| 문서 | 역할 |
|------|------|
| [`principles.md`](principles.md) | 하네스 진화의 핵심 원칙 (ratchet, 다이어트, U자 어텐션, 자가 평가 회피 등) |
| [`adding-rules.md`](adding-rules.md) | CLAUDE.md/가이드에 새 규칙을 추가할 때의 기준 (Rule-to-Hook 승격 포함) |
| [`adding-hooks.md`](adding-hooks.md) | 새 훅을 추가할 때의 설계 지침 (차단 vs 교정 피드백) |
| [`adding-agents-skills.md`](adding-agents-skills.md) | 새 에이전트/스킬을 만들 때의 기준 |
| [`anti-patterns.md`](anti-patterns.md) | 하네스 설계의 알려진 함정 (메모리 오염 포함) |
| [`operations.md`](operations.md) | 분기 점검·설정 검증·도구 중립성 등 운영 측면 |

## 사용 시점

- 새 규칙을 CLAUDE.md에 추가하고 싶을 때
- 새 훅을 추가하거나 기존 훅을 강화하고 싶을 때
- 새 에이전트나 스킬을 만들고 싶을 때
- 하네스가 무거워졌다고 느낄 때 (다이어트 검토)
- 같은 실수가 반복될 때 (가드 또는 피드백 추가 검토)

## 핵심 한 줄 요약

> 하네스는 **실패에서 자라난다**. 가상의 미래 요구가 아니라 실제 발생한 실수·혼동·낭비에 대응해서만 규칙·훅·에이전트를 추가한다.
