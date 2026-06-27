# 단일 번들 + 단일 진입점이면 훅 하나만 써도 전체가 끌려온다

- **날짜**: 2026-06-28
- **출처**: escapist에서 `@thewrong/ui`의 `useIsMobile`만 import했는데 Render/CI 빌드 실패.

## 증상

소비자(escapist)가 motion을 설치하지 않은 채 `useIsMobile`(motion 무관 3줄 훅)만 import했더니
빌드 실패:

```
[MISSING_EXPORT] "AnimatePresence" is not exported by
  "__vite-optional-peer-dep:motion/react:@thewrong/ui".
```

로컬은 통과(이미 motion이 깔려 있어서), CI/Render에서만 실패.

## 함정 — 원인을 헷갈리기 쉽다

`__vite-optional-peer-dep:...` 메시지를 보면 "우리 라이브러리가 motion을 external 처리 안 했나?"로
의심하게 된다. **하지만 우리 빌드의 external은 정상이었다.** `vite.config.ts`에 `/^motion($|\/)/`가
등록돼 있고 `dist/index.es.js`는 `import { motion } from "motion/react"`로 깨끗이 external import한다.

`__vite-optional-peer-dep:...`는 **소비자의 Vite가 만든 가상 모듈**이다 — optional peer가 없으면
스텁을 만드는데, 그게 export를 못 찾아 실패한 것.

## 진짜 원인

`dist/index.es.js`가 **단일 번들(254KB) + package.json exports 진입점이 `.` 하나뿐**이었다.
그래서 `useIsMobile` 하나만 import해도 **번들 전체가 평가 대상**이 되어 motion을 요구했다.

## 해결

1. **서브패스 진입점 분리** — `package.json` exports에 `./hooks` 추가, 훅 전용 배럴을 별도 entry로 빌드.
2. **vite lib 빌드를 코드분할** — `output.preserveModules: true` + `preserveModulesRoot: "src"`로
   컴포넌트/훅이 개별 파일로 남게 한다. 그러면 소비자 번들러가 안 쓰는 모듈을 트리셰이킹한다.

검증: `dist/hooks/useMediaQuery.esm.js`(=useIsMobile)에 motion 참조 0, motion은
`useBottomSheetDrag.esm.js`에만 격리됨 → `@thewrong/ui/hooks`에서 useIsMobile만 가져가면 motion 안 끌려옴.

## 교훈

- **라이브러리 빌드는 단일 번들로 두지 말고 코드분할(preserveModules)한다.** 단일 번들이면
  optional peer를 아무리 잘 external해도 소비자가 일부만 써도 전체 의존을 요구한다.
- **`__vite-optional-peer-dep:...` 에러는 소비자 측 스텁**이다. 우리 산출물(`dist/`)을 직접 grep해
  깨진 import가 있는지부터 확인할 것 — 없으면 우리 external 문제가 아니라 번들 구조 문제다.
- **훅·유틸 같은 의존 0 모듈은 서브패스 진입점으로 분리**해 소비자가 헤비 UI 없이 쓰게 한다.
- 진입점·확장자가 바뀌면 SemVer breaking → 버전 bump. ([[modal 너비 고정]] 류의 정책과 별개로,
  빌드 산출물 구조 변경도 소비자 계약이다.)
