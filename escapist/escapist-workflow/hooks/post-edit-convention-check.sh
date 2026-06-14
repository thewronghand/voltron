#!/bin/bash
# PostToolUse(Edit|Write) — escapist 컨벤션 위반 감지 + 자가 교정 안내
# 통과 시 침묵, 위반 시 stderr에 구체 fix. exit 2로 다음 수정에서 교정 유도.
# (PostToolUse exit 2는 이미 적용된 편집을 되돌리진 못함 — "다음 행동 교정" 용도)

file="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
if [ -z "$file" ] || [ ! -f "$file" ]; then
  exit 0
fi
if [[ ! "$file" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

violations=""

# 1. 폴더 경계를 넘는 상대경로 import (../). 같은 폴더 형제(./types 등)는 허용.
parent_imports=$(grep -nE "^import .* from ['\"]\.\./" "$file" 2>/dev/null || true)
if [ -n "$parent_imports" ]; then
  violations+="❌ 폴더 경계를 넘는 상대경로 import(../) 발견. 규칙: 폴더 밖 참조는 \`@/\` 절대경로\n"
  violations+="$(echo "$parent_imports" | sed 's/^/  /')\n"
  violations+="→ \`@/components/...\`, \`@/hooks\`, \`@/lib/...\` 로 교체. (같은 폴더 형제 \`./types\`는 OK)\n\n"
fi

# 2. any 타입 (: any / <any> / as any).
any_usage=$(grep -nE "(:[[:space:]]*any[[:space:]]*[,;)>=]|<any>|as any\b)" "$file" 2>/dev/null || true)
if [ -n "$any_usage" ]; then
  violations+="❌ \`any\` 타입 사용 발견. 규칙: \`any\` 금지 — \`unknown\` 또는 구체 타입\n"
  violations+="$(echo "$any_usage" | sed 's/^/  /')\n"
  violations+="→ 외부 입력은 \`unknown\` + 타입 가드, 내부 타입은 명시.\n\n"
fi

# 3. Claude CLI 응답 직접 JSON.parse 경고 — parseClaudeJson 경유해야 함
raw_parse=$(grep -nE "JSON\.parse\(" "$file" 2>/dev/null | grep -iE "result|claude|response|stdout" || true)
if [ -n "$raw_parse" ]; then
  violations+="⚠️ Claude 응답으로 보이는 값에 JSON.parse 직접 호출. 규칙: \`parseClaudeJson()\` 경유 (코드블록 감싸짐 대응)\n"
  violations+="$(echo "$raw_parse" | sed 's/^/  /')\n\n"
fi

if [ -n "$violations" ]; then
  echo -e "$violations" >&2
  exit 2
fi
exit 0
