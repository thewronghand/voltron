# Tailwind v4는 정의 안 된 토큰을 조용히 무시한다 — 죽은 클래스

- **날짜**: 2026-06-28
- **출처**: escapist 사용성 작업 중 발견. `bg-bg-gray-primary`·`text-text-link`가 `@theme`에 없는데도 코드에 박혀 있었다.

## 증상

`mini-table.tsx`가 `bg-bg-gray-primary`, `Collapsible.stories.tsx`가 `text-text-link`를 쓰고 있었다.
하지만 `src/styles/theme.css`의 `@theme` 블록에 `--color-bg-gray-primary`·`--color-text-link`는 정의되지 않았다.

**빌드는 통과했고 콘솔 에러도 없다.** 그런데 그 클래스는 CSS를 전혀 생성하지 못해 색이 안 먹는
**죽은 클래스**였다.

## 원인

Tailwind v4는 `@theme`에 등록되지 않은 토큰 이름으로 유틸리티 클래스를 만들지 않는다(조용히 무시).
v3의 임의 클래스 감지와 달리, v4의 시맨틱 토큰은 `@theme` 등록이 전제다. 등록 안 된 이름은
빌드 단계에서 그냥 빠지므로 에러 없이 스타일만 누락된다.

## 해결

정의된 토큰으로 교체:
- `bg-bg-gray-primary` → `bg-bg-base-secondary` (라이트=secondary-100/다크=secondary-900 둘 다 정의됨,
  덤으로 `dark:bg-slate-900/50` 하드코딩도 제거돼 시맨틱 토큰으로 일원화).
- `text-text-link` → `text-primary-600` (전용 링크 토큰 없음 — Rule of Three 전까진 primary 직접 참조).

검증: 빌드 CSS(`dist/ui.css`)에 `.bg-bg-base-secondary{...}` 규칙이 실제로 생성되는지 grep.

## 교훈

- **"클래스가 코드에 있음 ≠ 스타일이 적용됨."** [[modal transform-gpu paint bug]]의 "클래스 붙음 ≠
  적용됨"과 같은 계열 — Tailwind 유틸은 빌드 CSS 컴파일 결과까지 봐야 실제 적용을 보장한다.
- **시맨틱 토큰은 반드시 `@theme`에 정의된 것만 쓴다.** 새 토큰 이름을 쓸 거면 theme.css에 먼저 등록.
- 미정의 토큰 전수검사: 사용된 `(bg-bg|text-text|border-border)-*` 클래스를 추출해 theme.css의
  `--color-*` 정의와 대조하면 죽은 클래스를 한 번에 찾을 수 있다.
- 빌드 통과는 이 버그를 못 잡는다 — 소비자가 색이 안 나온다고 할 때까지 묻힌다.
