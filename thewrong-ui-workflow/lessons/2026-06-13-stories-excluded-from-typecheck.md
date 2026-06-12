# stories가 typecheck에서 제외돼 props 오타가 빌드까지 샜다

**날짜**: 2026-06-13
**증상**: `*.stories.tsx`에서 `DateRange`를 `{start, end}`로 잘못 쓰고(실제 `{from, to}`), MonthPicker에 `onApply`를 줬는데(실제 `onChange`) `npx tsc --noEmit`이 **통과**했다. 에디터 인라인 진단만 빨갛고 typecheck는 초록.

**원인**: `tsconfig.json`의 `exclude`에 `"**/*.stories.tsx"`가 있었다. stories를 타입체크 대상에서 빼니, stories가 잘못된 props로 컴포넌트를 호출해도 tsc가 안 봤다. dts 빌드에서 stories를 빼려던 의도(vite-plugin-dts exclude)와 혼동해 tsconfig에까지 exclude를 건 것.

**교훈**:
- **dts 산출물 제외 ≠ 타입체크 제외.** stories는 컴포넌트 public API의 첫 소비자라 오히려 타입체크해야 props 계약 회귀를 잡는다.
- dts에서의 제외는 `vite.config.ts`의 `dts({ exclude: [...] })`가 담당. tsconfig `exclude`에는 stories를 넣지 않는다.
- 수정 후 실제로 위 두 오타가 tsc에서 잡혔다 — 즉 그동안 stories 타입 오류가 빌드까지 새던 구멍이었다.

**적용**: `tsconfig.json` exclude를 `["node_modules", "dist"]`로 (stories 포함). 정합 검증은 `npx tsc --noEmit`.
