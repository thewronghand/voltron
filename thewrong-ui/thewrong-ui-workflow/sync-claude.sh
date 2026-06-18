#!/bin/bash
# voltron-personal 정본 → 코드 레포 .claude/ 동기화
#
# CLAUDE.md는 복사하지 않는다 — 코드 레포가 컨테이너(thewrong-ui/) 안에 물리적으로
# 중첩돼 있어 상위 CLAUDE.md(컨테이너 → voltron-personal → ~/.claude)가 자동 상속되기 때문.
# .claude/(agents·commands·hooks·settings)는 자동 상속이 안 되므로 코드 레포 루트에 복사한다.
set -e

WORKFLOW_DIR="$(cd "$(dirname "$0")" && pwd)"           # .../thewrong-ui/thewrong-ui-workflow
CONTAINER_DIR="$(cd "$WORKFLOW_DIR/.." && pwd)"          # .../thewrong-ui
VP_ROOT="$(cd "$CONTAINER_DIR/.." && pwd)"              # voltron-personal
CODE_REPO="${1:-$CONTAINER_DIR/thewrong-ui-code}"

if [ ! -d "$CODE_REPO" ]; then
  echo "❌ 코드 레포 없음: $CODE_REPO" >&2
  exit 1
fi

mkdir -p "$CODE_REPO/.claude/agents" "$CODE_REPO/.claude/commands" "$CODE_REPO/.claude/hooks"

# 공통 에이전트/커맨드 (voltron-personal 루트)
cp "$VP_ROOT/.claude/agents/"*.md "$CODE_REPO/.claude/agents/"
cp "$VP_ROOT/.claude/commands/"*.md "$CODE_REPO/.claude/commands/"

# 작업 세션용 미니 스킬 voltron-bus-spoke (허브 전용 voltron-bus 스킬은 복사 안 함)
# 스킬은 git 레포 루트 것만 적용되고 상속이 안 돼서, 작업 세션이 버스에 붙으려면 코드 레포에 있어야 한다.
rm -rf "$CODE_REPO/.claude/skills/voltron-bus-spoke"
mkdir -p "$CODE_REPO/.claude/skills/voltron-bus-spoke"
cp "$VP_ROOT/.claude/skills/voltron-bus-spoke/SKILL.md" "$CODE_REPO/.claude/skills/voltron-bus-spoke/"

# 프로젝트 전용 훅
cp "$WORKFLOW_DIR/hooks/"*.sh "$CODE_REPO/.claude/hooks/"
chmod +x "$CODE_REPO/.claude/hooks/"*.sh

# settings.json (훅 등록 — 경로가 .claude/hooks 상대라 레포마다 동일)
if [ -f "$WORKFLOW_DIR/settings.json" ]; then
  cp "$WORKFLOW_DIR/settings.json" "$CODE_REPO/.claude/settings.json"
fi

echo "✓ 동기화 완료 → $CODE_REPO/.claude (agents·commands·skills/voltron-bus-spoke·hooks·settings)"
echo "  CLAUDE.md는 상위 자동 상속 — 복사 안 함."
