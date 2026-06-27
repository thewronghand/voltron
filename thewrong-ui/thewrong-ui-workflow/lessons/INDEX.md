# lessons — 실패 기록

같은 실수를 두 번 하지 않기 위한 기록. 형식: **증상 → 원인 → 교훈**.
하네스는 실패에서 자란다 — 여기 쌓인 게 CLAUDE.md 규칙·훅의 출처다. (메타 원칙: `voltron-personal/bootstrap/`)

| 날짜 | 제목 | 핵심 |
|------|------|------|
| 2026-06-13 | [floating-ui dedupe 누락](2026-06-13-floating-ui-dedupe-gap.md) | 싱글톤 peer는 vite+storybook dedupe 양쪽 등록 |
| 2026-06-13 | [stories typecheck 제외](2026-06-13-stories-excluded-from-typecheck.md) | dts 제외 ≠ 타입체크 제외. stories도 타입체크 대상 |
| 2026-06-18 | [Modal transform-gpu 페인트 버그](2026-06-18-modal-transform-gpu-paint-bug.md) | 중앙정렬 translate 레이어 내부 스크롤은 transform-gpu 기본 |
| 2026-06-28 | [단일 번들이 전체 의존 끌어옴](2026-06-28-single-bundle-pulls-all-deps.md) | 라이브러리는 코드분할+서브패스 진입점. 훅만 써도 전체 평가되던 문제 |
| 2026-06-28 | [Tailwind v4 미정의 토큰 무시](2026-06-28-tailwind-v4-undefined-token-silent.md) | @theme 미등록 토큰은 죽은 클래스. 빌드 통과해도 색 안 먹음 |
