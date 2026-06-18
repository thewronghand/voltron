# [cross-channel inbox] 공용 Modal 페인트 버그 점검 요청

- **출처**: voltron 채널 허브(`voltron-main`) → personal 허브(`personal-main`)
- **원 발견 세션**: monify #3594 (`monify-3594-menu-permission`)
- **전달 경로**: 버스 cross-channel 직접 전송 불가(채널 경계 + personal-main 미수신) → 파일 전달
- **수신일**: 2026-06-18
- **상태**: 🟢 처리완료 (2026-06-18) — `ui-modal-paint-gpu-fix` 세션이 점검·수정.

## 처리 결과 (2026-06-18)

- **점검**: thewrong-ui Modal이 monify와 동일한 중앙정렬 translate(`-50%`) transform 레이어 + 내부 스크롤 구조 확인. ModalSubView도 부모 transform 레이어 안에서 스크롤 → 동일 노출. Drawer는 가장자리 고정이라 무관.
- **수정**: `Modal.tsx`·`ModalSubView.tsx` 바디 스크롤 컨테이너에 `transform-gpu` 추가 (브랜치 `feat/modal-transform-gpu-paint-fix`, 커밋 44ce2b1). 부작용(transform이 새 containing block 생성 → 내부 fixed 좌표계 변경)은 주석·lessons에 명시.
- **기록**: `thewrong-ui-workflow/lessons/2026-06-18-modal-transform-gpu-paint-bug.md`.
- **검증**: typecheck·build 통과, reviewer 에이전트 PASS (CRITICAL/HIGH 0).

## 점검 대상

`thewrong-ui` (또는 personal 채널의 모든 프로젝트) 중 **transform 중앙정렬 모달** 구조를 쓰는 곳.

## 버그 내용 (monify에서 확인·수정된 것)

- **증상**: 시트 중앙정렬 `translate` transform 레이어 안에 긴 스크롤 콘텐츠가 있을 때, 다수 리렌더 시 본문이 통째로 하얗게 빔. **콘솔 에러 없음** (Chrome 합성 페인트 버그).
- **원인**: 중앙정렬 translate transform 레이어에서 긴 스크롤 콘텐츠 리렌더 시 페인트 누락.
- **수정**: 스크롤 컨테이너에 `transform-gpu`(translateZ로 GPU 레이어 강제) 추가. monify는 base Modal 한 곳에 적용 → 전체 모달 일괄 해결.
- **동일 계열**: 'Toolbar 간헐 미표시' 버그와 같은 메커니즘.

## 권장 조치

`thewrong-ui`가 동일 transform 중앙정렬 모달 구조면 같은 버그 가능성 높음 → 동일하게 스크롤 컨테이너에 `transform-gpu` 적용 점검 권장.
