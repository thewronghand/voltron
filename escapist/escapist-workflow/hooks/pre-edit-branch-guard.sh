#!/bin/bash
# PreToolUse(Edit|Write) — 보호 브랜치(main/develop)에서 코드 직접 편집 차단.
# 메타 파일(.claude/, CLAUDE.md, *-workflow/, *.md 문서)은 보호 브랜치에서도 허용.
# 일회성 우회: ALLOW_DIRECT_PROTECTED=1
# exit 2 = 차단(편집 거부). stdout/stderr 메시지가 Claude에게 전달됨.

[ "${ALLOW_DIRECT_PROTECTED:-}" = "1" ] && exit 0

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
case "$branch" in
  main|develop) ;;
  *) exit 0 ;;  # 보호 브랜치 아니면 통과
esac

file="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
# 메타 파일은 보호 브랜치에서도 허용 (운영 코드와 라이프사이클이 다름)
case "$file" in
  *.claude/*|*CLAUDE.md|*-workflow/*|*.md) exit 0 ;;
esac

echo "🚫 보호 브랜치 '$branch'에서 코드 직접 편집 차단: $file" >&2
echo "→ feat/* 브랜치를 따서 작업하세요 (guides/git-workflow.md)." >&2
echo "  부득이하면 ALLOW_DIRECT_PROTECTED=1 로 일회성 우회 (신중히)." >&2
exit 2
