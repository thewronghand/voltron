#!/bin/bash
# PostToolUse(Edit|Write) — voltron-personal의 .claude 자산을 편집하면 코드 레포로 자동 sync.
#
# 트리거 대상:
#   - 공통 자산:     .claude/agents/*, .claude/commands/*  → 모든 프로젝트 sync
#   - 프로젝트 자산: <project>/<project>-workflow/{hooks/*, settings.json} → 해당 프로젝트만 sync
# 그 외 파일은 무시 (침묵).

file="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
[ -z "$file" ] && exit 0

VP_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

run_sync() {  # $1 = sync-claude.sh 경로
  [ -f "$1" ] && bash "$1" 2>&1 | sed 's/^/  /'
}

case "$file" in
  # 공통 에이전트/커맨드 변경 → 모든 워크플로 sync
  *"/.claude/agents/"*|*"/.claude/commands/"*)
    echo "↻ 공통 자산 변경 — 전체 프로젝트 sync"
    for s in "$VP_ROOT"/*/*-workflow/sync-claude.sh; do
      [ -f "$s" ] && run_sync "$s"
    done
    ;;
  # 특정 워크플로의 hooks/settings 변경 → 그 프로젝트만 sync
  *"-workflow/hooks/"*|*"-workflow/settings.json")
    wf_dir="${file%%-workflow/*}-workflow"
    echo "↻ $(basename "$(dirname "$wf_dir")") 자산 변경 — 해당 프로젝트 sync"
    run_sync "$wf_dir/sync-claude.sh"
    ;;
  *) exit 0 ;;
esac
exit 0
