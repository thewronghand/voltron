---
name: voltron-bus-spoke
description: 작업 세션(스포크)이 personal 버스에 붙고 허브에 보고하는 최소 스킬. "이 세션 버스에 연결해줘", "허브에 보고해줘", "재연결" 같은 요청에 사용. 허브 관제 기능(list·revive·done)은 없음 — 그건 허브 세션의 voltron-bus 스킬 담당.
---

# voltron-bus-spoke — 작업 세션용 버스 연결 (personal)

작업 세션이 personal 채널(9474) 버스에 붙어 **허브(`personal-main`)에 보고**하기 위한 최소 스킬.
허브 관제 기능(`list`/`revive`/`revive-ongoing`/`done`)은 여기 없다 — 그건 **허브 세션의 `voltron-bus` 스킬** 담당이다. 작업 세션은 connect·reconnect·send 세 가지만 쓴다.

> 왜 별도 스킬인가: 스킬(`.claude/skills/`)은 git 레포 루트 것만 적용되고 상속이 안 된다. 작업 세션은 코드 레포(`*-code`)에서 떠서 voltron-personal 루트의 `voltron-bus` 스킬이 안 보인다. 그래서 작업 세션에 필요한 부분만 추려 이 미니 스킬을 코드 레포로 sync한다. 정본은 voltron-personal, sync-claude.sh가 복사한다.

## 스크립트

```
python3 /Users/euihyeon/dev/voltron-personal/scripts/voltron-bus.py <subcommand>
```

## 쓰는 서브커맨드 (이 셋만)

| 명령 | 용도 |
|------|------|
| `connect <연결명> [--label <텍스트>]` | 이 세션을 personal 버스에 연결. registry 기록 + 모니터 커맨드 출력. |
| `reconnect` | 현재 세션 재연결 커맨드 출력 (재부팅·재개 후). completed면 skip. |
| `send personal-main <텍스트>` | 허브에 보고. `status:` 접두사 권장. |

## 연결 흐름

작업 내용이 확정되면 사용자에게 **"이 세션을 연결할까요?"** 명시적으로 묻고, 승인되면:

```
python3 .../voltron-bus.py connect ui-modal-paint-gpu-fix --label "Modal transform-gpu 페인트 버그 수정"
# → 출력된 client.py 커맨드를 Monitor 도구(persistent)로 띄워야 실제 버스에 붙는다
```

- **연결명** = `프로젝트-작업명` (소문자/하이픈, 40자 이내, 티켓번호 없음). 접두사: `ui`/`escapist`/`synapse`/`tarot`. chore는 `프로젝트-chore-작업명`.
- 연결명에 워크트리 번호를 넣지 않는다 (점유 워크트리는 cwd에서 자동 `wt2` 표시).

## 허브 보고

작업 시작·진행·완료 시점에 허브로 status를 쏜다:

```
python3 .../voltron-bus.py send personal-main "status: <연결명> — <무슨 일 했는지 한 줄>"
```

허브(`personal-main`)가 이 보고를 Monitor로 받아 sessions/ongoing 일지를 갱신한다.

## 주의

- inter-session 플러그인 bin은 **절대 수정하지 않는다**.
- 허브 명령(`list`/`revive-ongoing`/`done`)은 작업 세션이 쓰지 않는다 — 필요하면 허브에 보고해서 허브가 처리하게 한다.
