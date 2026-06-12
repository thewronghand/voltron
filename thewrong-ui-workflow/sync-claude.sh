#!/bin/bash
# voltron-personal 정본 → thewrong-ui 코드 레포 .claude/ 동기화
# 정본은 여기(voltron-personal). 코드 레포의 .claude/는 사본(gitignore).
set -e

WORKFLOW_DIR="$(cd "$(dirname "$0")" && pwd)"
VP_ROOT="$(cd "$WORKFLOW_DIR/.." && pwd)"
CODE_REPO="${1:-$VP_ROOT/thewrong-ui}"

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

# settings.json은 코드 레포에 직접 둔다(훅 등록 — 레포마다 경로가 .claude/hooks 상대라 동일).
# 정본 settings는 workflow에 보관하고 복사.
if [ -f "$WORKFLOW_DIR/settings.json" ]; then
  cp "$WORKFLOW_DIR/settings.json" "$CODE_REPO/.claude/settings.json"
fi

# 프로젝트 CLAUDE.md (정본은 workflow). 코드 레포에 깔아 계층 상속 체인을 완성한다:
#   voltron-personal/CLAUDE.md (공통) → thewrong-ui/CLAUDE.md (프로젝트)
# 코드 레포의 CLAUDE.md는 gitignore라 publish/공개 대상 아님.
cp "$WORKFLOW_DIR/CLAUDE.md" "$CODE_REPO/CLAUDE.md"

echo "✓ 동기화 완료 → $CODE_REPO (.claude + CLAUDE.md)"
echo "  (정본: $VP_ROOT)"
