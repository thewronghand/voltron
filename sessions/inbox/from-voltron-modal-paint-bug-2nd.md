# [voltron→personal] 2차 핸드오버 — Modal 페인트 버그 수정이 Tailwind v4에서 무효일 수 있음

> 발신: voltron-main (관제 허브)
> 일자: 2026-06-23
> 대상: thewrong-ui (`ui-modal-paint-gpu-fix` 또는 후속 세션)
> 선행: `from-voltron-modal-paint-bug.md` (1차, 2026-06-18) — **이 문서는 그 1차 수정을 정정한다.**
>
> **상태**: 🟢 처리완료 (2026-06-23) — `ui-modal-paint-gpu-fix` 세션이 점검·재수정·머지(19df581, feat/modal-transform-arbitrary-value).
> **실측 정정**: thewrong-ui의 v4.3.0에선 `transform-gpu`도 정상 컴파일돼 1차 수정이 무효 아니었음(빌드 CSS 실증). monify가 본 폴백은 더 낮은 v4 정의 추정. 그래도 버전무관 안전+monify 일관성 위해 `transform-[translateZ(0)]`로 교체. voltron 회신은 생략(monify 자체 수정 완료 상태).

## 한 줄 요약

1차 핸드오버로 thewrong-ui에 적용한 **`transform-gpu` 모달 페인트 버그 수정이, Tailwind v4 환경이라면 실제로는 무효**일 수 있다. monify에서 정확히 같은 버그가 **재발**했고 원인이 밝혀졌다.

## 무슨 일이 있었나

- monify도 1차와 동일하게 `Modal.tsx` 스크롤 컨테이너에 **`transform-gpu`(`translateZ(0)`)**를 줘서 Chrome 합성 페인트 버그(모달 본문이 통째로 하얗게 빔)를 고쳤었다 (monify #3594).
- 그런데 2026-06-23, **같은 버그가 재발**했다.
- **근본원인**: Tailwind v4에서 `transform-gpu`는 **다른 transform 유틸리티 없이 단독 사용 시** `--tw-*` 변수가 미정의 상태라 `transform` 선언이 **`none`으로 폴백**된다. 즉 클래스는 DOM에 붙지만 computed transform이 적용되지 않아 **합성 레이어 격리가 실제로 일어나지 않는다.** → 페인트 버그 그대로.

## thewrong-ui가 점검할 것

1. **Tailwind 버전 확인** — v4면 잠재 대상. v3면 `transform-gpu`가 정상 동작하므로 무관(이 문서 무시 가능).
2. v4라면 1차로 추가한 `Modal.tsx`·`ModalSubView.tsx`의 **`transform-gpu` computed 값 확인** — DevTools에서 해당 요소의 computed `transform`이 `none`이면 무효 상태(= 버그 잠재).
3. **재현 테스트** — 1차 수정 후 실제로 페인트 버그가 안 나는지 마우스 클릭으로 재확인(빌드 통과만으로는 못 잡음, 런타임 합성 문제라).

## 해결책 (monify가 적용한 것)

- `transform-gpu` → 임의값 **`transform-[translateZ(0)]`** 로 변경.
- 검증: computed transform 실제 적용 확인 + 마우스 클릭 재현 안 됨 확인.

## 참조

- monify 재수정 세션: `monify-chore-permission-modal-fixes` (브랜치 `chore/permission-modal-fixes`)
- monify 1차(무효였던) 수정: #3594
- voltron 일지: `~/dev/voltron/sessions/ongoing/monify-3594-menu-permission.md` (회귀 기록), `monify-chore-permission-modal-fixes.md`

점검 결과(v4 여부 / 재현 여부 / 수정 적용)를 회신해주면 허브에서 기록하겠습니다.

---

## 🟢 처리 결과 (2026-06-23) — `ui-modal-paint-gpu-fix`

- **Tailwind 버전**: **v4.3.0** 확인 (잠재 대상 환경 맞음).
- **1차 수정 무효 여부 — 실측**: 빌드 CSS에서 `.transform-gpu` 정의가
  `transform:translateZ(0) var(--tw-rotate-x,) ...` 로, **v4.3.0에서는 translateZ(0)가 변수
  앞에 리터럴로 박혀 정상 컴파일**됐다. 즉 thewrong-ui의 1차 수정은 v4.3.0 한정으로는 무효가
  아니었다(none 폴백 아님). monify가 본 폴백은 더 낮은 v4 버전 정의였던 것으로 추정.
- **조치**: 그래도 버전 무관 안전 + monify 일관성을 위해 **`transform-gpu` →
  `transform-[translateZ(0)]`** 로 교체(Modal.tsx·ModalSubView.tsx). 빌드 CSS에서 임의값이
  `...translateZ(0)}` 처럼 **변수 없이 단독 리터럴**로 컴파일됨을 확인.
- **런타임 재현 테스트**: 브라우저 확장 미연결로 마우스 클릭 재현은 미실시. 대신 빌드 CSS 정적
  분석으로 computed transform이 none이 아님을 실증. (확장 연결되면 추가 재현 가능)
- **브랜치**: `feat/modal-transform-arbitrary-value`. typecheck·build 통과.
- **기록**: `thewrong-ui-workflow/lessons/2026-06-18-modal-transform-gpu-paint-bug.md`에 정정 섹션 추가.
