#!/bin/bash
# voltron-personal 정본 → 코드 레포 .claude/ 동기화
#
# CLAUDE.md는 복사하지 않는다 — 코드 레포가 컨테이너(synapse/) 안에 물리적으로
# 중첩돼 있어 상위 CLAUDE.md(컨테이너 → voltron-personal → ~/.claude)가 자동 상속되기 때문.
# .claude/(agents·commands·hooks·settings)는 자동 상속이 안 되므로 코드 레포 루트에 복사한다.
#
# synapse는 코드 레포가 한 단계 더 중첩됨: synapse/synapse-code/synapse/ (앱 본체).
# 훅이 동작해야 하는 곳은 git 레포 루트이자 앱 루트인 synapse-code/synapse.
set -e

WORKFLOW_DIR="$(cd "$(dirname "$0")" && pwd)"           # .../synapse/synapse-workflow
CONTAINER_DIR="$(cd "$WORKFLOW_DIR/.." && pwd)"          # .../synapse
VP_ROOT="$(cd "$CONTAINER_DIR/.." && pwd)"              # voltron-personal
CODE_REPO="${1:-$CONTAINER_DIR/synapse-code/synapse}"   # 앱 본체 (git 루트)

if [ ! -d "$CODE_REPO" ]; then
  echo "❌ 코드 레포 없음: $CODE_REPO" >&2
  exit 1
fi

mkdir -p "$CODE_REPO/.claude/agents" "$CODE_REPO/.claude/commands" "$CODE_REPO/.claude/hooks"

# 공통 에이전트/커맨드 (voltron-personal 루트)
cp "$VP_ROOT/.claude/agents/"*.md "$CODE_REPO/.claude/agents/"
cp "$VP_ROOT/.claude/commands/"*.md "$CODE_REPO/.claude/commands/"

# 프로젝트 전용 훅
cp "$WORKFLOW_DIR/hooks/"*.sh "$CODE_REPO/.claude/hooks/"
chmod +x "$CODE_REPO/.claude/hooks/"*.sh

# settings.json (훅 등록 — 경로가 .claude/hooks 상대라 레포마다 동일)
if [ -f "$WORKFLOW_DIR/settings.json" ]; then
  cp "$WORKFLOW_DIR/settings.json" "$CODE_REPO/.claude/settings.json"
fi

echo "✓ 동기화 완료 → $CODE_REPO/.claude (agents·commands·hooks·settings)"
echo "  CLAUDE.md는 상위 자동 상속 — 복사 안 함."
