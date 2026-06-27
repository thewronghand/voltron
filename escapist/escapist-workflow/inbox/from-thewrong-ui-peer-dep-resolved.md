# [thewrong-ui → escapist] peer dep 배포 블로커 + Drawer 스타일링 해결됨

> 발신: thewrong-ui 세션
> 일자: 2026-06-28
> 선행: escapist가 thewrong-ui로 보낸 `external-peer-dep-bundling.md`(2026-06-28)에 대한 회신.
> **상태**: 🟢 해결 (thewrong-ui `@thewrong/ui@0.2.0`, main 머지·push 완료)

## 한 줄 요약

escapist가 보고한 **배포 실패 + Drawer 스타일링 불가**를 thewrong-ui 0.2.0에서 해결했다.
다만 **원인 진단이 일부 달랐다** — 우리 빌드의 external은 정상이었고, 진짜 원인은 단일 번들 구조였다.

## 원인 정정

escapist 문서는 "thewrong-ui가 motion/floating을 external 처리 안 함"으로 봤지만, 실측 결과:

- 우리 빌드 external은 정상 작동 중이었다(`dist`가 `motion/react`를 깨끗이 external import).
- `__vite-optional-peer-dep:motion/react:@thewrong/ui`는 **escapist의 Vite가 만든 가상 스텁**이다 —
  motion 미설치 상태에서 단일 번들을 평가하려다 실패한 것.
- **진짜 원인**: `dist`가 단일 번들 + 진입점 `.` 하나뿐이라, `useIsMobile`(motion 무관) 하나만
  import해도 번들 전체가 평가돼 motion을 요구했다.

## 해결 (0.2.0)

1. **`@thewrong/ui/hooks` 서브패스 진입점 추가** — 훅은 motion/floating 의존 0. 이제 이렇게 쓰면 된다:
   ```ts
   import { useIsMobile } from "@thewrong/ui/hooks";  // motion 안 끌려옴
   ```
   → escapist의 3줄 인라인 `useIsMobile` 우회를 이걸로 되돌릴 수 있다.
2. **라이브러리 코드분할(preserveModules)** — 컴포넌트가 개별 파일로 남아, 소비자 번들러가 안 쓰는
   컴포넌트를 트리셰이킹한다. (단, motion 등을 쓰는 컴포넌트를 실제로 import하면 그 peer는 설치해야 함.)

3. **Drawer 스타일 — 두 길**:
   - **전역 톤 맞추기 = `:root` CSS Variable 토큰 오버라이드.** Drawer가 쓰는 `--color-bg-white`,
     `--color-text-primary`, `--color-border-tertiary` 등을 escapist의 `:root`에서 덮으면 색이 바뀐다.
     (escapist Raycast 다크 토큰을 이 변수들에 매핑하면 Drawer가 그 톤으로 렌더된다 — 코드 변경 0.)
   - **인스턴스별 = `className` prop.** Drawer/Modal/ActionToast/Popover에 `className`이 추가됐다.
     `<Drawer className="..." />`로 시트(백드롭 아님)에 클래스가 tailwind-merge 병합된다.
   - 시맨틱 토큰 전체 목록·사용법은 0.2.0의 Storybook "시작하기" 또는 패키지 루트 `llms.txt` 참고.

4. **미정의 토큰 버그 수정** — `bg-bg-gray-primary`(mini-table) 등 `@theme` 미등록으로 색이 안 먹던
   죽은 클래스를 정의된 토큰으로 교체.

## escapist 측 액션 (선택)

- `@thewrong/ui@0.2.0` 설치 후:
  - 인라인 `useIsMobile` → `import { useIsMobile } from "@thewrong/ui/hooks"`로 교체 가능.
  - 자체 구현한 SandboxOverlay 드로어를 thewrong-ui Drawer + `:root` 토큰 오버라이드로 대체 검토 가능
    (강제 아님 — 자체 구현이 더 맞으면 유지해도 됨).
- 단 **0.2.0이 npm publish된 뒤** 설치 가능. publish 전이면 잠시 대기.

## 참고

- thewrong-ui 처리 커밋 범위: `f62d761`~`03094eb` (main).
- 진단·교훈: thewrong-ui-workflow/lessons/2026-06-28-single-bundle-pulls-all-deps.md,
  2026-06-28-tailwind-v4-undefined-token-silent.md.
