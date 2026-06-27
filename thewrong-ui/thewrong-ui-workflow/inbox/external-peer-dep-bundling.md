# 외부 프로젝트에서 @thewrong/ui 사용 불가 — peer dependency 번들링 문제

**발견**: 2026-06-28, escapist 모바일 대응 작업 중  
**상태**: 미해결 (자체 구현으로 우회)

---

## 증상

escapist에서 `@thewrong/ui`의 `useIsMobile`을 import했더니 Render 빌드 실패.

```
[MISSING_EXPORT] "AnimatePresence" is not exported by "__vite-optional-peer-dep:motion/react:@thewrong/ui".
[MISSING_EXPORT] "motion" is not exported by "__vite-optional-peer-dep:motion/react:@thewrong/ui".
[MISSING_EXPORT] "FloatingFocusManager" is not exported by "__vite-optional-peer-dep:@floating-ui/react:@thewrong/ui".
```

로컬에서는 통과 (이미 설치된 패키지가 resolve됨), CI/Render에서는 실패.

## 원인

`@thewrong/ui`가 `motion/react`, `@floating-ui/react`를 **peerDependency**로 선언했는데, 빌드 결과물(`dist/index.es.js`)에서 이 패키지들을 **external 처리하지 않고 직접 import**하고 있음.

외부 소비자(escapist) 입장에서는 해당 peer dep을 직접 설치하지 않으면 Vite 번들링 시 누락 에러 발생.

## Drawer 스타일 하드코딩 문제

Drawer 컴포넌트가 내부 토큰을 하드코딩:

```tsx
className="... bg-bg-white dark:bg-neutral-800 border-border-tertiary ..."
```

thewrong-ui 전용 CSS 변수 / Tailwind 클래스를 사용해 외부 프로젝트(다른 디자인 토큰 시스템)에서는 스타일이 완전히 깨짐. 색상 주입 props도 없음.

escapist는 Raycast 기반 다크 토큰(`bg-surface`, `border-hairline` 등)을 쓰기 때문에 Drawer를 그대로 쓸 수 없었음.

## 결론

두 문제가 겹쳐 **Drawer(및 peer dep을 쓰는 컴포넌트)는 외부 프로젝트에서 사실상 사용 불가**.

escapist에서는 Drawer 구조만 참고해 `SandboxOverlay` 내부에 자체 구현함:
- `useIsMobile` — 3줄 인라인 훅으로 대체
- 드로어/바텀시트 UI — escapist 토큰으로 직접 작성

## 해결 방향 (TODO)

1. **peer dep external 처리**: vite 라이브러리 빌드 설정에서 `motion/react`, `@floating-ui/react`를 `external`에 추가
2. **스타일 토큰 탈피**: Drawer 등 레이아웃 컴포넌트는 CSS 변수 props를 받아 외부에서 주입 가능하게
3. 또는 **유틸 훅(`useIsMobile` 등)을 별도 진입점으로 분리** — 헤비한 UI 컴포넌트 없이 훅만 쓸 수 있도록
