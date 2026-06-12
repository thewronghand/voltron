# floating-ui가 dedupe에서 빠져 인스턴스 갈라질 뻔

**날짜**: 2026-06-13
**증상**: 코드 리뷰 중, `@floating-ui/react`가 peer+external로 선언되고 Popover/Tooltip/Select/DatePicker가 전부 이걸 쓰는데, `vite.config.ts`와 `.storybook/main.ts` 양쪽 dedupe 배열에서 빠져 있었다.

**원인**: peer external 추가 시 dedupe 등록을 빼먹음. react-hot-toast/motion은 dedupe에 넣었지만 floating-ui는 누락. 빌드·typecheck는 통과하고, 단일 인스턴스 환경(우리 Storybook)에선 우연히 멀쩡해 보여서 안 드러남.

**왜 위험한가**: floating-ui는 context로 floating tree를 공유한다. 소비자 환경에서 패키지가 중복 설치/번들되면 인스턴스가 갈라져 — portal 위치 계산, useListNavigation, dismiss 우선순위가 서로 다른 트리를 봐 간헐적으로 깨진다. react-hot-toast 큐 분리, motion 컨텍스트 분리와 같은 부류.

**교훈**:
- 싱글톤성 peer(context/전역 큐/전역 상태를 가진 패키지)를 추가하면 **vite.config dedupe + storybook viteFinal dedupe 양쪽**에 동시 등록한다.
- 체크리스트화: peer 추가 시 ① peerDependencies ② peerDependenciesMeta(optional) ③ vite external ④ vite dedupe ⑤ storybook dedupe — **5곳**을 한 번에.
- "단일 인스턴스라 지금 멀쩡함"은 검증이 아니다. 정합성은 구조로 보장.

→ CLAUDE.md Critical Rule #4로 승격.
