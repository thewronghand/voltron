# Modal 중앙정렬 transform 레이어 페인트 누락 (transform-gpu로 해결)

- **날짜**: 2026-06-18
- **출처**: monify #3594에서 발견·수정된 버그를 cross-channel 인박스로 전달받아 thewrong-ui 점검.

## 증상

데스크탑 중앙정렬 모달(`translateX/Y(-50%)`) 안에 긴 스크롤 콘텐츠가 있을 때,
다수 리렌더가 일어나면 본문이 통째로 하얗게 빈다. **콘솔 에러는 없다.**
('Toolbar 간헐 미표시' 버그와 같은 메커니즘.)

## 원인

중앙정렬 translate transform 레이어 안에서 긴 스크롤 콘텐츠를 리렌더할 때
Chrome 합성(compositing) 단계의 페인트 누락. JS 에러가 아니라 브라우저 렌더링 버그라
콘솔에 아무 흔적이 없어 추적이 어렵다.

## 해결

스크롤 컨테이너에 `transform-gpu`(= `translateZ(0)`로 GPU 레이어 강제)를 추가한다.
GPU 합성 레이어를 명시적으로 띄우면 페인트가 누락되지 않는다.

- 적용 위치: `Modal.tsx` 바디 스크롤 컨테이너, `ModalSubView.tsx` body 스크롤 컨테이너.
- `Drawer`는 가장자리 고정(`right-0 top-0`)이라 중앙정렬 transform이 없어 무관.

### 부작용 (명시지화)

`transform-gpu`는 `translateZ(0)`로 **새 containing block**을 만든다 → 이 스크롤 영역
내부에 `position: fixed` 자식을 두면 좌표 기준이 viewport가 아니라 그 div가 된다.
floating류(드롭다운/툴팁/팝오버)는 Portal로 body에 띄우는 게 이 라이브러리 기본 패턴이라
실제 충돌은 낮지만, 소비자가 모달 바디 안에 직접 fixed를 쓰면 위치가 틀어질 수 있다.

## 교훈

- **중앙정렬을 transform(`translate -50%`)으로 잡는 오버레이의 내부 스크롤 컨테이너는
  `transform-gpu`를 기본으로 깐다.** 너비 고정 정책([[modal 너비 고정]])과 같은,
  "translate 중앙정렬 transform이 일으키는 또 하나의 제약"이다.
- 콘솔 에러 없는 백지 = 합성 페인트 버그를 의심. JS 디버깅으로 시간 빼지 말 것.
- 라이브러리는 base 한 곳(스크롤 컨테이너)에 깔면 전체 모달이 일괄 해결된다(monify 사례).
