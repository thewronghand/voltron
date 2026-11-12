큰 작업을 태스크 단위로 분해하고 구현→리뷰 루프로 처리한다.

> 구현은 **Codex executor(`codex exec`, gpt-6.1-terra max)** 또는 메인, 리뷰는 **Claude reviewer**가 독립적으로 한다.
> 위임 기준·실행 명령·지시서 계약은 [`guides/codex-executor.md`](../../guides/codex-executor.md)가 정본이다.
> (컨텍스트 분리 원칙: 짠 사람과 검토하는 사람이 같으면 같은 사각지대를 둘 다 못 본다.
> reviewer는 별도 컨텍스트 + 구현 의도 미전달로 그 편향을 끊는다.)

## Phase 0: 태스크 분해 (사용자 컨펌 필수)

1. 작업 설명을 받는다
2. 필요시 기존 코드 구조 파악 (Explore 에이전트 또는 직접)
3. TaskCreate로 태스크 리스트 작성 — 각 태스크: subject, description, 예상 범위(파일 수), 의존(blockedBy)
4. **사용자에게 보여주고 승인받는다.** 승인 없이 구현 시작 금지.

## Phase 1: 구현 루프

태스크를 순서대로 (blockedBy 선행 완료 후):

1. TaskUpdate → in_progress
2. **구현** — 5개 이상 파일·시행착오 예상이면 지시서를 써서 `codex exec`로 위임(백그라운드, 완료 알림 대기). 작으면 메인이 직접. 범위 밖 작업이 필요하면 플래그만 하고 멈춰 사용자에게 보고.
3. 메인이 diff를 직접 보고 프로젝트 게이트(lint·typecheck·test)를 다시 돌려 EXIT로 확인 — executor 보고를 그대로 믿지 않는다
4. **reviewer 에이전트 호출** — diff/변경 파일만 전달, **구현 의도·결정 이유는 전달하지 않는다.**
5. reviewer PASS → completed
6. reviewer FAIL → 지적을 원문과 대조해 확인 → actionable findings만 executor에 새 라운드(resume)로 넘기거나 minor는 메인이 직접 수정 → fresh reviewer로 4번 복귀 (상한 없음)
7. 같은 blocking finding 반복·리뷰 간 충돌·사용자 선택 필요·진전 불가 → **사용자에게 에스컬레이션** (자동 진행 중단)
8. 다음 태스크

## Phase 2: 완료 보고

- 전체 변경 요약 (파일 + 핵심 변경)
- 리뷰 통과/실패 현황
- 남은 TODO / 에스컬레이션 항목
- 이번에 드러난 함정이 있으면 `lessons/`에 기록 제안

## 루프 종료 조건

- 모든 태스크 completed
- 사용자 중단
- 위 에스컬레이션 조건 발생

## 주의

- Phase 0 승인 필수.
- reviewer는 코드만 보고 판단 — 왜 그렇게 했는지 알면 편향이 생긴다.
- **브라우저 시각 검증**: UI 변경은 Storybook에서 실제 렌더를 확인하는 것이 reviewer 정적 분석보다 강하다. 둘 다 활용.
