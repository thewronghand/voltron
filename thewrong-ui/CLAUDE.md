# thewrong-ui (@thewrong/ui)

개인 React UI 컴포넌트 라이브러리. 사이드프로젝트에서 `npm install @thewrong/ui` 후 슥슥 꺼내쓰는 게 목적.

## Critical Rules (절대 규칙)

> 위반 시 빌드는 통과해도 publish 후 소비자가 깨진다. 이 섹션은 상단·하단 양쪽에 요약된다.

1. **`any` 금지** — `unknown` 또는 구체 타입. (table/select의 forwardRef 제네릭 우회용 `<T = any>`만 알려진 예외)
2. **폴더 밖 import는 절대경로 `@/`** — 같은 폴더 형제(`./types`)만 상대경로 허용. `../` 상위 참조 금지.
3. **번들 의존성 정책** — 무거운 의존(motion·@floating-ui·react-hot-toast·@dnd-kit·@tanstack/react-virtual·date-fns)은 **optional peer + vite external**. 가벼운 필수(lucide-react·clsx·tailwind-merge)만 **dependency(번들 포함)**. 셋(peer 선언 / external 배열 / dependency)이 항상 정합해야 함.
4. **dedupe 동기화** — 싱글톤성 peer를 추가하면 `vite.config.ts` dedupe + `.storybook/main.ts` viteFinal dedupe **양쪽 모두**에 등록. 한쪽만 하면 인스턴스가 갈라져 런타임 버그(toast 큐/floating 컨텍스트 분리). → `thewrong-ui-workflow/lessons/2026-06-13-floating-ui-dedupe-gap.md`
5. **빌드 성공 ≠ 노출** — 새 컴포넌트는 `src/index.ts`의 `export * from`까지 확인. 누락해도 빌드는 통과한다.

## 작업 하네스

- **큰 작업**: `/ralph` — 태스크 분해(사용자 승인) → 메인 구현 → `reviewer` 독립 리뷰 루프. executor 없음.
- **구현 후 리뷰**: 5개 파일 이상/탐색 필요한 변경은 `reviewer` 에이전트로 diff 기반 리뷰(구현 의도 미전달 — 자가평가 편향 방지). 1-2줄 수정은 생략.
- **훅**: 편집 시 prettier + 컨벤션 체크(any/상대경로) + typecheck 자동 실행 (`thewrong-ui-workflow/hooks/`).
- **지식 축적**:
  - 같은 실수 반복 → `thewrong-ui-workflow/lessons/`에 "증상 → 원인 → 교훈"
  - 복잡한 설계 결정 → `thewrong-ui-workflow/why-tho/`에 상황·판단·근거
  - 반복되는 컴포넌트 패턴·체크리스트 → `thewrong-ui-workflow/cookbook/`
  - 하네스는 실패에서 자란다 — 가상의 미래가 아니라 실제 발생한 것에만 규칙·훅 추가. (메타 원칙: `voltron-personal/bootstrap/`)

## 정체성

- **소비자**: 의현 개인 사이드프로젝트들 (synapse, escapist, tarot 등)
- **배포**: npm publish (`@thewrong/ui`)
- **git**: 개인 계정 `thewronghand` / `penfreak77@gmail.com` (local config로 설정됨, remote는 `github-personal` SSH host alias 사용)

## 기술 스택

- **Vite (lib mode)** — ES + CJS 듀얼 번들, `vite-plugin-dts`로 `.d.ts` 생성
- **React 19** — peerDependency (`>=18`), 번들에서 external
- **Tailwind CSS v4** — `@tailwindcss/vite`, `@theme`로 토큰 등록
- **Storybook 10** — 컴포넌트 개발/문서/시각 테스트 (`npm run dev` → :6006)
- **Vitest (browser mode, playwright)** — Storybook 스토리 기반 테스트

## 스타일링 & 테마

- **CSS 자체포함**: 빌드 시 모든 스타일을 단일 CSS로 번들 (`cssCodeSplit: false`).
  소비자는 `import "@thewrong/ui/styles.css"` 한 줄이면 됨 — Tailwind 설치 불필요.
- **테마 시스템**: `src/styles/theme.css`의 `@theme` 블록에 oklch 기반 색상 토큰 정의.
  - 토큰 계열: `primary-*`, `secondary-*`(neutral), `error-*` (각 50~950)
  - 소비자가 `:root`에서 CSS Variable(`--color-primary-500` 등)을 오버라이드하면 전체 테마 변경 가능

## 컴포넌트 구조 (컨벤션)

각 컴포넌트는 `src/components/<name>/` 폴더에 다음 패턴으로 작성:

```
components/<name>/
  types.ts          # Props 타입 (discriminated union 등)
  utils.ts          # Tailwind 클래스 매핑 함수 (variant/size/appearance)
  <Name>.tsx        # 컴포넌트 본체 (forwardRef 권장)
  <Name>.stories.tsx
  index.ts          # public export
```

- `src/index.ts`에서 `export * from "./components/<name>"`로 노출
- **기존 Button** 컴포넌트가 레퍼런스 구현 (variant×appearance×size 매핑, forwardRef, button/anchor 분기)

## 컴포넌트 이관 원칙

- 검증된 기존 구현을 **거의 그대로 복사**하는 방향 (재작성 X, 빠른 이전 우선)
- 내부 의존(`overlay-stack`, `portal`, click-outside 훅 등)은 라이브러리 내부로 함께 가져옴
- 의존성 낮은 것부터 이관 (Tier 0 → Tier 3).

## 정책의 명시화 (암묵지 → 명시지)

**기술적 한계나 의도적 디자인 결정으로 "정책으로 우회한" 제약**들이 있다
(예: 모달 너비는 고정 — 동적 너비가 중앙정렬 transform과 충돌 / 서브뷰 콘텐츠 높이 ≤ 부모 높이).
1인 개발 때는 머릿속 암묵지였지만, 라이브러리는 남(미래의 나 포함)이 쓰므로 **명시지로 만든다.**

- 강도: **문서화 중심** (타입 강제·런타임 차단보다 유연성 우선). 위반 여지는 남기되 납득시킨다.
- 형식: **제약 + 이유 + 대안**을 담백하게. "실패/한계" 같은 변명조 단어 없이 중립적 설계 제약으로.
  - 예: "너비는 고정한다 — 동적 너비는 중앙정렬 transform과 충돌해 모션이 부자연스럽다. 폭이
    변하면 `widthPx`로 고정할 것."
- 위치: 컴포넌트/prop **JSDoc** + Storybook **story description**(권장/안티패턴을 나란히).

## 코딩 스타일 (전역 규칙 상속)

- import 경로: 절대경로 `@/` (상대경로 금지)
- `any` 금지 — `unknown` 또는 구체 타입
- 주석/커밋 한국어, 커밋은 제목 한 줄만
- Prettier

## 명령어

```bash
npm run dev          # Storybook 개발 서버 (:6006)
npm run build        # 라이브러리 빌드 (dist/)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint src/
```

## Git 전략

`voltron-personal/guides/git-workflow.md` 참조 — `main` + `develop` + `feat/*` 3종. 보호 브랜치(`main`/`develop`) 직접 작업 금지.
remote는 `github-personal` SSH host alias 사용 (`thewronghand` / `penfreak77@gmail.com`).

## 주의

- `.envrc` (GH_TOKEN 등)는 절대 커밋 금지 — `.gitignore`에 포함됨
- publish 전 `package.json`의 `repository.url`을 `thewronghand` 계정으로 맞출 것
  (현재 `github.com/euihyeon`로 되어있음)
- `exports["./styles.css"]` 경로(`dist/style.css`)가 vite 산출물명과 일치하는지 빌드 후 확인
