---
name: voltron-bus
description: inter-session 버스의 voltron-personal 와치 레이어(개인 프로젝트판). personal 채널(9474) 단일, 완료/진행 폴더 관리, cmux로 죽은 세션 부활·재연결. "버스 상태 보여줘", "세션 목록", "ongoing 다시 살려줘", "이 세션 연결해줘", "완료 처리해줘" 같은 요청에 사용.
---

# voltron-bus (personal) — inter-session 와치 레이어 / 개인 프로젝트판

inter-session 플러그인을 **수정하지 않고** 개인 프로젝트 운영에 필요한 것을 얹는 wrapper.
회사판(voltron)의 정제 사본으로, **personal 채널(port 9474) 단일**만 다룬다.

- **채널**: personal 단일(9474). 회사 작업(voltron 9473)과 버스가 격리된다.
- **폴더**: `~/dev/voltron-personal/sessions/{ongoing,completed}/<연결명>.md` 가 status 소스. 완료 세션은 list에서 분리 표시.
- **재연결**: cmux 소켓으로 죽은 세션 부활(`claude --resume`). **completed는 자동 부활 제외 → 재부팅 후 RAM 절약.**

## 스크립트

```
python3 /Users/euihyeon/dev/voltron-personal/scripts/voltron-bus.py <subcommand>
```

## 회사판과의 차이 (중요)

- **티켓 없음** — 연결명은 `프로젝트-작업명` 또는 `프로젝트-chore-작업명`. redmine 티켓 번호를 넣지 않는다.
- **접두사** — `ui`(thewrong-ui) / `escapist` / `synapse` / `tarot`. 예: `synapse-rag-pipeline`, `ui-chore-deps-bump`.
- **registry** — `registry-personal.json` (회사 registry와 분리).
- **배포** — 상용 배포 개념 없음. completed 이관 기준 = "작업 마무리 + 문서 정리".

## 서브커맨드

| 명령 | 용도 |
|------|------|
| `channel` | 채널·포트 출력 (항상 voltron-personal / 9474) |
| `connect <연결명> [--label <텍스트>]` | 세션을 personal 버스에 연결. registry 기록 + 모니터 커맨드 출력. |
| `list` | 버스 라이브 세션 + sessions/ 일지 병합 출력 |
| `send <연결명> <텍스트>` | 메시지 전송 |
| `revive <연결명>...` | 지정 세션(들)을 cmux로 부활 |
| `revive-ongoing` | ongoing 일지 전체를 일괄 부활 (**completed 제외**) |
| `done <연결명>` | ongoing → completed 이동 (자동부활 제외) |
| `reconnect` | 현재 세션 재연결 커맨드 출력. completed면 skip. |

## 핵심 사용 흐름

`connect`는 registry 기록 + 모니터 커맨드 출력까지만 한다. **출력된 커맨드를 Monitor 도구로 띄워야** 실제 버스에 붙는다.

```
python3 .../voltron-bus.py connect synapse-rag-pipeline --label "RAG 개선"
# → 출력된 client.py 커맨드를 Monitor로 실행
```

연결 후 허브는 `sessions/ongoing/synapse-rag-pipeline.md` 를 생성한다.

### 워크트리 표시
점유 워크트리는 cwd에서 자동 추출돼 `wt2`처럼 list에 표시된다(전제: `<코드디렉토리>-N` 패턴). 연결명에 워크트리 번호를 넣지 않는다.

### 재부팅 후 복구
cmux `restore-session` 후 허브에서:
```
python3 .../voltron-bus.py revive-ongoing
```
ongoing 세션만 부활, completed는 제외 → RAM 절약. 개별 completed는 `revive <연결명>`.

## 주의

- inter-session 플러그인 bin은 **절대 수정하지 않는다**.
- 회사판과 **로직은 동일**하다(동기화 비용 최소화). 상단 설정 블록만 personal로 교체돼 있다. wrapper 로직을 고칠 일이 생기면 양쪽(voltron/voltron-personal)을 함께 맞춘다.
- status 단일 진실 소스는 `~/dev/voltron-personal/sessions/` 폴더.
