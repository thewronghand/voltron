# Git 워크플로 (개인 프로젝트 공통)

> 적용 대상: 각 코드 레포(`*-code/`). 하네스 레포(voltron-personal)의 git 전략은 맨 아래 "메타 변경" 참조.
> 개인 프로젝트는 상용 배포가 없으므로 운영 배포 회차·release 브랜치 없이 가볍게 운영한다.

## 브랜치 3종

| 브랜치 | 역할 |
|--------|------|
| `main` | 안정판. 항상 동작하는 상태를 유지. 배포(npm publish 등)는 여기서. |
| `develop` | 통합 검증 공간. 피처를 모아 함께 돌려본 뒤 `main`으로 올린다. |
| `feat/{설명}` | 기능 개발. `origin/main`에서 분기. |

보조 브랜치 (필요 시):
- `hotfix/{설명}` — 급한 수정. `origin/main`에서 분기.
- `chore/{설명}` — 리팩토링·문서·설정. `origin/main`에서 분기.

> **분기 베이스는 항상 `origin/main`** (다른 브랜치 위에 있어도 main 기준).

## 정규 흐름

```
main ──(분기)──> feat/{설명} ──(머지)──> develop ──(검증 후 머지)──> main
```

1. `origin/main`에서 `feat/{설명}` 분기
2. 작업 → 커밋 (제목 한 줄, 한국어)
3. 구현 완료 → `/review` 또는 `reviewer` 에이전트로 리뷰 루프
4. `feat/*` → `develop` 머지 → 통합 검증 (다른 피처와 함께 돌려봄)
5. 검증 통과 → `develop` → `main` 머지
6. (라이브러리면) `main`에서 publish

> 핵심: **피처는 develop에서 통합 검증을 거친 뒤 main으로 올라간다.** `main`은 항상 검증된 상태만 받는다.

## develop 생략 (소규모)

소규모 단발 작업(1~2파일, 회귀 위험 낮음)은 `develop`을 건너뛰고 `feat/*` → `main` 직행해도 된다. develop은 통합 검증이 의미 있을 때 쓰는 관문이지, 모든 한 줄 수정에 강제할 의식은 아니다 (KISS).

## 보호 브랜치 직접 작업

- **`main`·`develop` 직접 작업 금지** — `feat/*`/`chore/*`/`hotfix/*`를 거친다.
- 부득이하게 보호 브랜치에 직접 편집해야 하면 `ALLOW_DIRECT_PROTECTED=1` 환경변수로 일회성 우회 (pre-edit hook만 풀림, 매우 신중히).
- 단, **하네스/문서 메타 파일**(`.claude/`, `CLAUDE.md`, `*-workflow/`)은 보호 브랜치에서도 직접 편집 허용 — 운영 코드와 라이프사이클이 다르다.

## develop 브랜치

`thewrong-ui`·`escapist` 두 레포 모두 `develop`이 생성·push됨 (`origin/develop`).
새 레포에 develop을 만들 때:
```bash
git checkout main && git pull origin main
git checkout -b develop && git push -u origin develop
```

## 커밋

- 제목 한 줄만. body·Co-Authored-By 트레일러 금지 (전역 규칙).
- 한국어.

## 메타 변경 (하네스 레포 voltron-personal)

하네스 레포(이 레포)는 운영 코드가 아니라 작업 규칙·에이전트·훅·기록의 집합이다. 별도 배포 개념이 없으므로:
- `main`에 직접 커밋·push OK. 브랜치 전략을 강제하지 않는다.
- 단, 큰 구조 변경(폴더 재배치 등)은 `chore/{설명}` 브랜치를 따서 한 번 검토 후 머지하는 것을 권장.
