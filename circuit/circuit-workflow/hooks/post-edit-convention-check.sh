#!/bin/bash
# PostToolUse(Edit|Write) — circuit 컨벤션 위반 경고.
# exit 0 + stderr 출력 = 차단하지 않고 Claude에게 경고만 전달.

file="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

case "$file" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# 1. any 타입
if grep -nE '(:|<)\s*any\b|\bas any\b' "$file" >/dev/null 2>&1; then
  echo "⚠️  any 타입 발견: $file" >&2
  grep -nE '(:|<)\s*any\b|\bas any\b' "$file" >&2
  echo "→ unknown 또는 구체 타입으로 교체하세요 (Critical Rule 1)." >&2
fi

# 2. 상위 상대경로 import
if grep -nE "from\s+['\"]\.\./" "$file" >/dev/null 2>&1; then
  echo "⚠️  상위 상대경로 import 발견: $file" >&2
  grep -nE "from\s+['\"]\.\./" "$file" >&2
  echo "→ 절대경로 @/ 로 교체하세요 (Critical Rule 2)." >&2
fi

# 3. registry.ts에서 lazy 없는 Scene import
case "$file" in
  *src/posts/registry.ts)
    if grep -nE '^\s*import .*Scene' "$file" >/dev/null 2>&1; then
      echo "⚠️  registry.ts에 정적 Scene import 발견 — lazy()를 쓰세요 (Critical Rule 3)." >&2
      grep -nE '^\s*import .*Scene' "$file" >&2
    fi
    ;;
esac

exit 0
