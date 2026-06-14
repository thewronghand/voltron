#!/bin/bash
# PostToolUse(Edit|Write) — ts/tsx 편집 후 타입 체크. 에러만 노출(상위 20줄).
# escapist는 client/server 분리 구조 — 편집된 파일 경로로 워크스페이스를 판별해 해당 쪽만 체크.
file="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
if [[ ! "$file" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

if [[ "$file" == *"/server/"* ]]; then
  ( cd "$CLAUDE_PROJECT_DIR/server" 2>/dev/null && npx tsc --noEmit 2>&1 | head -20 )
elif [[ "$file" == *"/client/"* ]]; then
  ( cd "$CLAUDE_PROJECT_DIR/client" 2>/dev/null && npx tsc --noEmit 2>&1 | head -20 )
fi
