#!/bin/bash
# PostToolUse(Edit|Write) — thewrong-ui 컨벤션 위반 감지 + 자가 교정 안내
# 통과 시 침묵, 위반 시 stderr에 구체 fix. exit 2로 다음 수정에서 교정 유도.
# (PostToolUse exit 2는 이미 적용된 편집을 되돌리진 못함 — "다음 행동 교정" 용도)

file="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
if [ -z "$file" ] || [ ! -f "$file" ]; then
  exit 0
fi
# .ts/.tsx만
if [[ ! "$file" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

violations=""

# 1. 폴더 경계를 넘는 상대경로 import (../). 같은 폴더 형제(./types 등)는 이 라이브러리 컨벤션상 허용.
parent_imports=$(grep -nE "^import .* from ['\"]\.\./" "$file" 2>/dev/null || true)
if [ -n "$parent_imports" ]; then
  violations+="❌ 폴더 경계를 넘는 상대경로 import(../) 발견. 규칙: 폴더 밖 참조는 \`@/\` 절대경로\n"
  violations+="$(echo "$parent_imports" | sed 's/^/  /')\n"
  violations+="→ \`@/components/...\`, \`@/hooks\`, \`@/lib/...\` 로 교체. (같은 폴더 형제 \`./types\`는 OK)\n\n"
fi

# 2. any 타입 (: any / <any> / as any). table·select의 forwardRef 우회용 <T = any> 제네릭은 알려진 예외.
any_usage=$(grep -nE "(:[[:space:]]*any[[:space:]]*[,;)>=]|<any>|as any\b)" "$file" 2>/dev/null \
  | grep -vE "<T = any>|<T,? = any>" || true)
if [ -n "$any_usage" ]; then
  violations+="❌ \`any\` 타입 사용 발견. 규칙: \`any\` 금지 — \`unknown\` 또는 구체 타입\n"
  violations+="$(echo "$any_usage" | sed 's/^/  /')\n"
  violations+="→ 외부 입력은 \`unknown\` + 타입 가드, 내부 타입은 명시.\n\n"
fi

# 3. 새 컴포넌트 폴더 index.ts 누락 가능성 안내 (src/components/<name>/ 아래 파일 편집 시)
if [[ "$file" =~ src/components/([^/]+)/ ]]; then
  comp="${BASH_REMATCH[1]}"
  if [ ! -f "src/components/$comp/index.ts" ] && [[ "$comp" != "_shared" ]]; then
    violations+="⚠️ src/components/$comp/index.ts 부재. public export + src/index.ts의 \`export * from \"./components/$comp\"\` 확인.\n"
    violations+="  (빌드는 통과해도 미노출될 수 있음 — '빌드 성공 ≠ 노출')\n\n"
  fi
fi

if [ -n "$violations" ]; then
  echo -e "$violations" >&2
  exit 2
fi
exit 0
