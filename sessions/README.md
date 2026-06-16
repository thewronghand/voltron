# voltron-personal 세션 총괄 일지

개인 프로젝트 허브 세션이 관리하는 작업 세션 일지. inter-session 버스(personal 채널, port 9474)에 붙은 각 작업 세션의 **총괄에 필요한 최소 정보**만 기록한다.

> 목적: 예전 작업 정보가 필요할 때 세션을 일일이 뒤지지 않기 위함. 이 폴더만 보면 뭘 했는지 파악된다.

## 구조

- `ongoing/` — 진행중 세션. 파일명 = inter-session 연결명(`프로젝트-작업명.md`)
- `completed/` — 마무리된 세션. ongoing에서 이동.
- 파일 1개 = 세션 1개.

> 이 폴더가 곧 **`voltron-bus` (personal)의 status 단일 진실 소스**다. ongoing↔completed 위치가 "재부팅 후 자동부활 정책"을 결정한다 (completed는 자동부활 제외 → RAM 절약). `voltron-bus done <연결명>` 으로 이동하고, `voltron-bus list` 가 라이브 버스와 이 폴더를 병합해 보여준다.

## 회사판(voltron)과의 차이

- **티켓 없음** — 개인 프로젝트는 redmine 티켓이 없다. 연결명은 `프로젝트-작업명` 또는 `프로젝트-chore-작업명`.
- **접두사** — `ui`(thewrong-ui) / `escapist` / `synapse` / `tarot`.
- **채널** — personal 단일(9474). 회사 채널과 격리.
- **배포** — 상용 배포 개념이 없다(npm publish 등). completed 이관 기준은 "작업 마무리 + 문서 정리".

## 기록 항목 (세션 md)

총괄에 필요한 최소만. 상세 구현은 각 프로젝트의 `*-workflow/`(cookbook·lessons·why-tho)에 있으므로 여기엔 **포인터만**.

- **프로젝트 / 요약** — 한 줄씩
- **상태** — ongoing / completed
- **브랜치·커밋** — 핵심 커밋 해시
- **블로커 / 잔여 항목**
- **참조** — cookbook/lesson 위치 등

## 운영 흐름

1. 작업 세션이 버스에 연결 + 작업 확정 → 허브가 `ongoing/<연결명>.md` 생성
2. 진행 보고(`status:`) 들어오면 허브가 해당 md 갱신
3. 작업 마무리 + 문서 정리 `done:` → 허브가 `completed/`로 이동, README 보드 갱신

---

## 현재 보드

### 🔵 Ongoing

| 세션 | 프로젝트 | 요약 |
|------|----------|------|
| _(없음)_ | | |

### ✅ Completed

| 세션 | 프로젝트 | 요약 |
|------|----------|------|
| _(없음)_ | | |
