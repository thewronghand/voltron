#!/bin/bash
# PostToolUse(Edit|Write) — synapse 컨벤션 위반 감지 + 자가 교정 안내
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
  violations+="→ \`@/components/...\`, \`@/lib/...\` 로 교체. (같은 폴더 형제 \`./types\`는 OK)\n\n"
fi

# 2. any 타입 (: any / <any> / as any).
any_usage=$(grep -nE "(:[[:space:]]*any[[:space:]]*[,;)>=]|<any>|as any\b)" "$file" 2>/dev/null || true)
if [ -n "$any_usage" ]; then
  violations+="❌ \`any\` 타입 사용 발견. 규칙: \`any\` 금지 — \`unknown\` 또는 구체 타입\n"
  violations+="$(echo "$any_usage" | sed 's/^/  /')\n"
  violations+="→ 외부 입력은 \`unknown\` + 타입 가드, 내부 타입은 명시.\n\n"
fi

# 3. 노트/데이터 경로 하드코딩 경고 — packaged/dev 분기를 우회하면 빌드에서 깨진다.
#    경로 분기를 정의하는 파일 자신(data-path.ts/notes-path.ts)은 예외.
case "$file" in
  *data-path.ts|*notes-path.ts) hardcoded_path="" ;;
  *) hardcoded_path=$(grep -nE "(process\.cwd\(\)|['\"]~?/Users/|/Documents/Synapse|['\"]\./notes)" "$file" 2>/dev/null || true) ;;
esac
if [ -n "$hardcoded_path" ]; then
  violations+="⚠️ 노트/데이터 경로 하드코딩 의심. 규칙: 경로는 lib/data-path.ts·notes-path.ts 경유 (packaged vs dev 분기)\n"
  violations+="$(echo "$hardcoded_path" | sed 's/^/  /')\n"
  violations+="→ getUserDataDir() / getDataFilePath() / getExportDataDir() 사용. dev에선 멀쩡해도 DMG에서 깨진다.\n\n"
fi

if [ -n "$violations" ]; then
  echo -e "$violations" >&2
  exit 2
fi
exit 0
