# circuit

UI 플레이그라운드. **글이 아니라 UI 자체가 콘텐츠인 사이트** — 일기·글귀 같은 텍스트를 인터랙티브한 화면으로 풀어내서 포스팅 단위로 게시한다.

> circuit = 회로이자 **순회로**. 실험 씬을 한 바퀴 도는 갤러리. 표기는 `circUIt`(UI만 대문자).

## Critical Rules (절대 규칙)

1. **`any` 금지** — `unknown` 또는 구체 타입.
2. **폴더 밖 import는 절대경로 `@/`** — 같은 폴더 형제(`./types`)만 상대경로 허용. `../` 상위 참조 금지.
3. **포스트 Scene은 반드시 `lazy()`** — `src/posts/registry.ts`에서 `lazy(() => import(...))`. 직접 import하면 무거운 씬(3D·셰이더) 번들이 인덱스 진입 시점에 전부 로드된다. 빌드는 통과하므로 눈치채기 어렵다.
4. **씬은 자기 폴더 안에서 완결** — `src/posts/<slug>/` 밖으로 새지 않는다. 포스트 간 공유가 **세 번째로** 필요해질 때만 `src/shared/`로 올린다 (Rule of Three).
5. **React를 쓰는 서드파티 UI 라이브러리를 추가하면 `vite.config.ts`의 `resolve.dedupe`를 함께 갱신한다** — 안 하면 React 인스턴스가 갈라져 "Invalid hook call"로 죽는다. `node_modules`에 react가 하나뿐이어도 발생한다(pre-bundle 산출물이 갈라짐). 적용 후 `rm -rf node_modules/.vite` + 서버 재시작 필수. → `circuit-workflow/lessons/2026-09-14-paper-shaders-react-dedupe.md`

## 정체성

- **성격**: SPA. 서버 로직·DB·인증 없음. 포스트 = 코드에 박힌 컴포넌트.
- **SSR 안 씀** — 셰이더·WebGL·R3F는 대부분 client-only라 SSR 층이 비용만 된다. SEO는 포트폴리오 사이트가 링크로 커버.
- **thewrong-ui 안 씀** — 각 포스트가 일회성 실험이라 공용 컴포넌트로 수렴하지 않는다. 필요해지면 그때.
- **git**: 개인 계정 `thewronghand` (local config), remote는 `github-personal` SSH host alias.

## 기술 스택

- **Vite 8 + React 19 + TypeScript** (strict)
- **React Router 8** — `createBrowserRouter`, 포스트별 lazy 청크
- **Tailwind CSS v4** — `@tailwindcss/vite`, `@theme`로 토큰 (`src/styles/global.css`)
- **Motion 13** (`motion/react`) — 모션데브
- **Paper Shaders** (`@paper-design/shaders-react`) — WebGL 배경. recap에서 `MeshGradient` 사용
- 이후 실험에 따라 추가: R3F/three, liquid-gl 등. **포스트 전용 의존은 그 포스트에서만 import** (lazy 청크로 격리됨)

## 구조

```
src/
  app/router.tsx        # 라우트 정의
  pages/                # IndexPage(갤러리) · PostPage(씬 호스트)
  posts/
    types.ts            # Post 인터페이스
    registry.ts         # 포스트 목록 — 여기에 추가하면 갤러리에 노출
    <slug>/             # 포스트 하나 = 독립 씬. 데이터·훅·컴포넌트 전부 이 안에
  shared/{ui,lib}/      # 3회 이상 반복될 때만
  styles/global.css     # @theme 토큰
```

## 새 포스트 추가 절차

1. `src/posts/<slug>/` 폴더 생성, `<Name>Scene.tsx`를 default export
2. `src/posts/registry.ts`에 항목 추가 — **`Scene`은 `lazy()`로**
3. `npm run build`로 청크가 분리됐는지 확인 (`dist/assets/<Name>Scene-*.js`)

## 작업 하네스

- **세션 연결**: 작업 내용이 확정되면 `/voltron-bus-spoke`로 personal 버스 연결을 **제안한다** (연결명 `circuit-작업명`, 티켓 없음).
- **큰 작업**: `/ralph` — 태스크 분해(사용자 승인) → 메인 구현 → `reviewer` 독립 리뷰 루프.
- **구현 후 리뷰**: 5개 파일 이상/탐색 필요한 변경은 `reviewer` 에이전트로 diff 기반 리뷰.
- **훅**: 편집 시 prettier + 보호 브랜치 가드 (`circuit-workflow/hooks/`).
- **지식 축적**: lessons(실패) · why-tho(설계 결정) · cookbook(재사용 패턴) → `circuit-workflow/`
