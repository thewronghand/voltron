#!/bin/bash
# PostToolUse(Edit|Write) — shipping-a-button 컨벤션 위반 경고.
# exit 0 + stderr 출력 = 차단하지 않고 Claude에게 경고만 전달.
# 다언어 프로젝트지만 지금은 TS 규칙만 검사한다. 다른 언어 규칙은 실제로 어겨졌을 때 추가.

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
  echo "→ unknown 또는 구체 타입으로 교체하세요 (Critical Rule 6)." >&2
fi

# 2. 상위 상대경로 import
if grep -nE "from\s+['\"]\.\./" "$file" >/dev/null 2>&1; then
  echo "⚠️  상위 상대경로 import 발견: $file" >&2
  grep -nE "from\s+['\"]\.\./" "$file" >&2
  echo "→ 절대경로 @/ 로 교체하세요 (Critical Rule 6)." >&2
fi

exit 0
