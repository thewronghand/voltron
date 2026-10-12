# shipping-a-button

개발 유머 영상 "Shipping a button in 2026…"의 훈수를 **전부 수용**해서 대시보드 하나를 만들어 보는 실험.
결과물은 대시보드가 아니라 **복잡도의 비용을 잰 측정표와 챕터별 기록**이다.

> 기획 정본: [`shipping-a-button-workflow/planning/00-기획.md`](shipping-a-button-workflow/planning/00-기획.md) — 범위·절충 규칙·챕터 로드맵·측정 항목·결정 기록. **작업 전 필독.**

## Critical Rules (절대 규칙)

1. **기능은 고정, 바뀌는 건 아키텍처뿐** — 화면 다섯 요소(정산 요약, 일자별 표, 다운로드 버튼, 버튼 카운터 패널, API)는 모든 챕터에서 같다. 기능을 늘리거나 줄이지 않는다. 그래야 측정이 공정하다.
2. **챕터 완료 = 대조군과 같은 시드에서 같은 숫자** — 숫자가 다르면 챕터는 미완료다.
3. **0장 대조군은 동결** — 1장 이후 대조군 코드를 고치지 않는다. 계측(OTel 등)도 넣지 않는다. 데이터 생성기 버그처럼 기준선 자체가 틀린 경우만 예외이며, 그때는 전 챕터 측정을 다시 한다.
4. **절충은 두 경우에만** — 문자 그대로 동시에 만족할 수 없을 때, 돈·외부 계정이 필요할 때. 범위를 줄이고 싶은 충동은 절충 사유가 아니다(그게 이 실험이 재는 대상이다). 새 절충·범위 결정은 기획 문서 "결정 기록"에 남긴다.
5. **공개 레포 — 가상 데이터만** — 시드 고정 생성기로 만든 Acme Payments 데이터만 쓴다. 실제 회사명·가맹점명·사내 정책·업무 데이터는 넣지 않는다.
6. **`any` 금지, 폴더 밖 TS import는 `@/`** — voltron-personal 공통 규칙. 다른 언어는 각 언어의 관례를 따른다.

## 정체성

- **성격**: 의도적으로 과설계하는 실험 프로젝트. 상용 배포 없음.
- **도메인**: 가상 PG사 Acme Payments의 가맹점 포털 정산 리포트. 금액은 원 단위 정수, 요율은 bp 정수.
- **git**: 개인 계정 `thewronghand` (local config), remote는 `github-personal` SSH host alias. 레포 `thewronghand/shipping-a-button` (공개).

## 구조

```
shipping-a-button/
  CLAUDE.md                     ← 이 파일
  shipping-a-button-workflow/   ← 하네스 (voltron-personal git이 추적)
    planning/                   ← 기획 정본
    why-tho/                    ← 챕터마다 한 편: "이걸 받아들이자 무엇이 필요해졌나"
    lessons/                    ← 막힌 지점·시행착오
    hooks/ settings.json sync-claude.sh
  shipping-a-button-code/       ← 코드 레포 (공개, 독립 git)
```

코드 레포 내부 구조는 챕터가 진행되며 바뀐다(0장 단일 스크립트 → 1장 마이크로서비스 → 4장 Bazel 모노레포 …). 현재 구조는 코드 레포 README가 정본이다.

## 챕터 작업 절차

1. `origin/main`에서 `feat/chapter-<N>-<slug>` 분기
2. 기획 문서의 해당 챕터 훈수를 구현. 타임박스(기본 한 주말)를 넘기면 미완성인 채로 마무리
3. 대조군과 숫자 대조 → 측정 8항목 측정 → 코드 레포 README 측정표 갱신
4. `why-tho/`에 챕터 기록 한 편, 막힌 지점은 `lessons/`
5. 리뷰 후 main 머지 (`guides/git-workflow.md`)

## 로컬 자원

1장 이후로 로컬 k8s·Istio·Kafka·Neo4j·Dgraph·Keycloak 등이 함께 뜬다. **회사 작업(avocado 게이트 등)과 동시에 띄우지 않고**, 쓰지 않을 땐 스택을 내린다.

## 작업 하네스

- **세션 연결**: 작업 내용이 확정되면 `/voltron-bus-spoke`로 personal 버스 연결을 **제안한다** (연결명 `button-작업명`, 예: `button-chapter-0-baseline`).
- **큰 작업**: `/ralph` — 태스크 분해(사용자 승인) → 메인 구현 → `reviewer` 독립 리뷰 루프.
- **구현 후 리뷰**: 5개 파일 이상/탐색 필요한 변경은 `reviewer` 에이전트로 diff 기반 리뷰.
- **훅**: 보호 브랜치 가드 + 컨벤션 경고 (`shipping-a-button-workflow/hooks/`).
