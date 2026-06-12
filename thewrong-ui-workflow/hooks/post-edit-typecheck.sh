#!/bin/bash
# PostToolUse(Edit|Write) — ts/tsx 편집 후 타입 체크. 에러만 노출(상위 20줄).
file="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
if [[ ! "$file" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi
npx tsc --noEmit 2>&1 | head -20
