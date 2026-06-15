# 개발서버는 멀쩡한데 DMG에서만 깨진다

## 증상
Electron DMG 설치본에서 voice-memo 페이지 접근 시 간헐적 "this page couldn't load". `npm run dev`에서는 정상. 콘솔엔 폰트 404(`/_next/static/media/...woff2`)와 난독화된 `Cannot read properties of undefined (reading 'variant')`.

## 원인 (실제로 밝혀진 것 / 추정)
- 직접 원인은 불명확하게 끝났지만, 조사 과정에서 **dev와 packaged의 동작 차이**가 핵심임이 드러남:
  - 폰트 404: `next/font/google` 폰트가 `.next/static/media`에 생기는데 standalone 복사 경로 의존. dev는 즉석 서빙이라 안 터짐.
  - `variant` 에러: `STATUS_MAP[memo.status]`가 `undefined`일 때 `.variant` 접근. 데이터 로딩 타이밍 이슈로 추정.
- 시도했다 롤백한 것: `fork()`에 `cwd` 추가(실패), Geist_Mono 폰트 교체(원인 아님).
- 실제 적용한 방어: `STATUS_MAP[x] ?? { label: x, variant: "secondary" }` fallback, 의심 기능(커스텀 폰트) 제거.

## 교훈
1. **"dev에서 됐다"는 검증이 아니다.** Electron은 packaged 경로에서만 깨지는 버그가 흔하다. 빌드/경로/asset 변경은 반드시 `electron:build`로 확인.
2. **status/enum 매핑은 항상 fallback.** `MAP[key]`가 undefined일 가능성을 가드.
3. **난독화 스택은 소스맵으로.** 프로덕션 빌드 에러는 위치를 알 수 없으니 소스맵 활성화 후 재현.
4. 디버깅 중 **여러 가설을 동시에 건드리지 말 것.** 폰트·cwd·variant를 한꺼번에 만져서 원인 분리가 어려웠다.

관련: [[desktop-build-checklist]] (cookbook)
