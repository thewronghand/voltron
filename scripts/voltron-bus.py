#!/usr/bin/env python3
"""voltron-bus (personal) — inter-session 와치 레이어 / 개인 프로젝트판.

voltron(회사)판을 voltron-personal 환경에 맞게 정제한 사본. 로직은 회사판과
동일하게 유지(향후 동기화 비용 최소화)하고, 상단 설정 블록만 personal로 교체했다.

회사판과의 차이:
  - 채널이 personal 단일(port 9474). 회사 채널(9473)은 다루지 않는다.
  - sessions 경로 = ~/dev/voltron-personal/sessions (회사 일지와 격리).
  - registry = registry-personal.json (회사 registry와 분리).
  - 연결명에 티켓 번호가 없다(개인 프로젝트는 redmine 티켓 없음). 컨벤션은 CLAUDE.md 참조.

inter-session 플러그인(yilunzhang/claude-code-inter-session)은 한 줄도 수정하지 않는다.

단일 진실 소스:
  - status(완료/진행) = sessions/{ongoing,completed}/<연결명>.md 의 위치
  - 연결명 ↔ cmux 세션 매핑 = registry-personal.json (connect 시점에 기록)
  - cmux 세션 메타(sessionId·cwd·pid) = ~/.cmuxterm/claude-hook-sessions.json (cmux가 자동 기록)
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

# inter-session/cmux 세션 id는 UUID 형식. revive·resume에 쓰기 전 검증한다.
UUID_RE = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
NAME_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,39}$")

# ── 경로/상수 ──────────────────────────────────────────────────────────

PERSONAL_ROOT = Path.home() / "dev" / "voltron-personal"
SESSIONS_DIR = PERSONAL_ROOT / "sessions"

PLUGIN_BIN = (
    Path.home()
    / ".claude" / "plugins" / "marketplaces" / "inter-session"
    / "skills" / "inter-session" / "bin"
)
# 플러그인은 websockets를 전용 venv에 깔아둔다. 시스템 python엔 없을 수 있음.
PLUGIN_VENV_PY = Path.home() / ".claude" / "data" / "inter-session" / "venv" / "bin" / "python3"

# registry는 회사판과 분리 (registry-personal.json). 매핑 캐시가 섞이지 않도록.
DATA_DIR = Path.home() / ".claude" / "data" / "voltron-bus"
REGISTRY_PATH = DATA_DIR / "registry-personal.json"

CLIENTS_DIR = Path.home() / ".claude" / "data" / "inter-session" / "clients"

CMUX_HOOK_SESSIONS = Path.home() / ".cmuxterm" / "claude-hook-sessions.json"
CMUX_BIN = os.environ.get(
    "CMUX_CLAUDE_HOOK_CMUX_BIN", "/Applications/cmux.app/Contents/Resources/bin/cmux"
)

# 채널 = 포트. 개인 프로젝트판은 personal 단일 채널(9474)만 다룬다.
CHANNELS = {
    "voltron-personal": {"port": 9474, "root": PERSONAL_ROOT},
}
DEFAULT_CHANNEL = "voltron-personal"


# ── 유틸 ───────────────────────────────────────────────────────────────

def _plugin_python() -> str:
    """플러그인 bin을 돌릴 python. venv가 있으면 그걸, 없으면 시스템."""
    if PLUGIN_VENV_PY.exists():
        return str(PLUGIN_VENV_PY)
    return sys.executable


def channel_for_cwd(cwd: str | None = None) -> str:
    """개인 프로젝트판은 personal 단일 채널이라 항상 voltron-personal."""
    return DEFAULT_CHANNEL


def port_for_channel(channel: str) -> int:
    return CHANNELS[channel]["port"]


# 워크트리 = 코드 디렉토리에 -2, -3 접미사 (예: monify-frontend-2).
# 접미사 없는 메인 워크트리는 1. -workflow 등 코드 아닌 디렉토리는 매칭 안 됨.
_WORKTREE_RE = re.compile(r"-(\d+)$")


def worktree_num(cwd: str | None) -> int:
    """cwd 경로 세그먼트에서 워크트리 번호를 추출. 없으면 1(메인 워크트리).

    연결명은 작업(티켓) 정체성이라 워크트리 번호를 넣지 않는다. 대신 점유 중인
    워크트리는 cwd에 이미 들어있으므로, 표시 시점에 여기서 뽑아 보여준다.
    """
    if not cwd:
        return 1
    for seg in reversed(Path(cwd).parts):
        m = _WORKTREE_RE.search(seg)
        if m:
            return int(m.group(1))
    return 1


def _load_json(path: Path) -> dict:
    """JSON 객체를 읽는다. 최상위가 객체가 아니거나 깨지면 빈 dict."""
    try:
        data = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def load_registry() -> dict:
    reg = _load_json(REGISTRY_PATH)
    return reg if isinstance(reg, dict) else {}


def save_registry(reg: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = REGISTRY_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(reg, ensure_ascii=False, indent=2))
    os.chmod(tmp, 0o600)
    tmp.replace(REGISTRY_PATH)


def _pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        return False


def live_sessions_by_port() -> dict[int, list[dict]]:
    """clients/*.session 을 직접 스캔해 listener가 살아있는 세션만 port별로 묶는다.

    list.py는 현재 세션 상태파일에서만 포트를 읽어 임의 채널 조회가 안 되므로,
    채널(=port)별 라이브 세션은 .session 파일을 직접 읽는 게 정확하다.
    stale 항목(listener_pid 죽음)은 제외한다.
    """
    out: dict[int, list[dict]] = {}
    if not CLIENTS_DIR.is_dir():
        return out
    seen: set[tuple[int, str]] = set()
    for f in CLIENTS_DIR.glob("*.session"):
        d = _load_json(f)
        if not d:
            continue
        pid = int(d.get("listener_pid", 0) or 0)
        if not _pid_alive(pid):
            continue
        port = int(d.get("port", 0) or 0)
        name = d.get("name", "") or "(unnamed)"
        key = (port, name)
        if key in seen:
            continue
        seen.add(key)
        out.setdefault(port, []).append({"name": name, "pid": pid, "label": d.get("label", "")})
    return out


def cmux_session_for_workspace(workspace_id: str) -> str | None:
    """CMUX_WORKSPACE_ID → 현재 활성 Claude sessionId 역조회."""
    data = _load_json(CMUX_HOOK_SESSIONS)
    active = data.get("activeSessionsByWorkspace", {})
    entry = active.get(workspace_id)
    if isinstance(entry, dict):
        return entry.get("sessionId")
    return None


def cmux_session_meta(session_id: str) -> dict | None:
    """sessionId → {cwd, pid, launchCommand, isRestorable, ...} 조회."""
    data = _load_json(CMUX_HOOK_SESSIONS)
    sessions = data.get("sessions", {})
    meta = sessions.get(session_id)
    return meta if isinstance(meta, dict) else None


# ── sessions/ 일지 ─────────────────────────────────────────────────────

def list_journal(status: str) -> list[str]:
    """ongoing/completed 폴더의 연결명(파일 stem) 목록."""
    d = SESSIONS_DIR / status
    if not d.is_dir():
        return []
    return sorted(p.stem for p in d.glob("*.md") if p.name != "README.md")


def journal_path(name: str) -> tuple[Path | None, str | None]:
    """연결명으로 md 파일과 현재 status를 찾는다."""
    for status in ("ongoing", "completed"):
        p = SESSIONS_DIR / status / f"{name}.md"
        if p.exists():
            return p, status
    return None, None


# ── 플러그인 bin 호출 ──────────────────────────────────────────────────

def run_plugin(script: str, args: list[str], env_extra: dict | None = None) -> int:
    env = os.environ.copy()
    if env_extra:
        env.update(env_extra)
    cmd = [_plugin_python(), str(PLUGIN_BIN / script), *args]
    return subprocess.call(cmd, env=env)


def capture_plugin(script: str, args: list[str], env_extra: dict | None = None) -> str:
    env = os.environ.copy()
    if env_extra:
        env.update(env_extra)
    cmd = [_plugin_python(), str(PLUGIN_BIN / script), *args]
    try:
        return subprocess.check_output(cmd, env=env, text=True, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as e:
        return e.output or ""


# ── 서브커맨드 ─────────────────────────────────────────────────────────

def cmd_channel(args) -> int:
    """현재(또는 지정) cwd의 채널과 포트를 출력."""
    ch = channel_for_cwd(args.cwd)
    print(f"channel={ch} port={port_for_channel(ch)} cwd={args.cwd or os.getcwd()}")
    return 0


def cmd_connect(args) -> int:
    """현재 세션을 채널 버스에 연결하고 registry에 연결명↔cmux세션을 기록.

    실제 모니터 기동은 inter-session 스킬(Monitor 도구)이 담당하므로,
    이 명령은 (1) 채널/포트 결정 (2) registry 기록 (3) 모니터 커맨드 출력
    까지만 한다. 출력된 커맨드를 호출자(에이전트)가 Monitor로 띄운다.
    """
    name = args.name
    if not NAME_RE.match(name):
        print(f"invalid name: {name!r} (소문자/숫자/하이픈, 40자 이내)", file=sys.stderr)
        return 1

    cwd = os.getcwd()
    channel = args.channel or channel_for_cwd(cwd)
    if channel not in CHANNELS:
        print(f"unknown channel: {channel}", file=sys.stderr)
        return 1
    port = port_for_channel(channel)

    workspace_id = os.environ.get("CMUX_WORKSPACE_ID", "")
    session_id = cmux_session_for_workspace(workspace_id) if workspace_id else None

    reg = load_registry()
    reg[name] = {
        "channel": channel,
        "port": port,
        "cwd": cwd,
        "workspaceId": workspace_id,
        "sessionId": session_id,
    }
    save_registry(reg)

    # 모니터로 띄울 커맨드(플러그인 client.py). 채널 포트와 이름·라벨을 주입.
    label = args.label or ""
    monitor_cmd = (
        f"{shlex.quote(_plugin_python())} {shlex.quote(str(PLUGIN_BIN / 'client.py'))} "
        f"--port {port} --name {shlex.quote(name)}"
    )
    if label:
        monitor_cmd += f" --label {shlex.quote(label)}"

    print(f"# registry 기록 완료: {name} → channel={channel} port={port} sessionId={session_id}")
    print("# 아래 커맨드를 Monitor 도구로 띄우세요 (inter-session 모니터):")
    print(monitor_cmd)
    return 0


def cmd_list(args) -> int:
    """버스 라이브 세션 + sessions/ 일지를 채널·status별로 병합 출력."""
    reg = load_registry()
    by_port = live_sessions_by_port()

    # 일지 status 인덱스 (연결명 → ongoing/completed)
    status_of = {n: "ongoing" for n in list_journal("ongoing")}
    status_of.update({n: "completed" for n in list_journal("completed")})

    print("══ Voltron Bus (personal) ══\n")
    for channel, info in CHANNELS.items():
        port = info["port"]
        print(f"▌ 채널: {channel} (port {port})")
        live = by_port.get(port, [])
        if live:
            print("  [라이브]")
            for s in sorted(live, key=lambda x: x["name"]):
                lbl = f'  "{s["label"]}"' if s["label"] else ""
                st = status_of.get(s["name"])
                # 완료인데 아직 버스에 붙어있으면 노이즈로 표시.
                tag = " ⚠️완료(미정리)" if st == "completed" else (" 🔵" if st == "ongoing" else "")
                # 점유 워크트리는 연결명이 아니라 registry의 cwd에서 뽑아 표시.
                cwd = reg.get(s["name"], {}).get("cwd")
                wt = f"  wt{worktree_num(cwd)}" if cwd else ""
                print(f"    - {s['name']}{wt}{lbl}{tag}")
        else:
            print("  [라이브] (없음)")
        print()

    # sessions/ 일지 (status 소스)
    print("▌ 일지 (sessions/)")
    ongoing = list_journal("ongoing")
    completed = list_journal("completed")
    print(f"  🔵 ongoing ({len(ongoing)}):")
    for n in ongoing:
        ch = reg.get(n, {}).get("channel", "?")
        print(f"    - {n}  [{ch}]")
    print(f"  ✅ completed ({len(completed)}):  ← 재부팅 후 자동 부활 안 함")
    for n in completed:
        print(f"    - {n}")
    return 0


def _resume_one(name: str, reg: dict, focus: bool) -> bool:
    """연결명 하나를 cmux로 부활. registry/cmux 메타에서 cwd·sessionId를 끌어온다."""
    entry = reg.get(name, {})
    session_id = entry.get("sessionId")
    cwd = entry.get("cwd")

    # registry에 sessionId가 없으면 cmux 메타에서 cwd로 보강 시도는 생략(불확실).
    if not session_id or not cwd:
        print(f"  ✗ {name}: registry에 sessionId/cwd 없음 (connect 안 거친 세션)")
        return False
    if not UUID_RE.match(session_id):
        print(f"  ✗ {name}: sessionId 형식 이상 ({session_id!r}) — 부활 중단")
        return False

    meta = cmux_session_meta(session_id)
    if meta and not meta.get("isRestorable", True):
        print(f"  ✗ {name}: cmux가 복원 불가로 표시 (isRestorable=false)")
        return False

    # cmux가 --command를 터미널에 타이핑(text+Enter)하므로 셸 안전하게 quote.
    resume_cmd = f"claude --resume {shlex.quote(session_id)}"
    rc = subprocess.call([
        CMUX_BIN, "new-workspace",
        "--name", name,
        "--cwd", cwd,
        "--command", resume_cmd,
        "--focus", "true" if focus else "false",
    ])
    if rc == 0:
        print(f"  ✓ {name}: cmux 워크스페이스 부활 (cwd={cwd}, resume={session_id[:8]})")
        return True
    print(f"  ✗ {name}: cmux new-workspace 실패 (rc={rc})")
    return False


def cmd_revive(args) -> int:
    """지정한 연결명(들)을 cmux로 부활. completed도 명시하면 부활한다."""
    reg = load_registry()
    ok = 0
    for name in args.names:
        if _resume_one(name, reg, focus=args.focus):
            ok += 1
    print(f"\n부활 완료: {ok}/{len(args.names)}")
    return 0 if ok == len(args.names) else 1


def cmd_revive_ongoing(args) -> int:
    """ongoing 일지의 모든 세션을 cmux로 일괄 부활. completed는 건드리지 않는다."""
    reg = load_registry()
    names = list_journal("ongoing")
    if not names:
        print("ongoing 세션 없음.")
        return 0
    print(f"ongoing {len(names)}개 부활 시도 (completed는 제외):")
    ok = 0
    for name in names:
        if _resume_one(name, reg, focus=False):
            ok += 1
    print(f"\n부활 완료: {ok}/{len(names)}")
    return 0 if ok == len(names) else 1


def cmd_done(args) -> int:
    """ongoing → completed 이동. status 변경 = 부활 정책 변경(자동부활 제외)."""
    name = args.name
    src = SESSIONS_DIR / "ongoing" / f"{name}.md"
    if not src.exists():
        print(f"ongoing에 {name}.md 없음.", file=sys.stderr)
        return 1
    dst = SESSIONS_DIR / "completed" / f"{name}.md"
    dst.parent.mkdir(parents=True, exist_ok=True)
    src.rename(dst)
    print(f"✓ {name}: ongoing → completed 이동. (재부팅 후 자동부활 대상에서 제외됨)")
    print("  ※ README 보드 갱신과 상태 라인 수정은 별도로 처리하세요.")
    return 0


def cmd_reconnect(args) -> int:
    """현재(재개된) 세션을 제 채널·이름으로 버스에 다시 붙이는 모니터 커맨드 출력.

    SessionStart 훅 또는 수동 호출에서 쓴다. completed 세션이면 skip한다.
    registry에서 현재 cmux sessionId에 해당하는 연결명을 역조회한다.
    """
    workspace_id = os.environ.get("CMUX_WORKSPACE_ID", "")
    session_id = cmux_session_for_workspace(workspace_id) if workspace_id else None

    reg = load_registry()
    # 현재 세션의 연결명 역조회: sessionId 우선, 없으면 cwd 매칭.
    name = None
    for n, e in reg.items():
        if session_id and e.get("sessionId") == session_id:
            name = n
            break
    if not name:
        cwd = os.getcwd()
        matches = [n for n, e in reg.items() if e.get("cwd") == cwd]
        if len(matches) > 1:
            print(f"# ⚠️ cwd={cwd} 에 연결명 후보 여러 개: {matches}. 첫 번째 사용.", file=sys.stderr)
        if matches:
            name = matches[0]

    if not name:
        print("# 이 세션의 연결명을 registry에서 찾지 못함. 먼저 connect 하세요.", file=sys.stderr)
        return 1

    _, status = journal_path(name)
    if status == "completed":
        print(f"# {name}: completed 세션 → 버스 재연결 skip (자동부활 정책)")
        return 0

    entry = reg[name]
    channel = entry.get("channel") or channel_for_cwd(entry.get("cwd"))
    port = entry.get("port") or port_for_channel(channel)
    monitor_cmd = (
        f"{shlex.quote(_plugin_python())} {shlex.quote(str(PLUGIN_BIN / 'client.py'))} "
        f"--port {port} --name {shlex.quote(name)}"
    )
    print(f"# {name} (channel={channel}, status={status or 'ongoing'}) 재연결 커맨드:")
    print(monitor_cmd)
    return 0


def cmd_send(args) -> int:
    """채널을 의식한 send. 대상 연결명의 채널 포트로 메시지 전송."""
    reg = load_registry()
    entry = reg.get(args.to, {})
    port = entry.get("port")
    if port is None:
        # 대상이 registry에 없으면 현재 cwd 채널로 가정.
        port = port_for_channel(channel_for_cwd())
    return run_plugin(
        "send.py", [args.to, args.text],
        env_extra={"INTER_SESSION_PORT": str(port)},
    )


# ── 엔트리포인트 ───────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="voltron-bus", description="inter-session 와치 레이어")
    sub = p.add_subparsers(dest="command", required=True)

    sp = sub.add_parser("channel", help="현재 cwd의 채널/포트 출력")
    sp.add_argument("--cwd", default=None)
    sp.set_defaults(func=cmd_channel)

    sp = sub.add_parser("connect", help="세션을 채널 버스에 연결(registry 기록 + 모니터 커맨드 출력)")
    sp.add_argument("name", help="연결명 (프로젝트-티켓-작업명)")
    sp.add_argument("--channel", default=None, help="채널 강제 지정 (기본: cwd 자동판별)")
    sp.add_argument("--label", default="", help="라벨")
    sp.set_defaults(func=cmd_connect)

    sp = sub.add_parser("list", help="버스 라이브 + sessions/ 일지 병합 출력")
    sp.set_defaults(func=cmd_list)

    sp = sub.add_parser("send", help="채널 인식 메시지 전송")
    sp.add_argument("to")
    sp.add_argument("text")
    sp.set_defaults(func=cmd_send)

    sp = sub.add_parser("revive", help="지정 연결명(들)을 cmux로 부활")
    sp.add_argument("names", nargs="+")
    sp.add_argument("--focus", action="store_true")
    sp.set_defaults(func=cmd_revive)

    sp = sub.add_parser("revive-ongoing", help="ongoing 일지 전체를 일괄 부활 (completed 제외)")
    sp.set_defaults(func=cmd_revive_ongoing)

    sp = sub.add_parser("done", help="ongoing → completed 이동 (자동부활 제외)")
    sp.add_argument("name")
    sp.set_defaults(func=cmd_done)

    sp = sub.add_parser("reconnect", help="현재 세션 재연결 커맨드 출력 (completed면 skip)")
    sp.set_defaults(func=cmd_reconnect)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
