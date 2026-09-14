# Paper Shaders 도입 시 "Invalid hook call" — React 인스턴스 분열

## 증상

`@paper-design/shaders-react`의 `MeshGradient`를 붙이자 캔버스는 생기는데 아무것도 안 그려짐.
콘솔:

```
Invalid hook call. Hooks can only be called inside of the body of a function component.
  ... You might have more than one copy of React in the same app
The above error occurred in the <ShaderMount> component.
TypeError: Cannot read properties of null (reading 'useState')
```

## 원인

Vite가 의존성을 pre-bundle 하는 과정에서 React 인스턴스가 갈라졌다.
`node_modules`에는 react가 **하나뿐인데도** 발생한다 — 디스크상의 중복이 아니라
pre-bundle 산출물(`node_modules/.vite/deps/`)이 갈라진 경우라서,
`find node_modules -name react`로 확인하면 "중복 없음"이 나와 헛다리를 짚기 쉽다.

판별법: 브라우저에서 로드된 모듈의 버전 해시를 비교한다.

```js
performance.getEntriesByType('resource').map(r => r.name).filter(n => /react|shaders/.test(n))
```

`?v=` 해시가 서로 다르면 인스턴스가 갈라진 것.

## 해결

`vite.config.ts`에 dedupe + pre-bundle 대상 명시:

```ts
resolve: {
  dedupe: ["react", "react-dom"],
},
optimizeDeps: {
  include: ["react", "react-dom", "@paper-design/shaders-react"],
},
```

적용 후 **`rm -rf node_modules/.vite` + dev 서버 재시작**이 필요하다.
설정만 바꾸고 HMR에 맡기면 옛 캐시를 계속 써서 같은 에러가 남는다.

## 교훈

- **React를 쓰는 서드파티 UI 라이브러리를 새로 넣을 때는 dedupe를 선제적으로 건다.**
  thewrong-ui에서도 같은 계열의 사고(peer dedupe 누락 → 인스턴스 분리)가 있었다.
- **"캔버스는 있는데 안 그려진다"를 그래픽 문제로 먼저 의심하지 말 것.**
  셰이더 파라미터(distortion/swirl)를 만지며 시간을 썼지만 실제 원인은 React 쪽이었다.
  콘솔 에러를 먼저 끝까지 읽었으면 바로 잡혔다.
- **초기화 직후 스크린샷은 증거로 쓰지 말 것.**
  셰이더 첫 프레임 전에 찍힌 화면을 "색이 잘못 나온다"고 오판했다.
  WebGL 요소는 몇 초 기다린 뒤 확인한다.
- `readPixels`가 `[0,0,0,0]`인 것은 `preserveDrawingBuffer: false`면 정상이라
  렌더링 실패의 근거가 되지 못한다. 캔버스를 2D로 `drawImage` 해서 샘플링할 것.

---

## 후속: `speed={0}`은 "정지"가 아니라 "렌더 중단"이다

`ShaderBackground`에서 비활성 카드의 셰이더를 멈추려고 `speed={active ? speed : 0}`을 줬는데,
이건 의도와 다르게 동작한다. `@paper-design/shaders`의 vanilla mount:

```js
setCurrentSpeed = (newSpeed) => {
  this.currentSpeed = newSpeed;
  if (this.rafId === null && newSpeed !== 0) { requestAnimationFrame(this.render); }
  if (this.rafId !== null && newSpeed === 0) { cancelAnimationFrame(...); this.rafId = null; }
};
```

`speed === 0`이면 rAF 루프를 **완전히 중단**한다(정적 셰이더의 상시 비용을 없애려는 최적화).
이후에는 `handleResize()`에서 캔버스 **크기가 바뀔 때만**, 혹은 `setUniforms`/`setFrame` 호출 시에만
다시 그려진다. 즉 다시 활성화해도 크기가 그대로면 화면이 갱신되지 않을 수 있다.

**해결**: 정지가 필요하면 0 대신 아주 작은 값(예: `0.01`)을 주거나, 컴포넌트를 언마운트한다.

## 후속: WebGL 렌더링 검증 방법

`preserveDrawingBuffer: false`(기본값)인 캔버스는 컴포지팅 후 백버퍼가 비워진다.
따라서 rAF 바깥에서 `readPixels`나 `drawImage` 샘플링을 하면 **정상 렌더 중에도 전부 0**이 나온다.
이걸 "셰이더가 안 그려진다"는 증거로 쓰면 오진한다(이번에 실제로 그랬다).

검증하려면:
- 육안 확인(스크린샷)을 우선하되, **초기화에 몇 초 여유를 준다**
- 프로그램적으로 확인할 거면 `requestAnimationFrame` 콜백 안에서 즉시 샘플링하거나,
  진단 목적으로만 `webGlContextAttributes={{ preserveDrawingBuffer: true }}`를 넘긴다
